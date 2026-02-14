import { create } from 'zustand'

interface TimerStore {
  timeLeft: number // seconds
  isRunning: boolean
  totalTime: number // seconds
  
  startTimer: (minutes: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timeLeft: 0,
  isRunning: false,
  totalTime: 0,
  
  startTimer: (minutes) => {
    const seconds = minutes * 60
    set({
      timeLeft: seconds,
      totalTime: seconds,
      isRunning: true
    })
  },
  
  pauseTimer: () => set({ isRunning: false }),
  
  resumeTimer: () => set({ isRunning: true }),
  
  resetTimer: () => set({
    timeLeft: 0,
    totalTime: 0,
    isRunning: false
  }),
  
  tick: () => {
    const { timeLeft, isRunning } = get()
    if (isRunning && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 })
    } else if (timeLeft === 0) {
      set({ isRunning: false })
    }
  }
}))
