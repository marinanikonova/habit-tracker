'use client'

import { Frequency } from '@/lib/types'
import { getExpectedDates } from '@/lib/storage'

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface WeekDotsProps {
  weekDates: string[]
  completions: string[]
  color: string
  frequency: Frequency
}

const dotColorMap: Record<string, { active: string; inactive: string }> = {
  violet:  { active: 'bg-pink-500',    inactive: 'bg-pink-100' },
  sky:     { active: 'bg-rose-500',    inactive: 'bg-rose-100' },
  teal:    { active: 'bg-fuchsia-500', inactive: 'bg-fuchsia-100' },
  rose:    { active: 'bg-rose-500',    inactive: 'bg-rose-100' },
  amber:   { active: 'bg-amber-500',   inactive: 'bg-amber-100' },
  emerald: { active: 'bg-pink-400',    inactive: 'bg-pink-100' },
  indigo:  { active: 'bg-fuchsia-500', inactive: 'bg-fuchsia-100' },
  pink:    { active: 'bg-pink-500',    inactive: 'bg-pink-100' },
}

export default function WeekDots({ weekDates, completions, color, frequency }: WeekDotsProps) {
  const c = dotColorMap[color] ?? dotColorMap.pink
  const today = new Date().toISOString().split('T')[0]
  const expectedDates = new Set(getExpectedDates(weekDates, frequency))

  return (
    <div className="flex gap-1.5 items-end">
      {weekDates.map((date) => {
        const done = completions.includes(date)
        const isToday = date === today
        const isExpected = expectedDates.has(date)
        const jsDay = new Date(date + 'T12:00:00').getDay()
        const dayLabel = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1]

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full transition-all duration-300 ${
              done
                ? c.active
                : isExpected
                  ? c.inactive
                  : 'bg-slate-100 opacity-40'
            } ${isToday ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
            />
            <span className={`text-[9px] font-medium ${
              isToday ? 'text-slate-700' : isExpected ? 'text-slate-400' : 'text-slate-300'
            }`}>
              {dayLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
