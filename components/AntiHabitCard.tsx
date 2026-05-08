'use client'

import { useState } from 'react'
import { AntiHabit, FREQUENCY_ICONS } from '@/lib/types'
import { getFrequencyLabel } from '@/lib/i18n'
import { calcAntiStreak } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'

interface AntiHabitCardProps {
  antiHabit: AntiHabit
  today: string
  onAnswer: (id: string, outcome: 'clean' | 'failed') => void
  onUndoAnswer: (id: string) => void
  onDelete: (id: string) => void
  onReset: (id: string) => void
}

export default function AntiHabitCard({
  antiHabit, today,
  onAnswer, onUndoAnswer, onDelete, onReset,
}: AntiHabitCardProps) {
  const { t, lang } = useLanguage()
  const [showMenu, setShowMenu] = useState(false)

  const failedToday    = antiHabit.failures.includes(today)
  const cleanToday     = antiHabit.cleanDays.includes(today)
  const answeredToday  = failedToday || cleanToday
  const streak         = calcAntiStreak(antiHabit, today)
  const isMilestone    = streak >= 7

  const streakLabel = streak === 0
    ? t('noStreak')
    : (lang === 'ru'
        ? plural(streak, t('cleanDays_one'), t('cleanDays_few'), t('cleanDays_many'))
        : streak === 1 ? t('cleanDays_one') : t('cleanDays_many')
      ) + ' ' + t('inARow')

  return (
    <div
      className="relative rounded-2xl p-4 transition-all duration-300 animate-slide-up"
      style={{ backgroundColor: '#fff', border: '1px solid rgba(167,139,250,0.25)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
          <span className="text-xl shrink-0 mt-0.5">🚫</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-snug break-words" style={{ color: '#101585' }}>
              {antiHabit.name}
            </h3>
            {antiHabit.reason && (
              <p className="text-xs mt-0.5 break-words italic" style={{ color: '#A78BFA' }}>{antiHabit.reason}</p>
            )}
            <span className="text-[10px] mt-0.5 block" style={{ color: '#A78BFA' }}>
              {FREQUENCY_ICONS[antiHabit.frequency]} {getFrequencyLabel(antiHabit.frequency, lang)}
            </span>
          </div>
        </div>

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
            <div
              className="absolute right-0 top-8 bg-white rounded-xl shadow-lg py-1 z-10 min-w-[160px] animate-scale-in"
              style={{ border: '1px solid rgba(167,139,250,0.2)' }}
            >
              <button onClick={() => { onReset(antiHabit.id); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                {t('resetStreak')}
              </button>
              <button onClick={() => { onDelete(antiHabit.id); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2">
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

      {/* Streak */}
      <div
        className="rounded-xl py-4 mb-3 text-center"
        style={{
          backgroundColor: failedToday
            ? 'rgba(244,63,94,0.06)'
            : isMilestone
              ? '#101585'
              : 'rgba(167,139,250,0.1)',
        }}
      >
        {streak > 0 ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{streak >= 30 ? '🏆' : streak >= 7 ? '⚡' : '🌱'}</span>
            <span
              className="text-4xl font-black leading-none"
              style={{ color: failedToday ? 'rgba(167,139,250,0.35)' : isMilestone ? '#FFDD44' : '#101585' }}
            >
              {streak}
            </span>
          </div>
        ) : (
          <span className="text-3xl">💤</span>
        )}
        <p
          className="text-xs mt-1.5"
          style={{ color: isMilestone && !failedToday ? '#A78BFA' : 'rgba(16,21,133,0.45)' }}
        >
          {streakLabel}
        </p>
      </div>

      {/* Today's status */}
      {!answeredToday && (
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}
        >
          <p className="text-xs font-medium text-center mb-2.5" style={{ color: '#2D22C4' }}>{t('todayQuestion')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onAnswer(antiHabit.id, 'clean')}
              className="flex-1 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#101585' }}
            >
              {t('noClear')}
            </button>
            <button
              onClick={() => onAnswer(antiHabit.id, 'failed')}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}
            >
              {t('yesFailed')}
            </button>
          </div>
        </div>
      )}

      {cleanToday && (
        <div
          className="rounded-xl px-4 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <span className="text-sm font-medium" style={{ color: '#101585' }}>{t('cleanToday')}</span>
          <button
            onClick={() => onUndoAnswer(antiHabit.id)}
            className="text-xs transition-colors"
            style={{ color: '#A78BFA' }}
          >
            {t('undo')}
          </button>
        </div>
      )}

      {failedToday && (
        <div className="rounded-xl px-4 py-2.5" style={{ backgroundColor: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-medium text-rose-600">{t('failedToday')}</span>
            <button
              onClick={() => onUndoAnswer(antiHabit.id)}
              className="text-xs transition-colors"
              style={{ color: '#A78BFA' }}
            >
              {t('undo')}
            </button>
          </div>
          <p className="text-xs text-rose-400">{t('noWorries')}</p>
        </div>
      )}

      {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few
  return many
}
