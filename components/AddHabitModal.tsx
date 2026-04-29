'use client'

import { useState } from 'react'
import { Frequency, FREQUENCY_LABELS, FREQUENCY_ICONS, Group, Habit } from '@/lib/types'

interface AddHabitModalProps {
  groups: Group[]
  initialHabit?: Habit          // present → edit mode
  onSave: (name: string, emoji: string, color: string, groupId: string | null, frequency: Frequency) => void
  onAddGroup: (name: string, emoji: string) => Group
  onClose: () => void
}

const EMOJIS = ['🏃', '📚', '💧', '🧘', '🎨', '💪', '🥗', '😴', '🎵', '✍️', '🌿', '🧹', '📝', '🚴', '🌅', '🧠']
const COLORS = ['pink', 'rose', 'amber', 'teal', 'sky', 'violet', 'emerald', 'indigo']

const GROUP_EMOJIS = ['💪', '📚', '🏠', '🎯', '💼', '🌱', '🎨', '🧠', '❤️', '⚡']

const colorPreviewMap: Record<string, string> = {
  pink:    'bg-pink-500',
  rose:    'bg-rose-500',
  amber:   'bg-amber-500',
  teal:    'bg-teal-500',
  sky:     'bg-sky-500',
  violet:  'bg-violet-500',
  emerald: 'bg-emerald-500',
  indigo:  'bg-indigo-500',
}

const colorRingMap: Record<string, string> = {
  pink:    'ring-pink-400',
  rose:    'ring-rose-400',
  amber:   'ring-amber-400',
  teal:    'ring-teal-400',
  sky:     'ring-sky-400',
  violet:  'ring-violet-400',
  emerald: 'ring-emerald-400',
  indigo:  'ring-indigo-400',
}

const FREQUENCIES: Frequency[] = ['daily', 'weekdays', 'weekends', 'weekly']

export default function AddHabitModal({ groups, initialHabit, onSave, onAddGroup, onClose }: AddHabitModalProps) {
  const isEdit = !!initialHabit

  const [name, setName]         = useState(initialHabit?.name      ?? '')
  const [emoji, setEmoji]       = useState(initialHabit?.emoji     ?? '🏃')
  const [color, setColor]       = useState(initialHabit?.color     ?? 'pink')
  const [groupId, setGroupId]   = useState<string | null>(initialHabit?.groupId ?? null)
  const [frequency, setFrequency] = useState<Frequency>(initialHabit?.frequency ?? 'daily')

  // Inline group creation
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName]   = useState('')
  const [newGroupEmoji, setNewGroupEmoji] = useState('💪')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), emoji, color, groupId, frequency)
  }

  function handleCreateGroup() {
    if (!newGroupName.trim()) return
    const g = onAddGroup(newGroupName.trim(), newGroupEmoji)
    setGroupId(g.id)
    setCreatingGroup(false)
    setNewGroupName('')
    setNewGroupEmoji('💪')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Редактировать привычку' : 'Новая привычка'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Название</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isEdit ? '' : 'Например: Утренняя медитация'}
              maxLength={50}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Иконка</label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all ${emoji === e ? 'bg-pink-50 ring-2 ring-pink-400 scale-110' : 'hover:bg-slate-50'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Цвет</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${colorPreviewMap[c]} ${color === c ? `ring-2 ring-offset-2 ${colorRingMap[c]} scale-110` : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Частота</label>
            <div className="grid grid-cols-4 gap-2">
              {FREQUENCIES.map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all border ${
                    frequency === f
                      ? 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'border-slate-200 text-slate-500 hover:border-pink-200 hover:bg-pink-50/50'
                  }`}>
                  <span className="text-xl">{FREQUENCY_ICONS[f]}</span>
                  <span className={`text-[11px] leading-tight font-medium ${frequency === f ? 'text-pink-700' : 'text-slate-500'}`}>
                    {FREQUENCY_LABELS[f]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Группа</label>
            <div className="flex flex-wrap gap-2">
              {/* No group */}
              <button type="button" onClick={() => setGroupId(null)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                  groupId === null
                    ? 'bg-slate-100 border-slate-300 text-slate-700 font-medium'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                Без группы
              </button>

              {groups.map(g => (
                <button key={g.id} type="button" onClick={() => setGroupId(g.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-all ${
                    groupId === g.id
                      ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-pink-200 hover:bg-pink-50/50'
                  }`}>
                  <span>{g.emoji}</span>
                  {g.name}
                </button>
              ))}

              {/* New group button */}
              {!creatingGroup && (
                <button type="button" onClick={() => setCreatingGroup(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-dashed border-pink-300 text-pink-500 hover:bg-pink-50 transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Новая группа
                </button>
              )}
            </div>

            {/* Inline group creation */}
            {creatingGroup && (
              <div className="mt-3 p-3 bg-pink-50 rounded-xl border border-pink-200 animate-scale-in">
                <p className="text-xs font-medium text-pink-700 mb-2">Новая группа</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {GROUP_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setNewGroupEmoji(e)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${newGroupEmoji === e ? 'bg-white ring-2 ring-pink-400 scale-110' : 'hover:bg-white/70'}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateGroup())}
                    placeholder="Название группы"
                    maxLength={30}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                  <button type="button" onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 disabled:opacity-40 transition-colors">
                    OK
                  </button>
                  <button type="button" onClick={() => setCreatingGroup(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-500 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {isEdit ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
