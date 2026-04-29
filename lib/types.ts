export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'weekly'

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily:    'Ежедневно',
  weekdays: 'По будням',
  weekends: 'По выходным',
  weekly:   'Еженедельно',
}

export const FREQUENCY_ICONS: Record<Frequency, string> = {
  daily:    '🔁',
  weekdays: '💼',
  weekends: '🌅',
  weekly:   '📅',
}

export interface Reminder {
  enabled: boolean
  time: string   // "HH:MM"
}

export interface Group {
  id: string
  name: string
  emoji: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  groupId: string | null
  frequency: Frequency
  reminder: Reminder | null
  createdAt: string
  completions: string[]
}

export interface WeekStats {
  total: number
  completed: number
  percentage: number
}

export interface AntiHabit {
  id: string
  name: string
  reason: string | null
  frequency: Frequency
  createdAt: string
  failures: string[]   // dates when the bad thing happened
  cleanDays: string[]  // dates explicitly confirmed clean
}
