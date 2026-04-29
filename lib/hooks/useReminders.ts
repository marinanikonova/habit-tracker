'use client'

import { useEffect, useRef } from 'react'
import { Habit } from '@/lib/types'

export function useReminders(habits: Habit[], today: string) {
  const notifiedRef = useRef<Set<string>>(new Set())

  // Request permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    function check() {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const currentTime = `${hh}:${mm}`

      habits.forEach(habit => {
        if (!habit.reminder?.enabled) return
        if (habit.reminder.time !== currentTime) return
        if (habit.completions.includes(today)) return

        const key = `${habit.id}-${today}-${currentTime}`
        if (notifiedRef.current.has(key)) return
        notifiedRef.current.add(key)

        if (Notification.permission === 'granted') {
          new Notification(`${habit.emoji} ${habit.name}`, {
            body: 'Время выполнить привычку! ✨',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          })
        }
      })
    }

    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [habits, today])
}
