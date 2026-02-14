'use client'

import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/timerStore'

interface FocusSprintProps {
  isActive: boolean
  onComplete?: () => void
}

export default function FocusSprint({ isActive, onComplete }: FocusSprintProps) {
  const { timeLeft, isRunning, totalTime, startTimer, pauseTimer, resumeTimer, resetTimer, tick } = useTimerStore()
  const [hasCompletedCurrentSession, setHasCompletedCurrentSession] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (!isActive && isRunning) {
      pauseTimer()
    }
  }, [isActive, isRunning, pauseTimer])

  // Tick every second
  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, tick])

  // Call onComplete when timer hits 0
  useEffect(() => {
    if (timeLeft > 0 && hasCompletedCurrentSession) {
      setHasCompletedCurrentSession(false)
    }
  }, [timeLeft, hasCompletedCurrentSession])

  useEffect(() => {
    if (timeLeft === 0 && totalTime > 0 && !hasCompletedCurrentSession) {
      if (onComplete) onComplete()
      setHasCompletedCurrentSession(true)
    }
  }, [timeLeft, totalTime, onComplete, hasCompletedCurrentSession])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  if (!isActive) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 mb-6 border-2 border-primary-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-display font-bold text-neutral-900">Focus Sprint</h3>
        </div>
        {timeLeft > 0 && (
          <span className="text-sm text-neutral-600">
            {Math.round(progress)}% complete
          </span>
        )}
      </div>

      {/* Timer Display */}
      {timeLeft > 0 ? (
        <>
          {/* Progress Ring */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#f5f5f5"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#f59e37"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={reduceMotion ? '' : 'transition-all duration-1000'}
              />
            </svg>
            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-display font-bold text-neutral-900">
                {formatTime(minutes, seconds)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-colors"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                ▶️ Resume
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Start Options */}
          <p className="text-center text-neutral-700 mb-6">
            Start a focused work session. One task, one timer.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => startTimer(15)}
              className="p-4 bg-white hover:bg-primary-50 border-2 border-primary-200 rounded-xl transition-colors group"
            >
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold text-neutral-900">Quick Sprint</div>
              <div className="text-sm text-neutral-600">15 minutes</div>
            </button>
            <button
              onClick={() => startTimer(25)}
              className="p-4 bg-white hover:bg-primary-50 border-2 border-primary-200 rounded-xl transition-colors"
            >
              <div className="text-3xl mb-2">🍅</div>
              <div className="font-semibold text-neutral-900">Pomodoro</div>
              <div className="text-sm text-neutral-600">25 minutes</div>
            </button>
            <button
              onClick={() => startTimer(45)}
              className="p-4 bg-white hover:bg-primary-50 border-2 border-primary-200 rounded-xl transition-colors"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-neutral-900">Deep Work</div>
              <div className="text-sm text-neutral-600">45 minutes</div>
            </button>
            <button
              onClick={() => startTimer(5)}
              className="p-4 bg-white hover:bg-primary-50 border-2 border-primary-200 rounded-xl transition-colors"
            >
              <div className="text-3xl mb-2">☕</div>
              <div className="font-semibold text-neutral-900">Break</div>
              <div className="text-sm text-neutral-600">5 minutes</div>
            </button>
          </div>
          <p className="text-xs text-center text-neutral-500">
            Timer pauses automatically if you switch tasks
          </p>
        </>
      )}
    </div>
  )
}
