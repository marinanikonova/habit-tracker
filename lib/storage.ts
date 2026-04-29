import { Habit, Group, Frequency, AntiHabit } from './types'

const HABITS_KEY = 'habit-tracker-habits'
const GROUPS_KEY = 'habit-tracker-groups'
const ANTI_HABITS_KEY = 'habit-tracker-anti-habits'

// ── Groups ──────────────────────────────────────────────────────────────────

export function loadGroups(): Group[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    return raw ? JSON.parse(raw) : getDefaultGroups()
  } catch {
    return getDefaultGroups()
  }
}

export function saveGroups(groups: Group[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
}

// ── Habits ───────────────────────────────────────────────────────────────────

export function loadHabits(): Habit[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HABITS_KEY)
    const habits: Habit[] = raw ? JSON.parse(raw) : getDefaultHabits()
    return habits.map(migrateHabit)
  } catch {
    return getDefaultHabits()
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

// Adds groupId / frequency to habits saved before this feature existed
function migrateHabit(h: Habit): Habit {
  return {
    ...h,
    groupId: h.groupId ?? null,
    frequency: h.frequency ?? 'daily',
    reminder: h.reminder ?? null,
  }
}

// ── Anti-habits ──────────────────────────────────────────────────────────────

export function loadAntiHabits(): AntiHabit[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANTI_HABITS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAntiHabits(antiHabits: AntiHabit[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ANTI_HABITS_KEY, JSON.stringify(antiHabits))
}

// Consecutive expected days without a failure, counting backwards from today
export function calcAntiStreak(antiHabit: AntiHabit, today: string): number {
  const createdDate = antiHabit.createdAt.split('T')[0]
  let streak = 0
  const d = new Date(today + 'T12:00:00')
  for (let i = 0; i < 400; i++) {
    const ds = d.toISOString().split('T')[0]
    if (ds < createdDate) break
    if (getExpectedDates([ds], antiHabit.frequency).length > 0) {
      if (antiHabit.failures.includes(ds)) break
      streak++
    }
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getPreviousWeekDates(): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = 13; i >= 7; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getWeekDates(): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

// Returns the subset of weekDates that count as "expected" for a given frequency
export function getExpectedDates(weekDates: string[], frequency: Frequency): string[] {
  switch (frequency) {
    case 'daily':
      return weekDates
    case 'weekdays':
      return weekDates.filter(d => {
        const day = new Date(d + 'T12:00:00').getDay()
        return day >= 1 && day <= 5
      })
    case 'weekends':
      return weekDates.filter(d => {
        const day = new Date(d + 'T12:00:00').getDay()
        return day === 0 || day === 6
      })
    case 'weekly':
      // Only the first day of the window counts
      return weekDates.slice(0, 1)
  }
}

// ── Defaults ─────────────────────────────────────────────────────────────────

function getDefaultGroups(): Group[] {
  return [
    { id: 'health',  name: 'Здоровье',       emoji: '💪' },
    { id: 'growth',  name: 'Саморазвитие',   emoji: '📚' },
  ]
}

function getDefaultHabits(): Habit[] {
  return [
    {
      id: '1',
      name: 'Утренняя зарядка',
      emoji: '🏃',
      color: 'pink',
      groupId: 'health',
      frequency: 'daily',
      reminder: null,
      createdAt: new Date().toISOString(),
      completions: [],
    },
    {
      id: '2',
      name: 'Читать 20 минут',
      emoji: '📚',
      color: 'rose',
      groupId: 'growth',
      frequency: 'daily',
      reminder: null,
      createdAt: new Date().toISOString(),
      completions: [],
    },
    {
      id: '3',
      name: 'Пить воду (2л)',
      emoji: '💧',
      color: 'amber',
      groupId: 'health',
      frequency: 'daily',
      reminder: null,
      createdAt: new Date().toISOString(),
      completions: [],
    },
  ]
}
