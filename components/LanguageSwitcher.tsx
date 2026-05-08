'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden text-xs font-semibold"
      style={{ border: '1px solid rgba(16,21,133,0.2)' }}
    >
      <button
        onClick={() => setLang('ru')}
        className="px-2.5 py-1.5 transition-colors"
        style={{
          backgroundColor: lang === 'ru' ? '#101585' : 'transparent',
          color: lang === 'ru' ? '#fff' : 'rgba(16,21,133,0.45)',
        }}
      >
        RU
      </button>
      <button
        onClick={() => setLang('en')}
        className="px-2.5 py-1.5 transition-colors"
        style={{
          backgroundColor: lang === 'en' ? '#101585' : 'transparent',
          color: lang === 'en' ? '#fff' : 'rgba(16,21,133,0.45)',
        }}
      >
        EN
      </button>
    </div>
  )
}
