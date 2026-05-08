import type { Metadata } from 'next'
import Link from 'next/link'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export const metadata: Metadata = {
  title: 'Ritualr — The art of showing up',
  description: 'Трекер привычек и анти-привычек. Начни без регистрации, войди через Telegram, увидь что меняешься. Бесплатно.',
  openGraph: {
    title: 'Ritualr — Привычка, которая меняет всё',
    description: 'Трекер привычек и анти-привычек. Начни без регистрации, войди через Telegram, увидь что меняешься. Бесплатно.',
  },
}

const faq = [
  {
    q: 'А если я уже пробовал трекеры привычек и бросал?',
    a: 'Именно для таких он и сделан. Ritualr убирает всё, что мешало продолжать: сложный интерфейс, обязательную регистрацию, платную подписку. Остаётся только: отметил — и дальше живёшь.',
  },
  {
    q: 'Это бесплатно навсегда или потом появится подписка?',
    a: 'Бесплатно, без рекламы, без скрытых условий. Никакого «первые 14 дней бесплатно». Просто бесплатно.',
  },
  {
    q: 'Что будет если я не открою приложение несколько дней?',
    a: 'Стрик прервётся, но история останется. Можно начать новую цепочку с сегодняшнего дня. Приложение не осуждает и не шлёт push-уведомления каждые два часа.',
  },
  {
    q: 'Мои данные в безопасности?',
    a: 'Если входишь через Telegram — данные хранятся в облаке. Если без входа — только в твоём браузере, никуда не передаются. Данные не продаются, реклама не показывается.',
  },
  {
    q: 'А если у меня нет Telegram?',
    a: 'Начни без входа прямо сейчас — данные сохранятся в браузере. Когда появится Telegram — зайди, история подхватится. Или работай без входа постоянно: это тоже работает.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#EDE9FF' }}>

      {/* ── Nav ── */}
      <nav style={{ backgroundColor: '#101585' }} className="sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white tracking-tight">Ritualr</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#FFDD44', color: '#101585' }}
            >
              Открыть приложение
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-20 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-8 tracking-wide uppercase"
          style={{ backgroundColor: '#A78BFA', color: '#fff' }}
        >
          Бесплатно · Без регистрации · Работает в браузере
        </div>
        <h1
          className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4"
          style={{ color: '#101585' }}
        >
          The art of<br />showing up.
        </h1>
        <p className="text-lg mb-3 font-semibold" style={{ color: '#2D22C4' }}>
          «Привычка, которая меняет всё.»
        </p>
        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: '#2D22C4', opacity: 0.75 }}>
          Трекер привычек и анти-привычек: начни без регистрации, войди через Telegram, увидь что меняешься.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-base px-9 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#101585', color: '#fff' }}
        >
          Начать прямо сейчас — бесплатно →
        </Link>
        <p className="text-xs mt-4" style={{ color: '#A78BFA' }}>Без карты, без email, без паролей</p>
      </section>

      {/* ── Section 1 ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
          <div className="text-3xl mb-4">😮‍💨</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#101585' }}>Ты узнаёшь себя?</h2>
          <div className="space-y-4 leading-relaxed" style={{ color: '#2D22C4', opacity: 0.8 }}>
            <p>
              Четверг вечером. Приложение для привычек не открывалось уже 9 дней.
              Ты помнишь, как скачивал его в воскресенье с твёрдым намерением — «в этот раз всё серьёзно».
            </p>
            <p>
              Так было с Habitica. С заметкой в Notion. С тем приложением, у которого 4.8 в магазине.
            </p>
            <p>
              Каждый раз одно и то же: первые дни горишь, потом пропускаешь один день, потом — ещё один,
              а потом просто забываешь открыть. И привычка снова не сложилась.
            </p>
            <p className="font-semibold" style={{ color: '#101585', opacity: 1 }}>
              Проблема не в тебе. Проблема в том, что приложения делают отслеживание привычек сложнее, чем сами привычки.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2 ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
          <div className="text-3xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#101585' }}>
            Что если отметить сегодняшний день займёт 10 секунд?
          </h2>
          <div className="space-y-4 leading-relaxed" style={{ color: '#2D22C4', opacity: 0.8 }}>
            <p className="font-semibold" style={{ color: '#101585', opacity: 1 }}>Открыл. Поставил галочку. Закрыл.</p>
            <p>
              Никаких уровней и квестов. Никакой базы в Notion, которую сначала надо настроить.
              Никакой формы регистрации, которую лень заполнять в 11 вечера.
            </p>
            <p>Просто: сделал — отметил. Не сделал плохое — тоже отметил.</p>
            <p>
              Цепочка растёт. Через неделю ты видишь 7 закрытых дней. Через месяц — 24 из 30.
              И это уже не «я стараюсь», это факт.
            </p>
          </div>
          {/* visual chain */}
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: i < 6 ? '#101585' : '#EDE9FF',
                  color: i < 6 ? '#fff' : '#A78BFA',
                }}
              >
                {i < 6 ? '✓' : '·'}
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#A78BFA' }}>6 дней подряд — и ты уже в ритме</p>
        </div>
      </section>

      {/* ── Section 3: Anti-habits ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="rounded-3xl p-8 shadow-sm" style={{ backgroundColor: '#101585', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div className="text-3xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-4 text-white">
            Анти-привычки: то, чего не умеют другие
          </h2>
          <div className="space-y-4 leading-relaxed" style={{ color: '#A78BFA' }}>
            <p>Большинство трекеров работают только в одну сторону: добавь хорошее.</p>
            <p className="font-semibold text-white">Но что если твоя задача — перестать делать плохое?</p>
            <p>
              В Ritualr есть анти-привычки. Не ел сладкое — отметил.
              Не открывал Instagram после 22:00 — отметил. Не курил — отметил.
            </p>
            <p>
              Каждый день без плохой привычки становится видимым. Стрик из «не курил» растёт так же,
              как стрик из «ходил на прогулку». Это не просто галочка — это подтверждение, что контроль возможен.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {['🚬 Не курил', '🍰 Без сладкого', '📱 Без соцсетей'].map(item => (
              <div
                key={item}
                className="rounded-xl px-3 py-3 text-center text-sm font-medium"
                style={{ backgroundColor: '#2D22C4', color: '#A78BFA' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Telegram ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
          <div className="text-3xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#101585' }}>Вход через Telegram — и всё</h2>
          <div className="space-y-4 leading-relaxed" style={{ color: '#2D22C4', opacity: 0.8 }}>
            <p className="font-semibold" style={{ color: '#101585', opacity: 1 }}>Никаких паролей. Никаких писем «подтвердите почту».</p>
            <p>
              Нажал «Войти через Telegram» — и через 5 секунд твои привычки синхронизированы в облаке.
              История не потеряется, если сменишь телефон или очистишь браузер.
            </p>
            <p>
              Хочешь попробовать без входа — можно. Данные сохранятся в браузере.
              Зайдёшь через Telegram позже — история подхватится.
            </p>
            <p>Работает на любом устройстве с браузером: телефон, планшет, ноутбук.</p>
          </div>
        </div>
      </section>

      {/* ── Tagline break ── */}
      <section className="max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="text-2xl font-bold" style={{ color: '#2D22C4' }}>
          "Repeat until it's you."
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#101585' }}>Частые вопросы</h2>
        <div className="space-y-3">
          {faq.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
              <p className="font-semibold mb-2" style={{ color: '#101585' }}>{q}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#2D22C4', opacity: 0.75 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div
          className="rounded-3xl p-10"
          style={{ background: 'linear-gradient(135deg, #101585 0%, #2D22C4 100%)' }}
        >
          <div
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase"
            style={{ backgroundColor: '#FFDD44', color: '#101585' }}
          >
            Бесплатно навсегда
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Начни сегодня — не в понедельник
          </h2>
          <p className="mb-8" style={{ color: '#A78BFA' }}>
            Первая привычка добавляется за 30 секунд. Без регистрации, без подписки.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#FFDD44', color: '#101585' }}
          >
            Открыть Ritualr — это бесплатно →
          </Link>
        </div>
      </section>

    </main>
  )
}
