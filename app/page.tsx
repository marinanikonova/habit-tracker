'use client'

import { useEffect, useMemo, useState } from 'react'
import { Habit, Group, Frequency, FREQUENCY_LABELS, FREQUENCY_ICONS, AntiHabit } from '@/lib/types'
import {
  loadHabits, saveHabits,
  loadGroups, saveGroups,
  loadAntiHabits, saveAntiHabits,
  getTodayString, getWeekDates, getExpectedDates,
} from '@/lib/storage'
import { useReminders } from '@/lib/hooks/useReminders'
import GroupSection from '@/components/GroupSection'
import AchievementsSection from '@/components/AchievementsSection'
import AddHabitModal from '@/components/AddHabitModal'
import AddAntiHabitModal from '@/components/AddAntiHabitModal'
import AntiHabitsSection from '@/components/AntiHabitsSection'

type Tab = 'habits' | 'anti' | 'achievements'
type ViewMode = 'by-group' | 'by-frequency'

const FREQUENCIES: Frequency[] = ['daily', 'weekdays', 'weekends', 'weekly']

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [antiHabits, setAntiHabits] = useState<AntiHabit[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showAntiModal, setShowAntiModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [tab, setTab] = useState<Tab>('habits')
  const [viewMode, setViewMode] = useState<ViewMode>('by-group')
  const [mounted, setMounted] = useState(false)

  const today = getTodayString()
  const weekDates = getWeekDates()

  useEffect(() => {
    setHabits(loadHabits())
    setGroups(loadGroups())
    setAntiHabits(loadAntiHabits())
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) saveHabits(habits) }, [habits, mounted])
  useEffect(() => { if (mounted) saveGroups(groups) }, [groups, mounted])
  useEffect(() => { if (mounted) saveAntiHabits(antiHabits) }, [antiHabits, mounted])
  useReminders(habits, today)

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSave(name: string, emoji: string, color: string, groupId: string | null, frequency: Frequency) {
    if (editingHabit) {
      setHabits(prev => prev.map(h =>
        h.id === editingHabit.id ? { ...h, name, emoji, color, groupId, frequency } : h
      ))
      setEditingHabit(null)
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name, emoji, color, groupId, frequency,
        reminder: null,
        createdAt: new Date().toISOString(),
        completions: [],
      }
      setHabits(prev => [...prev, newHabit])
      setShowModal(false)
    }
  }

  function handleStartEdit(habit: Habit) {
    setEditingHabit(habit)
  }

  function handleAddGroup(name: string, emoji: string): Group {
    const g: Group = { id: Date.now().toString(), name, emoji }
    setGroups(prev => [...prev, g])
    return g
  }

  function handleDeleteGroup(id: string) {
    // Unassign habits from the deleted group
    setHabits(prev => prev.map(h => h.groupId === id ? { ...h, groupId: null } : h))
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  function handleToggleToday(id: string) {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const done = h.completions.includes(today)
      return { ...h, completions: done ? h.completions.filter(d => d !== today) : [...h.completions, today] }
    }))
  }

  function handleReset(id: string) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completions: [] } : h))
  }

  function handleDelete(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  function handleUpdateHabit(id: string, updates: Partial<Habit>) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h))
  }

  // ── Anti-habit handlers ───────────────────────────────────────────────────────

  function handleAddAntiHabit(name: string, reason: string | null, frequency: Frequency) {
    const newAntiHabit: AntiHabit = {
      id: Date.now().toString(),
      name, reason, frequency,
      createdAt: new Date().toISOString(),
      failures: [],
      cleanDays: [],
    }
    setAntiHabits(prev => [...prev, newAntiHabit])
    setShowAntiModal(false)
  }

  function handleAntiAnswer(id: string, outcome: 'clean' | 'failed') {
    setAntiHabits(prev => prev.map(ah => {
      if (ah.id !== id) return ah
      if (outcome === 'clean') {
        return { ...ah, cleanDays: [...ah.cleanDays.filter(d => d !== today), today] }
      } else {
        return {
          ...ah,
          failures: [...ah.failures.filter(d => d !== today), today],
          cleanDays: ah.cleanDays.filter(d => d !== today),
        }
      }
    }))
  }

  function handleAntiUndoAnswer(id: string) {
    setAntiHabits(prev => prev.map(ah =>
      ah.id !== id ? ah : {
        ...ah,
        failures: ah.failures.filter(d => d !== today),
        cleanDays: ah.cleanDays.filter(d => d !== today),
      }
    ))
  }

  function handleDeleteAntiHabit(id: string) {
    setAntiHabits(prev => prev.filter(ah => ah.id !== id))
  }

  function handleResetAntiHabit(id: string) {
    setAntiHabits(prev => prev.map(ah =>
      ah.id === id ? { ...ah, failures: [], cleanDays: [] } : ah
    ))
  }

  // ── Grouped data ─────────────────────────────────────────────────────────────

  const groupedByGroup = useMemo(() => {
    const map = new Map<string | null, Habit[]>()
    map.set(null, []) // ungrouped bucket
    groups.forEach(g => map.set(g.id, []))
    habits.forEach(h => {
      const bucket = map.get(h.groupId) ?? map.get(null)!
      bucket.push(h)
    })
    return map
  }, [habits, groups])

  const groupedByFrequency = useMemo(() => {
    const map = new Map<Frequency, Habit[]>()
    FREQUENCIES.forEach(f => map.set(f, []))
    habits.forEach(h => map.get(h.frequency)!.push(h))
    return map
  }, [habits])

  // ── Stats ────────────────────────────────────────────────────────────────────

  const doneToday = habits.filter(h => h.completions.includes(today)).length
  const totalHabits = habits.length

  const totalExpected = habits.reduce((s, h) => s + getExpectedDates(weekDates, h.frequency).length, 0)
  const totalCompleted = habits.reduce((s, h) =>
    s + getExpectedDates(weekDates, h.frequency).filter(d => h.completions.includes(d)).length, 0)
  const weekPct = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff0f5' }}>
        <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fff0f5' }}>
      <div className="max-w-lg mx-auto px-4 pb-24">

        {/* Header */}
        <header className="pt-10 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">{formatDate(today)}</p>
              <h1 className="text-2xl font-bold text-slate-800 mt-0.5">Мои привычки</h1>
              {totalHabits > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  {doneToday === totalHabits
                    ? '🎉 Все привычки выполнены!'
                    : `Выполнено ${doneToday} из ${totalHabits} сегодня`}
                </p>
              )}
            </div>
            <button
              onClick={() => tab === 'anti' ? setShowAntiModal(true) : setShowModal(true)}
              className={`flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm ${tab === 'anti' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-pink-500 hover:bg-pink-600'}`}
              style={{ display: tab === 'achievements' ? 'none' : undefined }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Добавить
            </button>
          </div>

          {totalHabits > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Прогресс дня</span>
                <span className="text-xs font-semibold text-pink-500">
                  {Math.round((doneToday / totalHabits) * 100)}%
                </span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-full h-2 transition-all duration-700"
                  style={{ width: `${(doneToday / totalHabits) * 100}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-pink-100/60 p-1 rounded-xl mb-4">
          <TabButton active={tab === 'habits'} onClick={() => setTab('habits')}>Привычки</TabButton>
          <TabButton active={tab === 'anti'} onClick={() => setTab('anti')}>Анти</TabButton>
          <TabButton active={tab === 'achievements'} onClick={() => setTab('achievements')}>Достижения</TabButton>
        </div>

        {/* ── Habits tab ─────────────────────────────────────────────────────── */}
        {tab === 'habits' && (
          <>
            {habits.length > 0 && (
              /* View-mode toggle */
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs text-slate-400 mr-1">Вид:</span>
                <ViewToggle
                  active={viewMode === 'by-group'}
                  onClick={() => setViewMode('by-group')}
                  icon="🗂️"
                  label="По группам"
                />
                <ViewToggle
                  active={viewMode === 'by-frequency'}
                  onClick={() => setViewMode('by-frequency')}
                  icon="⏱️"
                  label="По частоте"
                />
              </div>
            )}

            {habits.length === 0 ? (
              <EmptyState onAdd={() => setShowModal(true)} />
            ) : viewMode === 'by-group' ? (
              <>
                {groups.map(g => (
                  <GroupSection
                    key={g.id}
                    group={g}
                    habits={groupedByGroup.get(g.id) ?? []}
                    weekDates={weekDates}
                    today={today}
                    onToggleToday={handleToggleToday}
                    onReset={handleReset}
                    onDelete={handleDelete}
                    onEdit={handleStartEdit}
                    onUpdateHabit={handleUpdateHabit}
                    onDeleteGroup={handleDeleteGroup}
                  />
                ))}
                {/* Ungrouped */}
                <GroupSection
                  group={null}
                  habits={groupedByGroup.get(null) ?? []}
                  weekDates={weekDates}
                  today={today}
                  onToggleToday={handleToggleToday}
                  onReset={handleReset}
                  onDelete={handleDelete}
                  onEdit={handleStartEdit}
                  onUpdateHabit={handleUpdateHabit}
                />
              </>
            ) : (
              FREQUENCIES.map(f => {
                const fHabits = groupedByFrequency.get(f) ?? []
                if (fHabits.length === 0) return null
                return (
                  <GroupSection
                    key={f}
                    group={{ id: f, name: FREQUENCY_LABELS[f], emoji: FREQUENCY_ICONS[f] }}
                    habits={fHabits}
                    weekDates={weekDates}
                    today={today}
                    onToggleToday={handleToggleToday}
                    onReset={handleReset}
                    onDelete={handleDelete}
                    onEdit={handleStartEdit}
                    onUpdateHabit={handleUpdateHabit}
                  />
                )
              })
            )}
          </>
        )}

        {tab === 'anti' && (
          <AntiHabitsSection
            antiHabits={antiHabits}
            today={today}
            weekDates={weekDates}
            onAnswer={handleAntiAnswer}
            onUndoAnswer={handleAntiUndoAnswer}
            onDelete={handleDeleteAntiHabit}
            onReset={handleResetAntiHabit}
            onAdd={() => setShowAntiModal(true)}
          />
        )}

        {tab === 'achievements' && (
          <AchievementsSection habits={habits} weekDates={weekDates} />
        )}
      </div>

      {(showModal || editingHabit) && (
        <AddHabitModal
          groups={groups}
          initialHabit={editingHabit ?? undefined}
          onSave={handleSave}
          onAddGroup={handleAddGroup}
          onClose={() => { setShowModal(false); setEditingHabit(null) }}
        />
      )}

      {showAntiModal && (
        <AddAntiHabitModal
          onSave={handleAddAntiHabit}
          onClose={() => setShowAntiModal(false)}
        />
      )}
    </main>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active ? 'bg-white text-pink-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
      }`}>
      {children}
    </button>
  )
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
        active
          ? 'bg-white border-pink-200 text-pink-600 shadow-sm'
          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/60'
      }`}>
      <span>{icon}</span>
      {label}
    </button>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-5xl mb-4">🌱</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Нет привычек</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">
        Добавьте первую привычку и начните отслеживать свой прогресс каждый день
      </p>
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Добавить первую привычку
      </button>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}
