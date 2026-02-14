'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useTaskStore } from '@/store/taskStore'
import { Tables } from '@/lib/supabase'
import { selectCurrentTask } from '@/lib/taskSelection'
import { formatDistanceToNow, differenceInHours } from 'date-fns'

type Task = Tables<'tasks'>
type AnalyticsProps = Record<string, string | number | boolean | null>

const TaskEntryModal = dynamic(() => import('@/components/TaskEntryModalV2'), { ssr: false })
const PreShipChecklist = dynamic(() => import('@/components/PreShipChecklist'), { ssr: false })
const BlockedTaskModal = dynamic(() => import('@/components/BlockedTaskModal'), { ssr: false })
const FocusSprint = dynamic(() => import('@/components/FocusSprint'), { ssr: false })
const DistractionCapture = dynamic(() => import('@/components/DistractionCapture'), { ssr: false })
const MomentumDashboard = dynamic(() => import('@/components/MomentumDashboard'), { ssr: false })
const BlockedTasksPanel = dynamic(() => import('@/components/BlockedTasksPanel'), { ssr: false })

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, setTasks, currentTask, setCurrentTask, updateTask, deleteTask } = useTaskStore()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [isDistractionCaptureOpen, setIsDistractionCaptureOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showMomentum, setShowMomentum] = useState(false)
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [blockedActionTaskId, setBlockedActionTaskId] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [hasTrackedSession, setHasTrackedSession] = useState(false)
  const [hasShownReturnNudge, setHasShownReturnNudge] = useState(false)

  const withRetry = useCallback(async <T,>(
    operation: () => Promise<T>,
    attempts = 3
  ): Promise<T> => {
    let lastError: unknown
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        if (attempt >= attempts || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 300))
      }
    }
    throw lastError
  }, [])

  const trackAnalytics = useCallback(
    async (eventName: string, properties: AnalyticsProps = {}) => {
      if (!user || (typeof navigator !== 'undefined' && navigator.doNotTrack === '1')) return

      try {
        await supabase.from('analytics_events').insert({
          event_name: eventName,
          properties,
        })
      } catch {
        // Analytics is non-blocking.
      }

      if (typeof window !== 'undefined') {
        const posthogCapture = (window as any).posthog?.capture
        if (typeof posthogCapture === 'function') {
          posthogCapture(eventName, properties)
        }
      }
    },
    [user]
  )

  const reloadTasksFromDatabase = useCallback(async () => {
    if (!user) return

    const data = await withRetry(async () => {
      const result = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (result.error) throw result.error
      return result.data
    })

    if (data) {
      const taskRows = data as Task[]
      setTasks(taskRows)
      const activeTask = taskRows.find((t) => t.status === 'active')
      const queuedTask = taskRows.find((t) => t.status === 'queued')
      const blockedTask = taskRows.find((t) => t.status === 'blocked')
      setCurrentTask(activeTask || queuedTask || blockedTask || null)
      setLoadError(null)
    }
  }, [user, setTasks, setCurrentTask, withRetry])

  // Keyboard shortcut for distraction capture (Cmd/Ctrl + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTypingField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      if (isTypingField) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        if (isTaskModalOpen || isChecklistOpen || isBlockedModalOpen) return
        setIsDistractionCaptureOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTaskModalOpen, isChecklistOpen, isBlockedModalOpen])

  // Load tasks on mount
  useEffect(() => {
    if (!user) return

    const loadTasks = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        const fetchPromise = reloadTasksFromDatabase()
        await Promise.race([fetchPromise, timeoutPromise])
      } catch (err: any) {
        console.error('Failed to load tasks:', err)
        setLoadError('Could not load tasks. Check your connection and retry.')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user, reloadTasksFromDatabase])

  useEffect(() => {
    if (!pendingDeleteTaskId) return

    const timeoutId = window.setTimeout(() => {
      setPendingDeleteTaskId(null)
    }, 4500)

    return () => window.clearTimeout(timeoutId)
  }, [pendingDeleteTaskId])

  useEffect(() => {
    if (!statusMessage) return

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null)
    }, 4500)

    return () => window.clearTimeout(timeoutId)
  }, [statusMessage])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleConnectivityChange = () => {
      const offline = !window.navigator.onLine
      setIsOffline(offline)
      setStatusMessage({
        type: offline ? 'error' : 'info',
        text: offline
          ? 'You are offline. Local view is available; cloud sync resumes when connected.'
          : 'Back online. Syncing latest tasks...',
      })
      if (!offline) {
        reloadTasksFromDatabase().catch(() => undefined)
      }
    }

    handleConnectivityChange()
    window.addEventListener('online', handleConnectivityChange)
    window.addEventListener('offline', handleConnectivityChange)

    return () => {
      window.removeEventListener('online', handleConnectivityChange)
      window.removeEventListener('offline', handleConnectivityChange)
    }
  }, [reloadTasksFromDatabase])

  useEffect(() => {
    if (!user || hasTrackedSession) return

    trackAnalytics('dashboard_opened', {
      queued_count: tasks.filter((task) => task.status === 'queued').length,
      blocked_count: tasks.filter((task) => task.status === 'blocked').length,
    }).catch(() => undefined)

    setHasTrackedSession(true)
  }, [user, tasks, hasTrackedSession, trackAnalytics])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const persistSeenTime = () => {
      window.localStorage.setItem('kickstart_last_seen_at', String(Date.now()))
    }

    persistSeenTime()
    window.addEventListener('beforeunload', persistSeenTime)
    document.addEventListener('visibilitychange', persistSeenTime)

    return () => {
      window.removeEventListener('beforeunload', persistSeenTime)
      document.removeEventListener('visibilitychange', persistSeenTime)
      persistSeenTime()
    }
  }, [])

  useEffect(() => {
    if (!currentTask || loading || hasShownReturnNudge || typeof window === 'undefined') return

    const lastSeenRaw = window.localStorage.getItem('kickstart_last_seen_at')
    const lastSeen = lastSeenRaw ? Number(lastSeenRaw) : null
    const awayForLong = lastSeen ? Date.now() - lastSeen > 1000 * 60 * 60 * 3 : false

    if (!awayForLong) return

    const firstAction = currentTask.micro_actions?.[0]
    setStatusMessage({
      type: 'info',
      text: firstAction
        ? `Welcome back. Start with this: ${firstAction}`
        : 'Welcome back. Use Quick Restart to get moving in under 30 seconds.',
    })
    setHasShownReturnNudge(true)
  }, [currentTask, loading, hasShownReturnNudge])

  // Check for stuck tasks (>24 hours) - passive check only, no auto-trigger
  const isTaskStuck = currentTask && currentTask.status === 'queued' && 
    differenceInHours(new Date(), new Date(currentTask.created_at)) >= 24 &&
    !currentTask.micro_actions

  const handleStartTask = async () => {
    if (!currentTask || !user) return
    
    // Check if already have an active task
    const hasActiveTask = tasks.some(t => t.status === 'active' && t.id !== currentTask.id)
    if (hasActiveTask) {
      setStatusMessage({
        type: 'info',
        text: 'You already have an active task. Complete it first.'
      })
      return
    }

    // Optimistic update
    const startedAt = new Date().toISOString()
    updateTask(currentTask.id, { 
      status: 'active', 
      started_at: startedAt 
    })

    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'active', started_at: startedAt })
          .eq('id', currentTask.id)

        if (error) throw error
      })
      await trackAnalytics('task_started', { task_id: currentTask.id })
    } catch (err) {
      // Revert on error
      updateTask(currentTask.id, { 
        status: 'queued', 
        started_at: null 
      })
      setStatusMessage({
        type: 'error',
        text: 'Failed to start task. Please try again.'
      })
    }
  }

  const handleCompleteTask = () => {
    if (!user || !currentTask) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12)
    }
    setIsChecklistOpen(true)
  }

  const handleMarkBlocked = async () => {
    if (!currentTask || !user) return
    if (isBlockedModalOpen) return // Prevent double-open
    setIsBlockedModalOpen(true)
  }

  const handleOpenDistractionCapture = () => {
    if (isTaskModalOpen || isChecklistOpen || isBlockedModalOpen) {
      setStatusMessage({
        type: 'info',
        text: 'Close the current dialog first, then capture your thought.'
      })
      return
    }
    setIsDistractionCaptureOpen(true)
  }

  const handleQuickRestart = async () => {
    if (!currentTask) {
      setEditingTask(null)
      setIsTaskModalOpen(true)
      return
    }

    if (currentTask.status === 'blocked') {
      setIsBlockedModalOpen(true)
      return
    }

    if (currentTask.status === 'queued') {
      await handleStartTask()
      const firstAction = currentTask.micro_actions?.[0]
      if (firstAction) {
        setStatusMessage({
          type: 'info',
          text: `30-second restart: ${firstAction}`,
        })
      }
      await trackAnalytics('quick_restart_used', { task_id: currentTask.id })
      return
    }

    if (currentTask.status === 'active') {
      const firstAction = currentTask.micro_actions?.[0] || currentTask.done_criteria
      setStatusMessage({
        type: 'info',
        text: `Resume now: ${firstAction}`,
      })
      await trackAnalytics('quick_restart_used', { task_id: currentTask.id })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return
    
    const taskToDelete = tasks.find(t => t.id === taskId)
    if (pendingDeleteTaskId !== taskId) {
      const isActiveTask = taskToDelete?.status === 'active'
      setPendingDeleteTaskId(taskId)
      setStatusMessage({
        type: 'info',
        text: isActiveTask
          ? 'This is your active task. Press delete again to confirm.'
          : 'Press delete again to confirm.'
      })
      return
    }
    setPendingDeleteTaskId(null)

    // Optimistic delete
    const wasCurrentTask = currentTask?.id === taskId
    if (wasCurrentTask) {
      const nextQueued = queuedTasks.find(t => t.id !== taskId)
      setCurrentTask(nextQueued || null)
    }
    deleteTask(taskId)

    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)

        if (error) throw error
      })
      await trackAnalytics('task_deleted', { task_id: taskId })
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to delete task. Syncing your queue...'
      })
      await reloadTasksFromDatabase().catch(() => {
        setStatusMessage({
          type: 'error',
          text: 'Could not sync queue. Please refresh the page.'
        })
      })
    }
  }

  const handleMoveBlockedTaskToQueue = async (taskId: string) => {
    if (!user) return

    setBlockedActionTaskId(taskId)
    updateTask(taskId, {
      status: 'queued',
      blocked_reason: null,
    })

    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'queued', blocked_reason: null })
          .eq('id', taskId)
        if (error) throw error
      })

      const task = tasks.find((item) => item.id === taskId)
      if (task && (!currentTask || currentTask.status === 'blocked')) {
        setCurrentTask({
          ...task,
          status: 'queued',
          blocked_reason: null,
        })
      }
      await trackAnalytics('blocked_task_returned_to_queue', { task_id: taskId })
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Could not move blocked task to queue. Syncing state...',
      })
      await reloadTasksFromDatabase().catch(() => {
        setStatusMessage({
          type: 'error',
          text: 'Could not sync queue. Please refresh the page.',
        })
      })
    } finally {
      setBlockedActionTaskId(null)
    }
  }

  const handleEditTask = (task: Task) => {
    if (!user) return
    if (isTaskModalOpen || isChecklistOpen || isBlockedModalOpen) return // Prevent modal conflicts
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const queuedTasks = tasks.filter(t => t.status === 'queued')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const blockedTasks = tasks.filter(t => t.status === 'blocked')
  const isTaskActive = currentTask?.status === 'active'

  // Check if task is approaching deadline (with validation)
  const isApproachingDeadline = currentTask && 
    currentTask.deadline && 
    !isNaN(new Date(currentTask.deadline).getTime()) &&
    differenceInHours(new Date(currentTask.deadline), new Date()) < 24 &&
    differenceInHours(new Date(currentTask.deadline), new Date()) > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-neutral-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  if (loadError && tasks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-neutral-200">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-display font-bold text-neutral-900 mb-2">Unable to load your queue</h2>
          <p className="text-neutral-600 mb-6">{loadError}</p>
          <button
            onClick={() => {
              setLoading(true)
              setLoadError(null)
              reloadTasksFromDatabase()
                .catch(() => setLoadError('Could not load tasks. Check your connection and retry.'))
                .finally(() => setLoading(false))
            }}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-4xl mx-auto"
      role="region"
      aria-labelledby="dashboard-title"
      aria-describedby="dashboard-keyboard-tips"
    >
      <p className="sr-only" id="dashboard-keyboard-tips">
        Keyboard tips: use Command or Control plus D to capture distraction quickly.
      </p>
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 id="dashboard-title" className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-neutral-600">
            {queuedTasks.length > 0 
              ? `${queuedTasks.length} ${queuedTasks.length === 1 ? 'task' : 'tasks'} in your queue`
              : 'Your queue is empty. Add a task to get started.'
            }
            {blockedTasks.length > 0 && ` • ${blockedTasks.length} blocked`}
          </p>
          {isOffline && (
            <p className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Offline Mode
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void handleQuickRestart()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            title="Quick restart current task"
          >
            <span aria-hidden>▶</span>
            <span className="text-sm font-semibold">Quick Restart</span>
          </button>
          <button
            onClick={handleOpenDistractionCapture}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            title="Capture distraction (Cmd/Ctrl+D)"
          >
            <span>💭</span>
            <span className="text-sm font-medium text-neutral-700">Distraction</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
            statusMessage.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-primary-200 bg-primary-50 text-primary-700'
          }`}
          role="status"
          aria-live={statusMessage.type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          <p className="text-sm font-medium">{statusMessage.text}</p>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-sm font-semibold opacity-80 hover:opacity-100"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Focus Sprint Timer (shows when task is active) */}
      <FocusSprint 
        isActive={isTaskActive}
        onComplete={() => {
          const notificationsEnabled =
            typeof window !== 'undefined' &&
            window.localStorage.getItem('kickstart_notification_pref') === 'enabled'

          if (!notificationsEnabled) return

          // Timer completed, show notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            new Notification('Focus Sprint Complete!', {
              body: 'Time to take a break or mark your task as done.',
              icon: '/favicon.ico'
            })
          }
        }}
      />

      {/* Current Task Card */}
      {currentTask ? (
        <div className={`bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 ${
          isApproachingDeadline ? 'border-warning' : 'border-primary-500'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-semibold text-primary-600">
                  {isTaskActive ? '⚡ ACTIVE TASK' : '→ NEXT UP'}
                </div>
                {isApproachingDeadline && (
                  <div className="text-sm font-semibold text-warning bg-warning/10 px-2 py-1 rounded">
                    ⚠️ Due soon
                  </div>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-3">
                {currentTask.title}
              </h2>
              {currentTask.micro_actions && currentTask.micro_actions.length > 0 && (
                <div className="mb-4 p-3 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                  <div className="text-sm font-semibold text-primary-700 mb-1">First Step:</div>
                  <div className="text-sm text-primary-900">{currentTask.micro_actions[0]}</div>
                </div>
              )}
            </div>
            {isTaskActive && (
              <div className="text-right">
                <div className="text-sm text-neutral-600 mb-1">Started</div>
                <div className="text-lg font-semibold text-neutral-900">
                  {currentTask.started_at && formatDistanceToNow(new Date(currentTask.started_at), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Done Criteria</div>
              <div className="text-neutral-900">{currentTask.done_criteria}</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-neutral-50 rounded-lg">
                <div className="text-sm text-neutral-600 mb-1">Deadline</div>
                <div className="font-semibold text-neutral-900">
                  {formatDistanceToNow(new Date(currentTask.deadline), { addSuffix: true })}
                </div>
              </div>
              <div className="flex-1 p-4 bg-neutral-50 rounded-lg">
                <div className="text-sm text-neutral-600 mb-1">Time</div>
                <div className="font-semibold text-neutral-900">
                  {currentTask.time_block_mins}m
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isTaskActive ? (
              <button
                onClick={handleCompleteTask}
                className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors"
              >
                Mark as Done →
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartTask}
                  className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Start Task
                </button>
                <button
                  onClick={handleMarkBlocked}
                  className={`px-6 py-4 font-semibold rounded-xl transition-colors ${
                    isTaskStuck 
                      ? 'bg-warning text-white animate-pulse-soft' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                  title={isTaskStuck ? 'Task stuck >24hrs - break it down!' : 'Task stuck? Break it down'}
                >
                  {isTaskStuck ? '⚠️ Stuck' : 'Stuck?'}
                </button>
              </>
            )}
                <button
                  onClick={() => handleEditTask(currentTask)}
                  className="px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
                  title="Edit task"
                  aria-label="Edit current task"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteTask(currentTask.id)}
                  className={`px-6 py-4 rounded-xl transition-colors ${
                    pendingDeleteTaskId === currentTask.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                  title={pendingDeleteTaskId === currentTask.id ? 'Click again to confirm delete' : 'Delete task'}
                  aria-label={pendingDeleteTaskId === currentTask.id ? 'Confirm delete current task' : 'Delete current task'}
                >
                  🗑️
                </button>
              </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎯</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
            No tasks in queue
          </h2>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            Add your first task to start focusing on what matters. One task at a time.
          </p>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Add First Task
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-neutral-600 mb-1">In Queue</div>
          <div className="text-3xl font-bold text-neutral-900">{queuedTasks.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-neutral-600 mb-1">Completed Today</div>
          <div className="text-3xl font-bold text-green-600">
            {completedTasks.filter(t => {
              const completedDate = t.completed_at ? new Date(t.completed_at) : null
              const today = new Date()
              return completedDate?.toDateString() === today.toDateString()
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-neutral-600 mb-1">Total Completed</div>
          <div className="text-3xl font-bold text-primary-600">{completedTasks.length}</div>
        </div>
      </div>

      <BlockedTasksPanel
        tasks={blockedTasks}
        currentTaskId={currentTask?.id ?? null}
        actionTaskId={blockedActionTaskId}
        onFocusTask={(task) => setCurrentTask(task)}
        onMoveToQueue={handleMoveBlockedTaskToQueue}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {currentTask && (
          <button
            onClick={() => {
              setEditingTask(null)
              setIsTaskModalOpen(true)
            }}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl shadow transition-colors border border-neutral-200"
          >
            + Add Another Task
          </button>
        )}
        <button 
          onClick={() => setShowMomentum(!showMomentum)}
          className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow transition-colors"
        >
          {showMomentum ? '← Back to Tasks' : '📊 View Progress'}
        </button>
        {completedTasks.length > 0 && !showMomentum && (
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl shadow transition-colors border border-neutral-200"
          >
            {showCompleted ? 'Hide' : 'View'} Completed ({completedTasks.length})
          </button>
        )}
      </div>

      {/* Momentum Dashboard View */}
      {showMomentum && (
        <MomentumDashboard tasks={tasks} />
      )}

      {/* Completed Tasks List */}
      {showCompleted && completedTasks.length > 0 && !showMomentum && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-4">
            Completed Tasks
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl">✓</div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900">{task.title}</div>
                  <div className="text-sm text-neutral-600">
                    Completed {task.completed_at && formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className={`transition-colors ${
                    pendingDeleteTaskId === task.id
                      ? 'text-red-600'
                      : 'text-neutral-400 hover:text-red-600'
                  }`}
                  aria-label={
                    pendingDeleteTaskId === task.id
                      ? `Confirm delete completed task ${task.title}`
                      : `Delete completed task ${task.title}`
                  }
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskEntryModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false)
          setEditingTask(null)
        }}
        editingTask={editingTask}
      />
      
      {currentTask && (
        <>
          <PreShipChecklist 
            task={currentTask}
            isOpen={isChecklistOpen}
            onClose={() => {
              setIsChecklistOpen(false)
              // Reload tasks to get latest state
              reloadTasksFromDatabase().catch(() => {
                setStatusMessage({
                  type: 'error',
                  text: 'Could not refresh task list. Please refresh the page.'
                })
              })
            }}
            onComplete={() => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([20, 30, 20])
              }
              if (currentTask) {
                trackAnalytics('task_completed', {
                  task_id: currentTask.id,
                  duration_minutes: currentTask.time_block_mins,
                }).catch(() => undefined)
              }
            }}
          />
          
          <BlockedTaskModal
            task={currentTask}
            isOpen={isBlockedModalOpen}
            onClose={() => setIsBlockedModalOpen(false)}
          />
        </>
      )}

      {/* Distraction Capture Modal */}
      <DistractionCapture
        isOpen={isDistractionCaptureOpen}
        onClose={() => setIsDistractionCaptureOpen(false)}
      />
    </div>
  )
}
