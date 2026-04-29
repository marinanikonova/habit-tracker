import { Habit, Group, Frequency } from './types'

const HABITS_KEY = 'habit-tracker-habits'
const GROUPS_KEY = 'habit-tracker-groups'

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
