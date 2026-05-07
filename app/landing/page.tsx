import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Наконец не брось на второй неделе — трекер привычек бесплатно',
  description: 'Снова бросил трекер привычек? Мои привычки: бесплатный трекер с анти-привычками и стриками. Вход через Telegram за 5 секунд — без паролей и регистрации.',
  openGraph: {
    title: 'Мои привычки — трекер без регистрации и подписки',
    description: 'Снова бросил трекер привычек? Мои привычки: бесплатный трекер с анти-привычками и стриками. Вход через Telegram за 5 секунд — без паролей и регистрации.',
  },
}

const faq = [
  {
    q: 'А если я уже пробовал трекеры привычек и бросал?',
    a: 'Именно для таких он и сделан. «Мои привычки» убирает всё, что мешало продолжать: сложный интерфейс, обязательную регистрацию, платную подписку. Остаётся только: отметил — и дальше живёшь.',
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
    <main className="min-h-screen" style={{ backgroundColor: '#fff0f5' }}>

      {/* ── Nav ── */}
      <nav className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-800">🌱 Мои привычки</span>
        <Link
          href="/"
          className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-colors"
          style={{ backgroundColor: '#f43f5e' }}
        >
          Открыть трекер
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-6 pt-12 pb-16 text-center">
        <div className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Бесплатно · Без регистрации · Работает в браузере
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
          Наконец не брось<br />на второй неделе
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto">
          Трекер привычек и анти-привычек: начни без регистрации, войди через Telegram, увидь что меняешься.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: '#f43f5e' }}
        >
          Начать прямо сейчас — бесплатно →
        </Link>
        <p className="text-xs text-slate-400 mt-4">Без карты, без email, без паролей</p>
      </section>

      {/* ── Section 1 ── */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          <div className="text-3xl mb-4">😮‍💨</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Ты узнаёшь себя?</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
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
            <p className="font-semibold text-slate-800">
              Проблема не в тебе. Проблема в том, что приложения делают отслеживание привычек сложнее, чем сами привычки.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2 ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          <div className="text-3xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Что если отметить сегодняшний день займёт 10 секунд?
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800">Открыл. Поставил галочку. Закрыл.</p>
            <p>
              Никаких уровней и квестов. Никакой базы в Notion, которую сначала надо настроить.
              Никакой формы регистрации, которую лень заполнять в 11 вечера.
            </p>
            <p>Просто: сделал — отметил. Не сделал плохое — тоже отметил.</p>
            <p>
              Цепочка растёт. Через неделю ты видишь 7 зелёных дней. Через месяц — 24 из 30.
              И это уже не «я стараюсь», это факт.
            </p>
          </div>
          {/* visual chain */}
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: i < 6 ? '#f43f5e' : '#fce7f3', color: i < 6 ? '#fff' : '#f9a8d4' }}
              >
                {i < 6 ? '✓' : '·'}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">6 дней подряд — и ты уже в ритме</p>
        </div>
      </section>

      {/* ── Section 3: Anti-habits ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          <div className="text-3xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Анти-привычки: то, чего не умеют другие
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>Большинство трекеров работают только в одну сторону: добавь хорошее.</p>
            <p className="font-semibold text-slate-800">Но что если твоя задача — перестать делать плохое?</p>
            <p>
              В «Мои привычки» есть анти-привычки. Не ел сладкое — отметил.
              Не открывал Instagram после 22:00 — отметил. Не курил — отметил.
            </p>
            <p>
              Каждый день без плохой привычки становится видимым. Стрик из «не курил» растёт так же,
              как стрик из «ходил на прогулку». Это не просто галочка — это подтверждение, что контроль возможен.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {['🚬 Не курил', '🍰 Без сладкого', '📱 Без соцсетей'].map(item => (
              <div key={item} className="bg-slate-50 rounded-xl px-3 py-3 text-center text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Telegram ── */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          <div className="text-3xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Вход через Telegram — и всё</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800">Никаких паролей. Никаких писем «подтвердите почту».</p>
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

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Частые вопросы</h2>
        <div className="space-y-3">
          {faq.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <p className="font-semibold text-slate-800 mb-2">{q}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div
          className="rounded-3xl p-10"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Начни сегодня — не в понедельник
          </h2>
          <p className="text-pink-100 mb-8">
            Первая привычка добавляется за 30 секунд. Без регистрации, без подписки.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105"
            style={{ color: '#f43f5e' }}
          >
            Открыть трекер — это бесплатно →
          </Link>
        </div>
      </section>

    </main>
  )
}
