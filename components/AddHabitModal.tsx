'use client'

import { useState } from 'react'
import { Frequency, FREQUENCY_ICONS, Group, Habit } from '@/lib/types'
import { getFrequencyLabel } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

interface AddHabitModalProps {
  groups: Group[]
  initialHabit?: Habit
  onSave: (name: string, emoji: string, color: string, groupId: string | null, frequency: Frequency) => void
  onAddGroup: (name: string, emoji: string) => Group
  onClose: () => void
}

const EMOJIS = ['🏃', '📚', '💧', '🧘', '🎨', '💪', '🥗', '😴', '🎵', '✍️', '🌿', '🧹', '📝', '🚴', '🌅', '🧠']
const COLORS = ['pink', 'rose', 'amber', 'teal', 'sky', 'violet', 'emerald', 'indigo']

const GROUP_EMOJIS = ['💪', '📚', '🏠', '🎯', '💼', '🌱', '🎨', '🧠', '❤️', '⚡']

const FREQUENCIES: Frequency[] = ['daily', 'weekdays', 'weekends', 'weekly']

// Color dots — keep original palette for user choice
const colorDotMap: Record<string, string> = {
  pink:    '#ec4899',
  rose:    '#f43f5e',
  amber:   '#f59e0b',
  teal:    '#14b8a6',
  sky:     '#0ea5e9',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  indigo:  '#6366f1',
}

export default function AddHabitModal({ groups, initialHabit, onSave, onAddGroup, onClose }: AddHabitModalProps) {
  const { t, lang } = useLanguage()
  const isEdit = !!initialHabit

  const [name, setName]         = useState(initialHabit?.name      ?? '')
  const [emoji, setEmoji]       = useState(initialHabit?.emoji     ?? '🏃')
  const [color, setColor]       = useState(initialHabit?.color     ?? 'pink')
  const [groupId, setGroupId]   = useState<string | null>(initialHabit?.groupId ?? null)
  const [frequency, setFrequency] = useState<Frequency>(initialHabit?.frequency ?? 'daily')

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
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
          <h2 className="text-lg font-bold" style={{ color: '#101585' }}>
            {isEdit ? t('editHabit') : t('newHabit')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#A78BFA' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D22C4' }}>{t('habitName')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isEdit ? '' : t('habitNamePlaceholder')}
              maxLength={50}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all"
              style={{
                border: '1px solid rgba(167,139,250,0.3)',
                color: '#101585',
                boxShadow: '0 0 0 0px rgba(167,139,250,0)',
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.25)'; e.currentTarget.style.borderColor = '#A78BFA' }}
              onBlur={e => { e.currentTarget.style.boxShadow = '0 0 0 0px rgba(167,139,250,0)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)' }}
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D22C4' }}>{t('habitIcon')}</label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className="h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: emoji === e ? 'rgba(167,139,250,0.15)' : 'transparent',
                    outline: emoji === e ? '2px solid #A78BFA' : '2px solid transparent',
                    transform: emoji === e ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D22C4' }}>{t('habitColor')}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: colorDotMap[c],
                    outline: color === c ? `3px solid ${colorDotMap[c]}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D22C4' }}>{t('habitFrequency')}</label>
            <div className="grid grid-cols-4 gap-2">
              {FREQUENCIES.map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all"
                  style={{
                    backgroundColor: frequency === f ? 'rgba(16,21,133,0.06)' : 'transparent',
                    border: frequency === f ? '1px solid rgba(45,34,196,0.35)' : '1px solid rgba(167,139,250,0.25)',
                    color: frequency === f ? '#101585' : '#A78BFA',
                  }}>
                  <span className="text-xl">{FREQUENCY_ICONS[f]}</span>
                  <span className="text-[11px] leading-tight font-medium">
                    {getFrequencyLabel(f, lang)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D22C4' }}>{t('habitGroup')}</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setGroupId(null)}
                className="px-3 py-1.5 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: groupId === null ? 'rgba(16,21,133,0.06)' : 'transparent',
                  border: groupId === null ? '1px solid rgba(45,34,196,0.35)' : '1px solid rgba(167,139,250,0.25)',
                  color: groupId === null ? '#101585' : '#A78BFA',
                  fontWeight: groupId === null ? 600 : 400,
                }}>
                {t('noGroup')}
              </button>

              {groups.map(g => (
                <button key={g.id} type="button" onClick={() => setGroupId(g.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: groupId === g.id ? 'rgba(16,21,133,0.06)' : 'transparent',
                    border: groupId === g.id ? '1px solid rgba(45,34,196,0.35)' : '1px solid rgba(167,139,250,0.25)',
                    color: groupId === g.id ? '#101585' : '#A78BFA',
                    fontWeight: groupId === g.id ? 600 : 400,
                  }}>
                  <span>{g.emoji}</span>
                  {g.name}
                </button>
              ))}

              {!creatingGroup && (
                <button type="button" onClick={() => setCreatingGroup(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all"
                  style={{ border: '1px dashed #A78BFA', color: '#2D22C4' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {t('newGroup')}
                </button>
              )}
            </div>

            {creatingGroup && (
              <div
                className="mt-3 p-3 rounded-xl animate-scale-in"
                style={{ backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: '#2D22C4' }}>{t('newGroupLabel')}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {GROUP_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setNewGroupEmoji(e)}
                      className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: newGroupEmoji === e ? '#fff' : 'transparent',
                        outline: newGroupEmoji === e ? '2px solid #A78BFA' : '2px solid transparent',
                      }}>
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
                    placeholder={t('groupNamePlaceholder')}
                    maxLength={30}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-white focus:outline-none"
                    style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#101585' }}
                  />
                  <button type="button" onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="px-3 py-1.5 text-white text-sm rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
                    style={{ backgroundColor: '#101585' }}>
                    OK
                  </button>
                  <button type="button" onClick={() => setCreatingGroup(false)}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                    style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ backgroundColor: '#101585' }}>
              {isEdit ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
