import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Трекер привычек',
  description: 'Отслеживай свои ежедневные привычки',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen" style={{backgroundColor: '#fff0f5'}}>{children}</body>
    </html>
  )
}
