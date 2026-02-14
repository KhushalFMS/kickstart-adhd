'use client'

import { Tables } from '@/lib/supabase'

type Task = Tables<'tasks'>

interface BlockedTasksPanelProps {
  tasks: Task[]
  currentTaskId: string | null
  actionTaskId: string | null
  onFocusTask: (task: Task) => void
  onMoveToQueue: (taskId: string) => Promise<void>
}

export default function BlockedTasksPanel({
  tasks,
  currentTaskId,
  actionTaskId,
  onFocusTask,
  onMoveToQueue,
}: BlockedTasksPanelProps) {
  if (tasks.length === 0) return null

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-neutral-900">Blocked Tasks ({tasks.length})</h3>
        <p className="text-xs text-neutral-500">Low-pressure recovery queue</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 truncate">{task.title}</p>
                {task.blocked_reason && (
                  <p className="text-sm text-neutral-600 mt-1">Blocked by: {task.blocked_reason}</p>
                )}
                {task.micro_actions && task.micro_actions[0] && (
                  <p className="text-sm text-primary-700 mt-1">First step: {task.micro_actions[0]}</p>
                )}
              </div>
              {currentTaskId === task.id && (
                <span className="text-xs font-semibold px-2 py-1 rounded bg-primary-100 text-primary-700">Current</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onFocusTask(task)}
                className="px-3 py-2 text-sm rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Focus This
              </button>
              <button
                onClick={() => void onMoveToQueue(task.id)}
                disabled={actionTaskId === task.id}
                className="px-3 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionTaskId === task.id ? 'Moving...' : 'Move to Queue'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
