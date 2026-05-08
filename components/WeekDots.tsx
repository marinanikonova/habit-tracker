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

export default function WeekDots({ weekDates, completions, frequency }: WeekDotsProps) {
  const today = new Date().toISOString().split('T')[0]
  const expectedDates = new Set(getExpectedDates(weekDates, frequency))

  return (
    <div className="flex gap-1.5 items-end">
      {weekDates.map((date) => {
        const done      = completions.includes(date)
        const isToday   = date === today
        const isExpected = expectedDates.has(date)
        const jsDay     = new Date(date + 'T12:00:00').getDay()
        const dayLabel  = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1]

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div
              className="w-5 h-5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: done
                  ? '#101585'
                  : isExpected
                    ? 'rgba(167,139,250,0.3)'
                    : 'rgba(167,139,250,0.1)',
                outline: isToday ? '2px solid #A78BFA' : 'none',
                outlineOffset: '1px',
              }}
            />
            <span
              className="text-[9px] font-medium"
              style={{
                color: isToday ? '#101585' : isExpected ? '#A78BFA' : 'rgba(167,139,250,0.5)',
              }}
            >
              {dayLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
