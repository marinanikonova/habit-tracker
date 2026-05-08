'use client'

import { Habit } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'

interface AchievementsSectionProps {
  habits: Habit[]
  weekDates: string[]
}

interface Achievement {
  emoji: string
  title: string
  description: string
  unlocked: boolean
}

export default function AchievementsSection({ habits, weekDates }: AchievementsSectionProps) {
  const { t } = useLanguage()

  const totalSlots = habits.length * 7
  const completedSlots = habits.reduce((sum, h) => {
    return sum + weekDates.filter(d => h.completions.includes(d)).length
  }, 0)
  const weeklyPercentage = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0

  const todayStr = new Date().toISOString().split('T')[0]
  const doneToday = habits.filter(h => h.completions.includes(todayStr)).length
  const todayPercentage = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0

  const streak = calcStreak(habits)

  const achievements: Achievement[] = [
    {
      emoji: '🔥',
      title: t('onFireTitle'),
      description: t('onFireDesc'),
      unlocked: streak >= 3,
    },
    {
      emoji: '⭐',
      title: t('starWeekTitle'),
      description: t('starWeekDesc'),
      unlocked: weeklyPercentage === 100 && habits.length > 0,
    },
    {
      emoji: '🎯',
      title: t('perfectDayTitle'),
      description: t('perfectDayDesc'),
      unlocked: todayPercentage === 100 && habits.length > 0,
    },
    {
      emoji: '💪',
      title: t('halfwayTitle'),
      description: t('halfwayDesc'),
      unlocked: weeklyPercentage >= 50,
    },
  ]

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-800 mb-1">{t('myAchievements')}</h2>
      <p className="text-sm text-slate-500 mb-4">{t('weekProgress')}</p>

      {/* Main weekly stat */}
      <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-5 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm font-medium">{t('completedThisWeek')}</p>
            <p className="text-4xl font-bold mt-1">{weeklyPercentage}%</p>
            <p className="text-pink-200 text-xs mt-1">
              {t('ofCompletions').replace('{done}', String(completedSlots)).replace('{total}', String(totalSlots))}
            </p>
          </div>
          <WeeklyRing percentage={weeklyPercentage} />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-700"
              style={{ width: `${weeklyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label={t('today')} value={`${todayPercentage}%`} sub={`${doneToday}/${habits.length}`} color="pink" />
        <StatCard label={t('streak')} value={`${streak}д`} sub={t('inARow')} color="amber" />
        <StatCard label={t('habits')} value={String(habits.length)} sub={t('total')} color="teal" />
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach) => (
          <div
            key={ach.title}
            className={`rounded-2xl border p-3 transition-all duration-300 ${
              ach.unlocked
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-50 border-slate-100 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">{ach.emoji}</div>
            <p className={`text-sm font-semibold ${ach.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
              {ach.title}
            </p>
            <p className="text-xs text-slate-400">{ach.description}</p>
            {ach.unlocked && (
              <span className="inline-block mt-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {t('unlocked')}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    pink:   'text-pink-600 bg-pink-50',
    amber:  'text-amber-600 bg-amber-50',
    teal:   'text-teal-600 bg-teal-50',
  }
  return (
    <div className={`rounded-xl p-3 ${colorMap[color] ?? colorMap.pink}`}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

function WeeklyRing({ percentage }: { percentage: number }) {
  const size = 72
  const strokeWidth = 5
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="white" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__circle"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
    </div>
  )
}

function calcStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0
  let streak = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const allDone = habits.every(h => h.completions.includes(dateStr))
    if (allDone) {
      streak++
    } else {
      break
    }
  }
  return streak
}
