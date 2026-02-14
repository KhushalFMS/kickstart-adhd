import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CalmModeStore {
  isCalm: boolean
  bodyDoublingEnabled: boolean
  toggleCalm: () => void
  toggleBodyDoubling: () => void
  setBodyDoublingEnabled: (enabled: boolean) => void
}

export const useCalmMode = create<CalmModeStore>()(
  persist(
    (set) => ({
      isCalm: false,
      bodyDoublingEnabled: false,
      toggleCalm: () => set((state) => {
        const newCalm = !state.isCalm
        // Apply to document
        if (typeof document !== 'undefined') {
          if (newCalm) {
            document.documentElement.classList.add('calm-mode')
          } else {
            document.documentElement.classList.remove('calm-mode')
          }
        }
        return { isCalm: newCalm }
      }),
      toggleBodyDoubling: () =>
        set((state) => ({
          bodyDoublingEnabled: !state.bodyDoublingEnabled,
        })),
      setBodyDoublingEnabled: (enabled) =>
        set(() => ({
          bodyDoublingEnabled: enabled,
        })),
    }),
    {
      name: 'calm-mode-storage',
    }
  )
)
