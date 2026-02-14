import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Tables } from '@/lib/supabase'

type Task = Tables<'tasks'>

interface TaskStore {
  tasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentTask: (task: Task | null) => void
  setLoading: (isLoading: boolean) => void
  
  // Computed
  queuedTasks: () => Task[]
  blockedTasks: () => Task[]
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,
      isLoading: false,
      
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => {
        const shouldPromoteToCurrent =
          !state.currentTask &&
          (task.status === 'queued' || task.status === 'active' || task.status === 'blocked')

        return {
          tasks: [...state.tasks, task],
          currentTask: shouldPromoteToCurrent ? task : state.currentTask
        }
      }),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        currentTask: state.currentTask?.id === id 
          ? { ...state.currentTask, ...updates } 
          : state.currentTask
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask
      })),
      
      setCurrentTask: (task) => set({ currentTask: task }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      queuedTasks: () => get().tasks.filter(t => t.status === 'queued'),
      
      blockedTasks: () => get().tasks.filter(t => t.status === 'blocked'),
    }),
    {
      name: 'kickstart-task-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
      ),
      partialize: (state) => ({
        tasks: state.tasks,
        currentTask: state.currentTask,
      }),
    }
  )
)
