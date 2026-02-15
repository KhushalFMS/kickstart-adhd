'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playNotification()
          handleSessionComplete()
          return isBreak ? 25 * 60 : 5 * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isBreak])

  useEffect(() => {
    const stored = localStorage.getItem('pomodoro-sessions')
    if (stored) {
      setSessions(parseInt(stored, 10))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', sessions.toString())
  }, [sessions])

  const playNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break complete!' : 'Focus session complete!', {
        body: isBreak ? 'Time to focus again.' : 'Take a 5-minute break.',
        icon: '/icon.svg',
      })
    }
  }

  const handleSessionComplete = () => {
    if (!isBreak) {
      setSessions((prev) => prev + 1)
    }
    setIsBreak(!isBreak)
  }

  const toggleTimer = () => {
    if (!isRunning && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60)
  }

  const skipSession = () => {
    setIsRunning(false)
    setIsBreak(!isBreak)
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60)
    if (!isBreak) {
      setSessions((prev) => prev + 1)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <div className="text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">
            Sessions completed: {sessions}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-200 dark:border-neutral-800"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
              {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isBreak ? 'Relax and recharge' : 'Stay focused on your task'}
            </p>
          </div>

          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-neutral-200 dark:text-neutral-800"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isBreak ? 'text-green-500' : 'text-primary-500'}
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div 
                  className="text-6xl font-display font-bold text-neutral-900 dark:text-white tabular-nums"
                  role="timer"
                  aria-live="off"
                  aria-label={`${minutes} minutes ${seconds} seconds remaining`}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={toggleTimer}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRunning
                  ? 'bg-neutral-700 hover:bg-neutral-800 focus:ring-neutral-500'
                  : isBreak
                  ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                  : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
              }`}
              aria-label={isRunning ? 'Pause timer' : `Start ${isBreak ? 'break' : 'focus'} timer`}
            >
              {isRunning ? (
                <>⏸️ Pause</>
              ) : (
                <>▶️ {isBreak ? 'Start Break' : 'Start Focus'}</>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-4 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              aria-label="Reset timer"
            >
              🔄 Reset
            </button>
          </div>

          <button
            onClick={skipSession}
            className="w-full py-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus:outline-none focus:underline"
            aria-label={`Skip to ${isBreak ? 'focus' : 'break'} session`}
          >
            Skip to {isBreak ? 'Focus' : 'Break'}
          </button>

          <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Pomodoro Technique
            </h2>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• 25 minutes of focused work</li>
              <li>• 5 minute break</li>
              <li>• Repeat for 4 sessions</li>
              <li>• Take longer break (15-30min)</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}