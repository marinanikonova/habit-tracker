/**
 * Stateless HTTP MCP server — JSON-RPC 2.0 over POST /api/mcp
 *
 * Auth: x-api-key header (ht_… token)
 * Protocol: MCP 2024-11-05
 *
 * Tools:
 *   Habits   : get_habits, create_habit, update_habit, delete_habit, toggle_habit_today
 *   Groups   : get_groups, create_group, delete_group
 *   Anti     : get_anti_habits, create_anti_habit, update_anti_habit,
 *              delete_anti_habit, toggle_anti_habit_today
 *   Stats    : get_summary
 */

import { NextResponse } from 'next/server'
import { ensureSchema, getData, setData } from '@/lib/db'
import { resolveUserFromApiKey } from '@/lib/apikeys'
import type { Habit, Group, AntiHabit, Frequency } from '@/lib/types'
import crypto from 'crypto'

// ── JSON-RPC types ────────────────────────────────────────────────────────────

interface RpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

interface RpcResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

function ok(id: string | number | null, result: unknown): RpcResponse {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): RpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } }
}

// MCP tool result helpers
function textContent(text: string) {
  return { content: [{ type: 'text', text }] }
}

function errorContent(text: string) {
  return { content: [{ type: 'text', text }], isError: true }
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  // ── Habits ──────────────────────────────────────────────────────────────────
  {
    name: 'get_habits',
    description: 'Get all habits for the authenticated user.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_habit',
    description: 'Create a new habit.',
    inputSchema: {
      type: 'object',
      properties: {
        name:      { type: 'string',  description: 'Habit name (required)' },
        emoji:     { type: 'string',  description: 'Emoji icon, e.g. "🏃"' },
        color:     { type: 'string',  description: 'Color name, e.g. "pink"' },
        groupId:   { type: 'string',  description: 'ID of the group to assign to' },
        frequency: {
          type: 'string',
          enum: ['daily', 'weekdays', 'weekends', 'weekly'],
          description: 'How often to track. Defaults to "daily"',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_habit',
    description: 'Update fields on an existing habit.',
    inputSchema: {
      type: 'object',
      properties: {
        id:        { type: 'string', description: 'Habit ID (required)' },
        name:      { type: 'string' },
        emoji:     { type: 'string' },
        color:     { type: 'string' },
        groupId:   { type: 'string' },
        frequency: { type: 'string', enum: ['daily', 'weekdays', 'weekends', 'weekly'] },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_habit',
    description: 'Delete a habit by ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Habit ID' } },
      required: ['id'],
    },
  },
  {
    name: 'toggle_habit_today',
    description: "Mark today as completed (or undo it) for a habit. Toggles the current state.",
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Habit ID' } },
      required: ['id'],
    },
  },

  // ── Groups ──────────────────────────────────────────────────────────────────
  {
    name: 'get_groups',
    description: 'Get all habit groups.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_group',
    description: 'Create a new habit group.',
    inputSchema: {
      type: 'object',
      properties: {
        name:  { type: 'string', description: 'Group name (required)' },
        emoji: { type: 'string', description: 'Emoji icon, e.g. "💪"' },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_group',
    description: 'Delete a group. Habits in the group will become ungrouped.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Group ID' } },
      required: ['id'],
    },
  },

  // ── Anti-habits ──────────────────────────────────────────────────────────────
  {
    name: 'get_anti_habits',
    description: 'Get all anti-habits (bad habits you want to avoid).',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_anti_habit',
    description: 'Create a new anti-habit to track something you want to stop doing.',
    inputSchema: {
      type: 'object',
      properties: {
        name:      { type: 'string', description: 'Anti-habit name (required)' },
        reason:    { type: 'string', description: 'Why you want to stop' },
        frequency: {
          type: 'string',
          enum: ['daily', 'weekdays', 'weekends', 'weekly'],
          description: 'Tracking frequency. Defaults to "daily"',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_anti_habit',
    description: 'Update an existing anti-habit.',
    inputSchema: {
      type: 'object',
      properties: {
        id:        { type: 'string', description: 'Anti-habit ID (required)' },
        name:      { type: 'string' },
        reason:    { type: 'string' },
        frequency: { type: 'string', enum: ['daily', 'weekdays', 'weekends', 'weekly'] },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_anti_habit',
    description: 'Delete an anti-habit by ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Anti-habit ID' } },
      required: ['id'],
    },
  },
  {
    name: 'toggle_anti_habit_today',
    description:
      "Record today as a failure for an anti-habit (i.e. you slipped up) — or undo it. Toggles the current state.",
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Anti-habit ID' } },
      required: ['id'],
    },
  },

  // ── Stats ────────────────────────────────────────────────────────────────────
  {
    name: 'get_summary',
    description:
      'Get a dashboard summary: today\'s progress, streaks, and weekly stats for all habits and anti-habits.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function newId(): string {
  return crypto.randomUUID()
}

/** Consecutive days (backwards from today) that a habit was completed */
function calcHabitStreak(habit: Habit): number {
  const t = today()
  let streak = 0
  const d = new Date(t + 'T12:00:00')
  for (let i = 0; i < 400; i++) {
    const ds = d.toISOString().split('T')[0]
    if (ds < habit.createdAt.split('T')[0]) break
    if (habit.completions.includes(ds)) {
      streak++
    } else {
      // Allow missing today — stop only if a past day is missing
      if (i > 0) break
    }
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Consecutive days without a failure for an anti-habit */
function calcAntiStreak(anti: AntiHabit): number {
  const t = today()
  let streak = 0
  const d = new Date(t + 'T12:00:00')
  for (let i = 0; i < 400; i++) {
    const ds = d.toISOString().split('T')[0]
    if (ds < anti.createdAt.split('T')[0]) break
    if (anti.failures.includes(ds)) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function callTool(
  name: string,
  args: Record<string, unknown>,
  userId: number,
): Promise<unknown> {
  const t = today()

  switch (name) {
    // ── Habits ────────────────────────────────────────────────────────────────

    case 'get_habits': {
      const habits = (await getData(userId, 'habits')) as Habit[]
      return textContent(JSON.stringify(habits, null, 2))
    }

    case 'create_habit': {
      if (!args.name) return errorContent('name is required')
      const habits = (await getData(userId, 'habits')) as Habit[]
      const habit: Habit = {
        id:          newId(),
        name:        String(args.name),
        emoji:       String(args.emoji ?? '✅'),
        color:       String(args.color ?? 'pink'),
        groupId:     args.groupId ? String(args.groupId) : null,
        frequency:   (args.frequency as Frequency) ?? 'daily',
        reminder:    null,
        createdAt:   new Date().toISOString(),
        completions: [],
      }
      await setData(userId, 'habits', [...habits, habit])
      return textContent(`Created habit "${habit.name}" with id ${habit.id}`)
    }

    case 'update_habit': {
      if (!args.id) return errorContent('id is required')
      const habits = (await getData(userId, 'habits')) as Habit[]
      const idx = habits.findIndex(h => h.id === String(args.id))
      if (idx === -1) return errorContent(`Habit ${args.id} not found`)
      const updated = { ...habits[idx] }
      if (args.name !== undefined)      updated.name      = String(args.name)
      if (args.emoji !== undefined)     updated.emoji     = String(args.emoji)
      if (args.color !== undefined)     updated.color     = String(args.color)
      if (args.groupId !== undefined)   updated.groupId   = args.groupId ? String(args.groupId) : null
      if (args.frequency !== undefined) updated.frequency = args.frequency as Frequency
      habits[idx] = updated
      await setData(userId, 'habits', habits)
      return textContent(`Updated habit "${updated.name}"`)
    }

    case 'delete_habit': {
      if (!args.id) return errorContent('id is required')
      const habits = (await getData(userId, 'habits')) as Habit[]
      const filtered = habits.filter(h => h.id !== String(args.id))
      if (filtered.length === habits.length) return errorContent(`Habit ${args.id} not found`)
      await setData(userId, 'habits', filtered)
      return textContent(`Deleted habit ${args.id}`)
    }

    case 'toggle_habit_today': {
      if (!args.id) return errorContent('id is required')
      const habits = (await getData(userId, 'habits')) as Habit[]
      const idx = habits.findIndex(h => h.id === String(args.id))
      if (idx === -1) return errorContent(`Habit ${args.id} not found`)
      const h = { ...habits[idx] }
      if (h.completions.includes(t)) {
        h.completions = h.completions.filter(d => d !== t)
        habits[idx] = h
        await setData(userId, 'habits', habits)
        return textContent(`Unmarked "${h.name}" for today (${t})`)
      } else {
        h.completions = [...h.completions, t]
        habits[idx] = h
        await setData(userId, 'habits', habits)
        return textContent(`Marked "${h.name}" as done today (${t}) ✓`)
      }
    }

    // ── Groups ────────────────────────────────────────────────────────────────

    case 'get_groups': {
      const groups = (await getData(userId, 'groups')) as Group[]
      return textContent(JSON.stringify(groups, null, 2))
    }

    case 'create_group': {
      if (!args.name) return errorContent('name is required')
      const groups = (await getData(userId, 'groups')) as Group[]
      const group: Group = {
        id:    newId(),
        name:  String(args.name),
        emoji: String(args.emoji ?? '📋'),
      }
      await setData(userId, 'groups', [...groups, group])
      return textContent(`Created group "${group.name}" with id ${group.id}`)
    }

    case 'delete_group': {
      if (!args.id) return errorContent('id is required')
      const groups = (await getData(userId, 'groups')) as Group[]
      const filtered = groups.filter(g => g.id !== String(args.id))
      if (filtered.length === groups.length) return errorContent(`Group ${args.id} not found`)
      await setData(userId, 'groups', filtered)
      // Ungroup habits that belonged to this group
      const habits = (await getData(userId, 'habits')) as Habit[]
      const updated = habits.map(h =>
        h.groupId === String(args.id) ? { ...h, groupId: null } : h,
      )
      await setData(userId, 'habits', updated)
      return textContent(`Deleted group ${args.id}; affected habits have been ungrouped`)
    }

    // ── Anti-habits ───────────────────────────────────────────────────────────

    case 'get_anti_habits': {
      const anti = (await getData(userId, 'anti-habits')) as AntiHabit[]
      return textContent(JSON.stringify(anti, null, 2))
    }

    case 'create_anti_habit': {
      if (!args.name) return errorContent('name is required')
      const anti = (await getData(userId, 'anti-habits')) as AntiHabit[]
      const item: AntiHabit = {
        id:        newId(),
        name:      String(args.name),
        reason:    args.reason ? String(args.reason) : null,
        frequency: (args.frequency as Frequency) ?? 'daily',
        createdAt: new Date().toISOString(),
        failures:  [],
        cleanDays: [],
      }
      await setData(userId, 'anti-habits', [...anti, item])
      return textContent(`Created anti-habit "${item.name}" with id ${item.id}`)
    }

    case 'update_anti_habit': {
      if (!args.id) return errorContent('id is required')
      const anti = (await getData(userId, 'anti-habits')) as AntiHabit[]
      const idx = anti.findIndex(a => a.id === String(args.id))
      if (idx === -1) return errorContent(`Anti-habit ${args.id} not found`)
      const updated = { ...anti[idx] }
      if (args.name !== undefined)      updated.name      = String(args.name)
      if (args.reason !== undefined)    updated.reason    = args.reason ? String(args.reason) : null
      if (args.frequency !== undefined) updated.frequency = args.frequency as Frequency
      anti[idx] = updated
      await setData(userId, 'anti-habits', anti)
      return textContent(`Updated anti-habit "${updated.name}"`)
    }

    case 'delete_anti_habit': {
      if (!args.id) return errorContent('id is required')
      const anti = (await getData(userId, 'anti-habits')) as AntiHabit[]
      const filtered = anti.filter(a => a.id !== String(args.id))
      if (filtered.length === anti.length) return errorContent(`Anti-habit ${args.id} not found`)
      await setData(userId, 'anti-habits', filtered)
      return textContent(`Deleted anti-habit ${args.id}`)
    }

    case 'toggle_anti_habit_today': {
      if (!args.id) return errorContent('id is required')
      const anti = (await getData(userId, 'anti-habits')) as AntiHabit[]
      const idx = anti.findIndex(a => a.id === String(args.id))
      if (idx === -1) return errorContent(`Anti-habit ${args.id} not found`)
      const a = { ...anti[idx] }
      if (a.failures.includes(t)) {
        a.failures = a.failures.filter(d => d !== t)
        anti[idx] = a
        await setData(userId, 'anti-habits', anti)
        return textContent(`Removed failure for "${a.name}" on ${t} (marked as clean)`)
      } else {
        a.failures = [...a.failures, t]
        anti[idx] = a
        await setData(userId, 'anti-habits', anti)
        return textContent(`Recorded failure for "${a.name}" on ${t}`)
      }
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    case 'get_summary': {
      const [habits, groups, antiHabits] = await Promise.all([
        getData(userId, 'habits')      as Promise<Habit[]>,
        getData(userId, 'groups')      as Promise<Group[]>,
        getData(userId, 'anti-habits') as Promise<AntiHabit[]>,
      ])

      const habitsDoneToday = (habits as Habit[]).filter(h =>
        (h as Habit).completions.includes(t),
      ).length

      const habitSummaries = (habits as Habit[]).map(h => ({
        id:         h.id,
        name:       h.name,
        emoji:      h.emoji,
        frequency:  h.frequency,
        group:      (groups as Group[]).find(g => g.id === h.groupId)?.name ?? null,
        doneToday:  h.completions.includes(t),
        streak:     calcHabitStreak(h),
        totalDone:  h.completions.length,
      }))

      const antiSummaries = (antiHabits as AntiHabit[]).map(a => ({
        id:          a.id,
        name:        a.name,
        frequency:   a.frequency,
        failedToday: a.failures.includes(t),
        cleanStreak: calcAntiStreak(a),
        totalFails:  a.failures.length,
      }))

      const summary = {
        today:         t,
        habits: {
          total:     (habits as Habit[]).length,
          doneToday: habitsDoneToday,
          list:      habitSummaries,
        },
        antiHabits: {
          total:           (antiHabits as AntiHabit[]).length,
          failedToday:     (antiHabits as AntiHabit[]).filter(a => a.failures.includes(t)).length,
          list:            antiSummaries,
        },
        groups: (groups as Group[]).map(g => ({ id: g.id, name: g.name, emoji: g.emoji })),
      }

      return textContent(JSON.stringify(summary, null, 2))
    }

    default:
      return errorContent(`Unknown tool: ${name}`)
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Authenticate via x-api-key header
  const rawKey = req.headers.get('x-api-key') ?? ''
  if (!rawKey) {
    return new Response(
      JSON.stringify({ error: 'Missing x-api-key header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const authUser = await resolveUserFromApiKey(rawKey)
  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'Invalid or revoked API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // 2. Parse JSON-RPC body (may be a single request or a batch array)
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      rpcError(null, -32700, 'Parse error'),
      { status: 400 },
    )
  }

  await ensureSchema()

  // 3. Handle batch or single
  if (Array.isArray(body)) {
    const results = await Promise.all(
      body.map(item => handleSingle(item as RpcRequest, authUser.userId)),
    )
    // Filter out nulls (responses to notifications)
    const filtered = results.filter(r => r !== null)
    if (filtered.length === 0) return new Response(null, { status: 204 })
    return NextResponse.json(filtered)
  }

  const result = await handleSingle(body as RpcRequest, authUser.userId)
  if (result === null) return new Response(null, { status: 204 })
  return NextResponse.json(result)
}

async function handleSingle(
  rpc: RpcRequest,
  userId: number,
): Promise<RpcResponse | null> {
  const id = rpc.id ?? null
  const isNotification = rpc.id === undefined

  if (!rpc.method) {
    if (isNotification) return null
    return rpcError(id, -32600, 'Invalid Request: missing method')
  }

  try {
    switch (rpc.method) {
      // ── MCP lifecycle ──────────────────────────────────────────────────────

      case 'initialize':
        if (isNotification) return null
        return ok(id, {
          protocolVersion: '2024-11-05',
          capabilities:    { tools: {} },
          serverInfo:      { name: 'habit-tracker', version: '1.0.0' },
        })

      case 'notifications/initialized':
        // Client confirms handshake — no response expected
        return null

      case 'ping':
        if (isNotification) return null
        return ok(id, {})

      // ── Tool discovery & execution ─────────────────────────────────────────

      case 'tools/list':
        if (isNotification) return null
        return ok(id, { tools: TOOLS })

      case 'tools/call': {
        if (isNotification) return null
        const params = (rpc.params ?? {}) as { name?: string; arguments?: Record<string, unknown> }
        const toolName = params.name
        if (!toolName) return rpcError(id, -32602, 'Invalid params: missing name')

        const toolExists = TOOLS.some(t => t.name === toolName)
        if (!toolExists) return rpcError(id, -32602, `Unknown tool: ${toolName}`)

        const toolResult = await callTool(
          toolName,
          (params.arguments ?? {}) as Record<string, unknown>,
          userId,
        )
        return ok(id, toolResult)
      }

      default:
        if (isNotification) return null
        return rpcError(id, -32601, `Method not found: ${rpc.method}`)
    }
  } catch (e) {
    console.error(`[MCP] Error in ${rpc.method}:`, e)
    if (isNotification) return null
    return rpcError(id, -32603, 'Internal error', String(e))
  }
}
