'use client'

import { useState } from 'react'
import { AntiHabit, FREQUENCY_LABELS, FREQUENCY_ICONS } from '@/lib/types'
import { calcAntiStreak } from '@/lib/storage'

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
  const [showMenu, setShowMenu] = useState(false)

  const failedToday = antiHabit.failures.includes(today)
  const cleanToday  = antiHabit.cleanDays.includes(today)
  const answeredToday = failedToday || cleanToday
  const streak = calcAntiStreak(antiHabit, today)

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 animate-slide-up">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
          <span className="text-xl shrink-0 mt-0.5">🚫</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug break-words">
              {antiHabit.name}
            </h3>
            {antiHabit.reason && (
              <p className="text-xs text-slate-400 mt-0.5 break-words italic">{antiHabit.reason}</p>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {FREQUENCY_ICONS[antiHabit.frequency]} {FREQUENCY_LABELS[antiHabit.frequency]}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[160px] animate-scale-in">
              <button onClick={() => { onReset(antiHabit.id); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Сбросить серию
              </button>
              <button onClick={() => { onDelete(antiHabit.id); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className={`rounded-xl py-4 mb-3 text-center ${failedToday ? 'bg-rose-50' : streak >= 7 ? 'bg-amber-50' : 'bg-slate-50'}`}>
        {streak > 0 ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{streak >= 30 ? '🏆' : streak >= 7 ? '🔥' : '🌱'}</span>
            <span className={`text-4xl font-black leading-none ${failedToday ? 'text-slate-300' : streak >= 7 ? 'text-amber-500' : 'text-slate-700'}`}>
              {streak}
            </span>
          </div>
        ) : (
          <span className="text-3xl">💤</span>
        )}
        <p className="text-xs text-slate-400 mt-1.5">
          {streak === 0
            ? 'серии нет — начни сегодня!'
            : plural(streak, 'чистый день', 'чистых дня', 'чистых дней') + ' подряд'}
        </p>
      </div>

      {/* Today's status */}
      {!answeredToday && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <p className="text-xs font-medium text-slate-500 text-center mb-2.5">Сегодня было?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onAnswer(antiHabit.id, 'clean')}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
            >
              ✓ Нет, чисто
            </button>
            <button
              onClick={() => onAnswer(antiHabit.id, 'failed')}
              className="flex-1 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-500 text-sm font-medium transition-colors"
            >
              Да, был срыв
            </button>
          </div>
        </div>
      )}

      {cleanToday && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">✓ Сегодня чисто!</span>
          <button
            onClick={() => onUndoAnswer(antiHabit.id)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Отменить
          </button>
        </div>
      )}

      {failedToday && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-medium text-rose-600">😔 Сегодня был срыв</span>
            <button
              onClick={() => onUndoAnswer(antiHabit.id)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Отменить
            </button>
          </div>
          <p className="text-xs text-rose-400">Ничего страшного — завтра новая попытка 💙</p>
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
