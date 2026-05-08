'use client'

import { AntiHabit, Frequency } from '@/lib/types'
import { getExpectedDates, getPreviousWeekDates } from '@/lib/storage'
import AntiHabitCard from './AntiHabitCard'

interface AntiHabitsSectionProps {
  antiHabits: AntiHabit[]
  today: string
  weekDates: string[]
  onAnswer: (id: string, outcome: 'clean' | 'failed') => void
  onUndoAnswer: (id: string) => void
  onDelete: (id: string) => void
  onReset: (id: string) => void
  onAdd: () => void
}

export default function AntiHabitsSection({
  antiHabits, today, weekDates,
  onAnswer, onUndoAnswer, onDelete, onReset, onAdd,
}: AntiHabitsSectionProps) {
  if (antiHabits.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div>
      <div className="space-y-3 mb-5">
        {antiHabits.map(ah => (
          <AntiHabitCard
            key={ah.id}
            antiHabit={ah}
            today={today}
            onAnswer={onAnswer}
            onUndoAnswer={onUndoAnswer}
            onDelete={onDelete}
            onReset={onReset}
          />
        ))}
      </div>

      {/* Weekly stats */}
      <WeeklyStatsCard antiHabits={antiHabits} weekDates={weekDates} />
    </div>
  )
}

// ── Weekly stats ──────────────────────────────────────────────────────────────

function WeeklyStatsCard({ antiHabits, weekDates }: { antiHabits: AntiHabit[]; weekDates: string[] }) {
  const prevWeekDates = getPreviousWeekDates()

  const rows = antiHabits.map(ah => {
    const thisExp  = getExpectedDates(weekDates, ah.frequency)
    const prevExp  = getExpectedDates(prevWeekDates, ah.frequency)

    const thisFail  = thisExp.filter(d => ah.failures.includes(d)).length
    const thisClean = thisExp.length - thisFail
    const thisPct   = thisExp.length > 0 ? Math.round((thisClean / thisExp.length) * 100) : 100

    const prevFail  = prevExp.filter(d => ah.failures.includes(d)).length
    const prevClean = prevExp.length - prevFail
    const prevPct   = prevExp.length > 0 ? Math.round((prevClean / prevExp.length) * 100) : 100

    const diff = thisPct - prevPct
    const trend      = diff >= 5 ? '↑' : diff <= -5 ? '↓' : '→'
    const trendColor = diff >= 5 ? 'text-emerald-500' : diff <= -5 ? 'text-rose-500' : 'text-slate-400'

    return { ah, thisClean, total: thisExp.length, thisPct, trend, trendColor }
  })

  const totalClean    = rows.reduce((s, r) => s + r.thisClean, 0)
  const totalExpected = rows.reduce((s, r) => s + r.total, 0)
  const totalPct      = totalExpected > 0 ? Math.round((totalClean / totalExpected) * 100) : 100

  const pctColor = (pct: number) =>
    pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'

  const pctText = (pct: number) =>
    pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'

  return (
    <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        📊 Итоги недели
      </h3>

      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.ah.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 truncate flex-1 mr-3">{r.ah.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">{r.thisClean}/{r.total}</span>
                <span className={`text-xs font-bold ${r.trendColor}`}>{r.trend}</span>
                <span className={`text-xs font-semibold w-8 text-right ${pctText(r.thisPct)}`}>
                  {r.thisPct}%
                </span>
              </div>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgba(167,139,250,0.2)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${r.thisPct}%`,
                  backgroundColor: r.thisPct >= 80 ? '#101585' : r.thisPct >= 50 ? '#A78BFA' : '#f43f5e',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {rows.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Итого чистых дней</span>
          <span className={`text-xs font-bold ${pctText(totalPct)}`}>
            {totalClean}/{totalExpected} · {totalPct}%
          </span>
        </div>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-5xl mb-4">🚫</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Нет анти-привычек</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">
        Добавь то, от чего хочешь отказаться — соцсети, сахар, поздний сон — и следи за чистой серией
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
        style={{ backgroundColor: '#101585' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Добавить анти-привычку
      </button>
    </div>
  )
}
