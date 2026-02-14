import { Tables } from '@/lib/supabase'

type Task = Tables<'tasks'>

export const selectCurrentTask = (tasks: Task[]): Task | null => {
  const activeTask = tasks.find((task) => task.status === 'active')
  if (activeTask) return activeTask

  const queuedTask = tasks.find((task) => task.status === 'queued')
  if (queuedTask) return queuedTask

  const blockedTask = tasks.find((task) => task.status === 'blocked')
  return blockedTask || null
}
