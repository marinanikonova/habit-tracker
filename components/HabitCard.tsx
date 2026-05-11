'use client'

import { useCallback, useRef, useState } from 'react'
import { Habit, Reminder, FREQUENCY_ICONS } from '@/lib/types'
import { getFrequencyLabel } from '@/lib/i18n'
import { getExpectedDates } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import CircleProgress from './CircleProgress'
import WeekDots from './WeekDots'

interface HabitCardProps {
  habit: Habit
  weekDates: string[]
  today: string
  onToggleToday: (id: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (habit: Habit) => void
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void
}

const SPARK_EMOJIS = ['✨', '⭐', '💫', '🌟', '✦', '✧', '⚡', '💥']

interface Particle { id: number; x: number; emoji: string; rot: string; delay: number }

export default function HabitCard({
  habit, weekDates, today,
  onToggleToday, onReset, onDelete, onEdit, onUpdateHabit,
}: HabitCardProps) {
  const { t, lang } = useLanguage()
  const [showMenu, setShowMenu]         = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [bouncing, setBouncing]         = useState(false)
  const [particles, setParticles]       = useState<Particle[]>([])

  const doneToday      = habit.completions.includes(today)
  const expectedDates  = getExpectedDates(weekDates, habit.frequency)
  const weekCompletions = expectedDates.filter(d => habit.completions.includes(d)).length
  const weekPct        = expectedDates.length > 0 ? (weekCompletions / expectedDates.length) * 100 : 0

  // ── Spark particles ──────────────────────────────────────────────────────────
  function spawnSparks() {
    const next: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 220,
      emoji: SPARK_EMOJIS[i % SPARK_EMOJIS.length],
      rot: `${(Math.random() - 0.5) * 60}deg`,
      delay: i * 60,
    }))
    setParticles(next)
    setTimeout(() => setParticles([]), 1400)
  }

  function handleToggle() {
    if (!doneToday) spawnSparks()
    setBouncing(true)
    onToggleToday(habit.id)
    setTimeout(() => setBouncing(false), 450)
  }

  // ── Reminder helpers ──────────────────────────────────────────────────────────
  function setReminder(patch: Partial<Reminder>) {
    const current = habit.reminder ?? { enabled: false, time: '09:00' }
    onUpdateHabit(habit.id, { reminder: { ...current, ...patch } })
  }

  const reminderEnabled = habit.reminder?.enabled ?? false
  const reminderTime    = habit.reminder?.time ?? '09:00'

  return (
    <div
      className="relative rounded-2xl p-4 transition-all duration-300 animate-slide-up overflow-hidden"
      style={{ backgroundColor: '#fff', border: '1px solid rgba(167,139,250,0.25)' }}
    >
      {/* Spark particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="angel-particle"
          style={{
            bottom: '48px',
            left: `calc(50% + ${p.x}px)`,
            animationDelay: `${p.delay}ms`,
            '--rot': p.rot,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
          <span className="text-xl shrink-0 mt-0.5">{habit.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-snug break-words" style={{ color: '#101585' }}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className="text-xs" style={{ color: '#A78BFA' }}>
                {weekCompletions}/{expectedDates.length}{' '}
                {habit.frequency !== 'daily' ? t('expectedLabel') : t('daysLabel')}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(167,139,250,0.5)' }}>·</span>
              <span className="text-[10px]" style={{ color: '#A78BFA' }}>
                {FREQUENCY_ICONS[habit.frequency]} {getFrequencyLabel(habit.frequency, lang)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <CircleProgress percentage={weekPct} color={habit.color} />

          {/* Bell */}
          <button
            onClick={() => setShowReminder(v => !v)}
            title={t('reminderLabel')}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: reminderEnabled ? 'rgba(167,139,250,0.15)' : 'transparent',
              color: reminderEnabled ? '#A78BFA' : 'rgba(167,139,250,0.4)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              {reminderEnabled && <circle cx="18" cy="5" r="3" fill="#A78BFA" stroke="none"/>}
            </svg>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'rgba(167,139,250,0.5)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="8" cy="13" r="1.5"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg py-1 z-10 min-w-[150px] animate-scale-in" style={{ border: '1px solid rgba(167,139,250,0.2)' }}>
                <button onClick={() => { onEdit(habit); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 font-medium" style={{ color: '#101585' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {t('edit')}
                </button>
                <div className="mx-3 border-t border-slate-100" />
                <button onClick={() => { onReset(habit.id); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                  </svg>
                  {t('resetProgress')}
                </button>
                <button onClick={() => { onDelete(habit.id); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#EDE9FF] flex items-center gap-2" style={{ color: '#e53e3e' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  {t('delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Week dots ──────────────────────────────────────────────────────── */}
      <div className="mb-3">
        <WeekDots weekDates={weekDates} completions={habit.completions} color={habit.color} frequency={habit.frequency} />
      </div>

      {/* ── Reminder panel ─────────────────────────────────────────────────── */}
      {showReminder && (
        <div
          className="mb-3 p-3 rounded-xl animate-scale-in"
          style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#2D22C4' }}>
              {t('reminderLabel')}
            </span>
            <button
              onClick={() => setReminder({ enabled: !reminderEnabled })}
              className="relative w-10 h-5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: reminderEnabled ? '#101585' : 'rgba(167,139,250,0.3)' }}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          <div className={`flex items-center gap-2 transition-opacity duration-200 ${reminderEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <span className="text-xs" style={{ color: '#A78BFA' }}>{t('reminderTime')}</span>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminder({ time: e.target.value })}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white focus:outline-none font-medium"
              style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#101585' }}
            />
          </div>
          {reminderEnabled && (
            <p className="mt-2 text-[10px] leading-snug" style={{ color: '#A78BFA' }}>
              {t('reminderNote').replace('{time}', reminderTime)}
            </p>
          )}
        </div>
      )}

      {/* ── Checkbox button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200"
        style={doneToday
          ? { backgroundColor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#101585' }
          : { backgroundColor: '#FFDD44', color: '#101585', border: '1px solid transparent' }
        }
      >
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${bouncing ? 'check-bounce' : ''}`}
          style={{ borderColor: doneToday ? '#101585' : 'rgba(16,21,133,0.4)' }}
        >
          {doneToday && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </span>
        <span className="text-sm font-medium">
          {doneToday ? t('doneTodayLabel') : t('doneButton')}
        </span>
        {doneToday && (
          <span className="ml-auto" style={{ color: '#FFDD44', textShadow: '0 0 8px rgba(255,221,68,0.6)' }}>✦</span>
        )}
      </button>

      {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
    </div>
  )
}
