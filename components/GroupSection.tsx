'use client'

import React, { useState } from 'react'
import { Habit, Group, Frequency } from '@/lib/types'
import { getExpectedDates } from '@/lib/storage'
import HabitCard from './HabitCard'

interface GroupSectionProps {
  group: Group | null
  habits: Habit[]
  weekDates: string[]
  today: string
  onToggleToday: (id: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (habit: Habit) => void
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void
  onDeleteGroup?: (id: string) => void
}

export default function GroupSection({
  group,
  habits,
  weekDates,
  today,
  onToggleToday,
  onReset,
  onDelete,
  onEdit,
  onUpdateHabit,
  onDeleteGroup,
}: GroupSectionProps) {
  const [open, setOpen] = useState(true)

  if (habits.length === 0) return null

  // Aggregate week % across all habits in this group
  const totalExpected = habits.reduce((sum, h) => {
    return sum + getExpectedDates(weekDates, h.frequency).length
  }, 0)
  const totalDone = habits.reduce((sum, h) => {
    return sum + getExpectedDates(weekDates, h.frequency).filter(d => h.completions.includes(d)).length
  }, 0)
  const pct = totalExpected > 0 ? Math.round((totalDone / totalExpected) * 100) : 0

  const doneToday = habits.filter(h => h.completions.includes(today)).length

  return (
    <div className="mb-5 animate-fade-in">
      {/* Group header */}
      <div className="w-full flex items-center justify-between mb-2 px-1 group">
        {/* Toggle area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(v => !v)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v) }}
          className="flex-1 flex items-center gap-2 cursor-pointer min-w-0"
        >
          <span className="text-xl">{group?.emoji ?? '📋'}</span>
          <span className="font-semibold text-slate-700 text-sm">
            {group?.name ?? 'Без группы'}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            {habits.length} {plural(habits.length, 'привычка', 'привычки', 'привычек')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mini progress pill */}
          <span
            role="button"
            tabIndex={0}
            onClick={() => setOpen(v => !v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v) }}
            className="text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer"
            style={pctColor(pct)}
          >
            {pct}%
          </span>

          {/* Delete group (only for named groups with no habits, or on hover) */}
          {group && onDeleteGroup && (
            <button
              onClick={e => { e.stopPropagation(); onDeleteGroup(group.id) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:bg-rose-100 text-slate-300 hover:text-rose-400"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          {/* Chevron */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpen(v => !v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v) }}
            className="cursor-pointer"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`text-slate-400 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Habit cards */}
      {open && (
        <div className="space-y-3">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              weekDates={weekDates}
              today={today}
              onToggleToday={onToggleToday}
              onReset={onReset}
              onDelete={onDelete}
              onEdit={onEdit}
              onUpdateHabit={onUpdateHabit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function pctColor(pct: number): React.CSSProperties {
  if (pct >= 80) return { backgroundColor: '#101585', color: '#FFDD44' }
  if (pct >= 40) return { backgroundColor: 'rgba(167,139,250,0.2)', color: '#2D22C4' }
  return { backgroundColor: 'rgba(167,139,250,0.12)', color: '#A78BFA' }
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few
  return many
}
