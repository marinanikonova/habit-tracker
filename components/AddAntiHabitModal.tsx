'use client'

import { useState } from 'react'
import { Frequency, FREQUENCY_ICONS } from '@/lib/types'
import { getFrequencyLabel } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

interface AddAntiHabitModalProps {
  onSave: (name: string, reason: string | null, frequency: Frequency) => void
  onClose: () => void
}

const FREQUENCIES: Frequency[] = ['daily', 'weekdays', 'weekends', 'weekly']

export default function AddAntiHabitModal({ onSave, onClose }: AddAntiHabitModalProps) {
  const { t, lang } = useLanguage()
  const [name, setName]         = useState('')
  const [reason, setReason]     = useState('')
  const [frequency, setFrequency] = useState<Frequency>('daily')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), reason.trim() || null, frequency)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚫</span>
            <h2 className="text-lg font-bold text-slate-800">{t('newAntiHabit')}</h2>
          </div>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('antiHabitName')}
            </label>
            <p className="text-xs text-slate-400 mb-2">{t('antiHabitNameHint')}</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('antiHabitPlaceholder')}
              maxLength={60}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('reasonLabel')} <span className="text-slate-400 font-normal">{t('reasonOptional')}</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('habitFrequency')}</label>
            <div className="grid grid-cols-4 gap-2">
              {FREQUENCIES.map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all border ${
                    frequency === f
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <span className="text-xl">{FREQUENCY_ICONS[f]}</span>
                  <span className={`text-[11px] leading-tight font-medium ${frequency === f ? 'text-white' : 'text-slate-500'}`}>
                    {getFrequencyLabel(f, lang)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
