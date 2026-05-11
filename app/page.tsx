'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// Brand colors
const C = {
  midnight: '#101585',
  dusk: '#2D22C4',
  lavender: '#A78BFA',
  haze: '#EDE9FF',
  spark: '#FFDD44',
}

// ─── Copy ────────────────────────────────────────────────────────────────────

const copy = {
  ru: {
    appName: 'Привычка',
    navCta: 'Начать',
    heroBadge: '✦ Привычка, которая меняет всё',
    heroHeadline: 'Бросить плохое\nтак же важно,\nкак начать хорошее',
    heroSub:
      'Привычка ведёт счёт всему — и полезному, и тому, что тебе ещё мешает',
    heroCta: 'Добавить первую привычку',
    heroTrust: 'Создай первую привычку за 30 секунд — она останется в браузере даже без входа',
    heroDay: 'День 0 из 7. Начни сегодня — и к воскресенью у тебя будет неделя',
    midCtaBtn: 'Добавить первую привычку',
    statsLabel: 'привычек уже создано',
    // Bento
    bentoTitle: 'Всё, что нужно. Ничего лишнего.',
    bento: {
      antiTitle: '🚫 Анти-привычки',
      antiDesc:
        'Первый трекер, где «не курить» и «бегать» стоят рядом. Каждый день — честный счёт.',
      streakTitle: '🔥 7 дней подряд',
      streakDesc: 'Серия горит. Не прерви.',
      freeTitle: 'Бесплатно',
      freeDesc: 'Без пробного периода. Навсегда.',
      noregTitle: '⚡ Без регистрации',
      noregDesc: 'Открой и начни. Данные в браузере.',
      groupsTitle: '🗂 Группы',
      groupsDesc: 'Здоровье, работа, личное — каждая привычка знает своё место.',
      noguiltTitle: '💙 Без осуждения',
      noguiltDesc: 'Сорвался? Начни заново. Без лекций.',
    },
    // Story
    storyTitle: 'Как работают анти-привычки',
    storyP1:
      'Добавь то, от чего хочешь избавиться: курение, прокрастинация, фастфуд, телефон перед сном.',
    storyP2: 'Каждый день приложение спрашивает одно: было сегодня или нет?',
    storyP3:
      'Если нет — серия растёт. Если да — обнуляется. Без осуждения, просто честный счёт.',
    storyBadge: '7 дней чисто → значок. 30 дней → ты уже другой человек',
    mockLabel: 'Не курю',
    mockDays: 'дней',
    mockSince: 'Серия: 7',
    // FAQ
    faqTitle: 'Вопросы',
    faq: [
      {
        q: 'Чем это отличается от Habitica или Streaks?',
        a: 'Habitica — это RPG-игра с аватарами и гильдиями. Streaks — только iOS. Ни одно из них не делает анти-привычки нативно. Привычка — веб, работает на любом устройстве, без игровой шелухи.',
      },
      {
        q: 'Я уже веду всё в Notion. Зачем мне ещё одно приложение?',
        a: 'Notion не спросит тебя утром «курил сегодня?» и не покажет серию из 12 чистых дней. Это другой инструмент для другой задачи. Можно использовать оба.',
      },
      {
        q: 'Данные сохранятся, если я закрою вкладку?',
        a: 'Без входа — данные в браузере, не пропадут при закрытии вкладки. Войди через Google — и всё переедет в облако, будет доступно с любого устройства.',
      },
      {
        q: 'Это бесплатно навсегда или будет подписка?',
        a: 'Сейчас — бесплатно и без ограничений. Если появятся платные функции — базовый трекер останется бесплатным.',
      },
      {
        q: 'А если я однажды сорвусь и не хочу это видеть?',
        a: 'Можно не отмечать. Можно сбросить серию и начать заново. Привычка не ведёт журнал вины — только то, что ты сам решаешь отметить.',
      },
    ],
    // CTA
    ctaHeadline: 'Половина работы — в том, чего ты больше не делаешь',
    ctaSub: 'Начни считать обе половины',
    ctaBtn: 'Попробовать один день',
    footerTagline: 'Трекер привычек и анти-привычек',
  },

  en: {
    appName: 'Ritualr',
    navCta: 'Start',
    heroBadge: '✦ Repeat until it\'s you',
    heroHeadline: 'Quitting is\na habit too',
    heroSub: 'Quitting bad habits counts as much as building good ones. Ritualr tracks both.',
    heroCta: 'Add your first habit',
    heroTrust: 'Create your first habit in 30 seconds — it stays in your browser, no sign-up needed',
    heroDay: 'Day 0 of 7. Start today — by Sunday you\'ll have a full week',
    midCtaBtn: 'Add your first habit',
    statsLabel: 'habits already tracked',
    // Bento
    bentoTitle: 'Everything you need. Nothing you don\'t.',
    bento: {
      antiTitle: '🚫 Anti-habits',
      antiDesc:
        'The first tracker where "stop smoking" and "go running" live side by side. An honest count, every day.',
      streakTitle: '🔥 7 days in a row',
      streakDesc: 'Your streak is alive. Don\'t break it.',
      freeTitle: '₀ Free forever',
      freeDesc: 'No trial. No tiers. No catch.',
      noregTitle: '⚡ No sign-up',
      noregDesc: 'Open and start. Data lives in your browser.',
      groupsTitle: '🗂 Groups',
      groupsDesc: 'Health, work, personal — each habit knows where it belongs.',
      noguiltTitle: '💙 No judgment',
      noguiltDesc: 'Slipped? Start fresh. No lectures.',
    },
    // Story
    storyTitle: 'How anti-habits work',
    storyP1:
      'Add what you want to quit: smoking, procrastination, junk food, phone before bed.',
    storyP2: 'Each day the app asks one simple question: Did you do it today?',
    storyP3:
      'If not, your streak grows. If yes, it resets. No guilt trips, just an honest count.',
    storyBadge: '7 days clean → badge. 30 days → you\'re already a different person',
    mockLabel: 'No smoking',
    mockDays: 'days',
    mockSince: 'Streak: 7',
    // FAQ
    faqTitle: 'Questions',
    faq: [
      {
        q: 'How is this different from Habitica or Streaks?',
        a: 'Habitica is an RPG game with avatars and guilds. Streaks is iOS-only. Neither treats anti-habits as a first-class feature. Ritualr works on any device, in any browser, without the game layer.',
      },
      {
        q: 'I already track everything in Notion. Why switch?',
        a: "Notion won't ask you \"did you smoke today?\" or show you a 12-day clean streak. Different tool, different job. You can use both.",
      },
      {
        q: 'Will my data survive if I close the tab?',
        a: 'Without sign-in — data lives in your browser and persists across sessions. Sign in with Google and everything moves to the cloud, available from any device.',
      },
      {
        q: 'Is this really free forever?',
        a: 'Right now — fully free, no limits. If paid features ever come, the core tracker stays free.',
      },
      {
        q: "What if I slip and don't want to see it?",
        a: "You don't have to mark it. You can reset a streak and start fresh. Ritualr doesn't keep a guilt log — only what you choose to record.",
      },
    ],
    // CTA
    ctaHeadline: 'Build good habits. Break bad ones.\nTrack both.',
    ctaSub: '',
    ctaBtn: 'Add your first (anti)-habit',
    footerTagline: 'Habit tracker and anti-habit tracker',
  },
} as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border-b last:border-b-0 cursor-pointer"
      style={{ borderColor: 'rgba(16,21,133,0.12)' }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="font-semibold text-base leading-snug" style={{ color: C.midnight }}>
          {q}
        </span>
        <span
          className="text-xl flex-shrink-0 transition-transform duration-200 select-none cursor-pointer"
          style={{
            color: C.dusk,
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </span>
      </div>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: 'rgba(16,21,133,0.65)' }}>
          {a}
        </p>
      )}
    </div>
  )
}

function PhoneMockup({ lang }: { lang: 'ru' | 'en' }) {
  return (
    <div className="relative select-none" style={{ width: 320, height: 380 }}>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 60% 40%, ${C.lavender}60 0%, transparent 70%)`,
          filter: 'blur(32px)',
        }}
      />

      {/* Card 3 — back, rotated left */}
      <div
        className="absolute rounded-3xl p-4 flex items-center gap-3"
        style={{
          width: 260,
          top: 60, left: 0,
          background: '#fff',
          boxShadow: '0 8px 32px rgba(16,21,133,0.10)',
          transform: 'rotate(-6deg)',
          opacity: 0.6,
        }}
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: C.haze }}>📵</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: C.midnight }}>
            {lang === 'ru' ? 'Меньше экрана' : 'Less screen time'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(16,21,133,0.4)' }}>
            {lang === 'ru' ? '3 дня подряд' : '3 days in a row'}
          </div>
        </div>
      </div>

      {/* Card 2 — anti-habit, rotated right */}
      <div
        className="absolute rounded-3xl p-4 flex items-center gap-3"
        style={{
          width: 270,
          top: 140, right: 0,
          background: `linear-gradient(135deg, ${C.midnight} 0%, ${C.dusk} 100%)`,
          boxShadow: '0 16px 48px rgba(16,21,133,0.35)',
          transform: 'rotate(4deg)',
        }}
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>🚭</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">
            {lang === 'ru' ? 'Не курю' : 'No smoking'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.lavender }}>
            {lang === 'ru' ? '7 дней чисто' : '7 days clean'}
          </div>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-2xl font-black leading-none" style={{ color: C.spark }}>7</span>
          <span className="text-base">🔥</span>
        </div>
      </div>

      {/* Card 1 — habit, center front */}
      <div
        className="absolute rounded-3xl p-4 flex items-center gap-3"
        style={{
          width: 280,
          top: 30, left: 20,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(16,21,133,0.18)',
          transform: 'rotate(-1deg)',
          zIndex: 10,
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: C.haze }}>🏃</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: C.midnight }}>
            {lang === 'ru' ? 'Утренняя пробежка' : 'Morning run'}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="rounded-full flex-1" style={{ height: 5, background: i <= 5 ? C.dusk : 'rgba(16,21,133,0.12)' }} />
            ))}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(16,21,133,0.4)' }}>
            {lang === 'ru' ? '5 из 7 дней' : '5 of 7 days'}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: C.dusk }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      {/* Streak pill — floating badge */}
      <div
        className="absolute rounded-2xl px-4 py-2 flex items-center gap-2"
        style={{
          bottom: 10, left: '50%', transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, ${C.spark}22, ${C.spark}10)`,
          border: `1px solid ${C.spark}50`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(255,221,68,0.15)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <span className="text-base">🏆</span>
        <span className="text-xs font-bold" style={{ color: C.midnight }}>
          {lang === 'ru' ? 'Серия 5 дней' : '5-day streak'}
        </span>
      </div>

    </div>
  )
}

function SocialProofTicker({ lang }: { lang: 'ru' | 'en' }) {
  const [count, setCount] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.habitCount) setCount(d.habitCount) })
      .catch(() => {})
  }, [])

  const items = lang === 'ru' ? [
    { icon: '🔥', text: count ? `${count} привычек создано` : 'Привычки и анти-привычки' },
    { icon: '✦', text: 'Работает без регистрации' },
    { icon: '📅', text: 'Отслеживай хорошее и плохое' },
    { icon: '✦', text: 'Серии и прогресс за неделю' },
    { icon: '🚫', text: 'Брось плохое — это тоже победа' },
    { icon: '✦', text: 'Сохраняется в браузере' },
  ] : [
    { icon: '🔥', text: count ? `${count} habits created` : 'Habits & anti-habits' },
    { icon: '✦', text: 'No sign-up required' },
    { icon: '📅', text: 'Track good and bad habits' },
    { icon: '✦', text: 'Streaks & weekly progress' },
    { icon: '🚫', text: 'Quitting counts too' },
    { icon: '✦', text: 'Saved in your browser' },
  ]

  // Duplicate for seamless loop
  const ticker = [...items, ...items]

  return (
    <div
      className="relative overflow-hidden py-3"
      style={{ background: C.midnight }}
    >
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${C.midnight}, transparent)` }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${C.midnight}, transparent)` }} />

      <div
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: 'ticker 28s linear infinite',
          width: 'max-content',
        }}
      >
        {ticker.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <span style={{ color: item.icon === '✦' ? C.spark : undefined }}>{item.icon}</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { lang } = useLanguage()
  const c = copy[lang]

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(16,21,133,0.08)',
        }}
      >
        <a href="/app" className="font-black text-xl tracking-tight" style={{ color: C.midnight }}>
          {c.appName}
        </a>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href="/app"
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: C.midnight, color: '#fff' }}
          >
            {c.navCta}
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative overflow-hidden px-5 pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col items-center text-center"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.haze} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Badge */}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: C.midnight, color: C.spark }}>
            {c.heroBadge}
          </span>

          {/* H1 */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
            style={{ color: C.midnight, whiteSpace: 'pre-line' }}
          >
            {c.heroHeadline}
          </h1>

          <p
            className="text-lg md:text-xl font-light max-w-lg leading-relaxed"
            style={{ color: 'rgba(16,21,133,0.65)' }}
          >
            {c.heroSub}
          </p>

          <a
            href="/app"
            className="mt-2 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base shadow-lg transition-transform hover:scale-105"
            style={{ background: C.spark, color: C.midnight }}
          >
            {c.heroCta}
          </a>

          {/* Trust line */}
          <p className="text-sm text-center" style={{ color: 'rgba(16,21,133,0.5)' }}>
            {c.heroTrust}
          </p>

          {/* Phone mockup */}
          <div className="mt-8 w-full flex justify-center">
            <PhoneMockup lang={lang} />
          </div>
        </div>
      </section>

      {/* Social proof ticker */}
      <SocialProofTicker lang={lang} />

      {/* ── BENTO GRID ───────────────────────────────────────────────────── */}
      <section
        id="bento"
        className="px-5 py-20 md:py-28 max-w-5xl mx-auto"
      >
        <h2
          className="text-3xl md:text-4xl font-black text-center mb-12"
          style={{ color: C.midnight }}
        >
          {c.bentoTitle}
        </h2>

        {/*
          Desktop grid: 4 columns
          Row 1: anti (col-span-2) | streak (col-span-2, row-span-2)
          Row 2: free (col-span-1) | noreg (col-span-1)
          Row 3: groups (col-span-2) | noguilt (col-span-2)
        */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Anti-habits — large, dark */}
          <div
            className="md:col-span-2 rounded-3xl p-7 flex flex-col gap-3"
            style={{ background: C.midnight, minHeight: '220px' }}
          >
            <span className="text-2xl font-black" style={{ color: C.spark }}>
              {c.bento.antiTitle}
            </span>
            <p className="text-base font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
              {c.bento.antiDesc}
            </p>
          </div>

          {/* Streak — tall, lavender */}
          <div
            className="md:col-span-2 md:row-span-2 rounded-3xl p-7 flex flex-col gap-6"
            style={{ background: C.lavender, minHeight: '300px' }}
          >
            {/* Header */}
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-black text-white">{c.bento.streakTitle}</span>
              <p className="text-base font-light leading-relaxed text-white/80">
                {c.bento.streakDesc}
              </p>
            </div>

            {/* Big number */}
            <div className="flex items-end gap-2">
              <span className="text-7xl font-black text-white leading-none">7</span>
              <span className="text-4xl mb-2">🔥</span>
            </div>

            {/* Week grid */}
            <div className="flex gap-2">
              {(lang === 'ru'
                ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
                : ['Mo','Tu','We','Th','Fr','Sa','Su']
              ).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-xl flex items-center justify-center"
                    style={{
                      height: 36,
                      background: i < 7 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {i < 7 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.lavender} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-white/60">{d}</span>
                </div>
              ))}
            </div>

            {/* Caption */}
            <p className="text-xs text-white/50">
              {lang === 'ru' ? 'Идеальная неделя — все 7 дней' : 'Perfect week — all 7 days'}
            </p>
          </div>

          {/* Free — spark yellow */}
          <div
            className="md:col-span-1 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative"
            style={{ background: C.spark, minHeight: '140px' }}
          >
            <span
              className="absolute -right-3 -bottom-4 font-black leading-none select-none pointer-events-none"
              style={{ fontSize: 96, color: 'rgba(16,21,133,0.08)' }}
            >
              ∞
            </span>
            <span className="text-3xl font-black" style={{ color: C.midnight }}>
              {lang === 'ru' ? 'Бесплатно' : 'Free'}
            </span>
            <p className="text-sm font-semibold mt-2" style={{ color: 'rgba(16,21,133,0.65)' }}>
              {c.bento.freeDesc}
            </p>
          </div>

          {/* No reg — haze */}
          <div
            className="md:col-span-1 rounded-3xl p-6 flex flex-col gap-2"
            style={{ background: C.haze, minHeight: '140px' }}
          >
            <span className="text-xl font-black" style={{ color: C.midnight }}>
              {c.bento.noregTitle}
            </span>
            <p className="text-sm font-light" style={{ color: 'rgba(16,21,133,0.6)' }}>
              {c.bento.noregDesc}
            </p>
          </div>

          {/* Groups — white */}
          <div
            className="md:col-span-2 rounded-3xl p-7 flex flex-col gap-3"
            style={{ background: '#fff', border: `1.5px solid ${C.haze}`, minHeight: '160px' }}
          >
            <span className="text-xl font-black" style={{ color: C.midnight }}>
              {c.bento.groupsTitle}
            </span>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(16,21,133,0.6)' }}>
              {c.bento.groupsDesc}
            </p>
            {/* Fake group pills */}
            <div className="flex gap-2 flex-wrap mt-1">
              {(lang === 'ru'
                ? ['💪 Здоровье', '💼 Работа', '🌱 Личное']
                : ['💪 Health', '💼 Work', '🌱 Personal']
              ).map((g) => (
                <span
                  key={g}
                  className="text-xs font-semibold px-3 py-1 rounded-xl"
                  style={{ background: C.haze, color: C.midnight }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* No guilt — dusk, white text */}
          <div
            className="md:col-span-2 rounded-3xl p-7 flex flex-col gap-3"
            style={{ background: C.dusk, minHeight: '160px' }}
          >
            <span className="text-xl font-black text-white">{c.bento.noguiltTitle}</span>
            <p className="text-sm font-light leading-relaxed text-white/80">
              {c.bento.noguiltDesc}
            </p>
          </div>

        </div>
      </section>

      {/* Mid-page CTA */}
      <div className="py-12 flex justify-center px-5">
        <div className="text-center flex flex-col items-center gap-4">
          <p className="text-sm font-medium" style={{ color: 'rgba(16,21,133,0.55)' }}>
            {lang === 'ru' ? 'Всё понятно? Начинай' : 'Convinced? Start now.'}
          </p>
          <a
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-transform hover:scale-105"
            style={{ background: C.midnight, color: C.spark }}
          >
            {c.midCtaBtn}
          </a>
        </div>
      </div>

      {/* ── STORY — How anti-habits work ─────────────────────────────────── */}
      <section
        id="story"
        className="px-5 py-20 md:py-28"
        style={{ background: C.haze }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <div className="flex flex-col gap-6">
            <h2
              className="text-3xl md:text-4xl font-black leading-tight"
              style={{ color: C.midnight }}
            >
              {c.storyTitle}
            </h2>
            <p className="text-base leading-relaxed font-light" style={{ color: 'rgba(16,21,133,0.7)' }}>
              {c.storyP1}
            </p>
            <p className="text-base leading-relaxed font-light" style={{ color: 'rgba(16,21,133,0.7)' }}>
              {c.storyP2}
            </p>
            <p className="text-base leading-relaxed font-light" style={{ color: 'rgba(16,21,133,0.7)' }}>
              {c.storyP3}
            </p>
            <p
              className="text-sm font-semibold px-4 py-3 rounded-2xl"
              style={{ background: C.midnight, color: C.spark }}
            >
              {c.storyBadge}
            </p>
          </div>

          {/* Fake UI mockup side */}
          <div className="flex justify-center">
            {/* Fake app shell */}
            <div
              className="rounded-3xl p-4 w-full max-w-sm flex flex-col gap-3"
              style={{
                background: '#fff',
                boxShadow: '0 24px 64px rgba(16,21,133,0.14)',
              }}
            >
              {/* App header */}
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-black text-base" style={{ color: C.midnight }}>
                  {lang === 'ru' ? 'Привычка' : 'Ritualr'}
                </span>
                <div
                  className="w-6 h-6 rounded-lg"
                  style={{ background: C.spark }}
                />
              </div>

              {/* Habit card (positive) */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: C.haze }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: C.midnight }}
                  >
                    🏃
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.midnight }}>
                      {lang === 'ru' ? 'Зарядка' : 'Morning run'}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(16,21,133,0.5)' }}>
                      {lang === 'ru' ? '5 из 7 дней' : '5 of 7 days'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black" style={{ color: C.dusk }}>5</span>
                  <span className="text-xs" style={{ color: 'rgba(16,21,133,0.4)' }}>🔥</span>
                </div>
              </div>

              {/* Anti-habit card */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: C.midnight }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    🚭
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {lang === 'ru' ? 'Не курю' : 'No smoking'}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {lang === 'ru' ? '7 дней чисто' : '7 days clean'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black" style={{ color: C.spark }}>7</span>
                  <span className="text-xs" style={{ color: C.spark }}>🔥</span>
                </div>
              </div>

              {/* Day row */}
              <div className="px-1 pb-1 flex gap-1">
                {(lang === 'ru'
                  ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
                  : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                ).map((d, i) => (
                  <div key={`${d}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs" style={{ color: 'rgba(16,21,133,0.35)' }}>
                      {d}
                    </span>
                    <div
                      className="w-full h-1.5 rounded-full"
                      style={{ background: i < 5 ? C.dusk : C.haze }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="px-5 py-20 md:py-28 max-w-2xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-black text-center mb-10"
          style={{ color: C.midnight }}
        >
          {c.faqTitle}
        </h2>
        <div>
          {c.faq.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        id="cta"
        className="px-5 py-24 md:py-32 text-center"
        style={{ background: C.midnight }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <p
            className="text-2xl md:text-3xl font-black leading-tight text-white whitespace-pre-line"
          >
            {c.ctaHeadline}
          </p>
          {c.ctaSub && <p className="text-lg font-light text-white/70">{c.ctaSub}</p>}
          <a
            href="/app"
            className="mt-2 inline-flex items-center px-8 py-4 rounded-2xl font-black text-base shadow-xl transition-transform hover:scale-105"
            style={{ background: C.spark, color: C.midnight }}
          >
            {c.ctaBtn}
          </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm"
        style={{
          background: '#0a0d4a',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        <span className="font-bold text-white/70">{c.appName}</span>
        <span>{c.footerTagline}</span>
        <a href="/app" className="hover:text-white/70 transition-colors">
          {lang === 'ru' ? 'Открыть приложение →' : 'Open app →'}
        </a>
      </footer>
    </div>
  )
}
