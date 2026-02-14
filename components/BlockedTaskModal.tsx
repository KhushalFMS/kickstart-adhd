'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTaskStore } from '@/store/taskStore'
import { Tables } from '@/lib/supabase'
import { useModalA11y } from '@/lib/useModalA11y'

type Task = Tables<'tasks'>

interface BlockedTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

const BLOCKING_REASONS = [
  { id: 'unclear', label: 'Unclear what to write/do', microAction: 'Open document and write title or first bullet point (30 sec)' },
  { id: 'info', label: 'Need more information', microAction: 'Write list of 3 specific things you need to know (2 min)' },
  { id: 'hard', label: 'Feels too hard/overwhelming', microAction: 'Write worst possible version in 5 minutes. Done is better than perfect.' },
  { id: 'avoid', label: 'Don\'t want to do it', microAction: 'Do only the first 30 seconds. Timer starts now. Then decide if you continue.' },
]

export default function BlockedTaskModal({ task, isOpen, onClose }: BlockedTaskModalProps) {
  const updateTask = useTaskStore((state) => state.updateTask)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customMicroAction, setCustomMicroAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useModalA11y(isOpen, onClose, dialogRef, closeButtonRef)

  useEffect(() => {
    if (!isOpen) return
    setSelectedReason(null)
    setCustomMicroAction('')
    setLoading(false)
    setErrorMessage('')
  }, [isOpen, task.id])

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId)
    const reason = BLOCKING_REASONS.find(r => r.id === reasonId)
    if (reason) {
      setCustomMicroAction(reason.microAction)
    }
  }

  const handleUnblock = async () => {
    const trimmedAction = customMicroAction.trim()
    if (!selectedReason || !trimmedAction) {
      setErrorMessage('Add a concrete first action to continue.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      const reason = BLOCKING_REASONS.find(r => r.id === selectedReason)
      
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'blocked',
          blocked_reason: reason?.label || null,
          micro_actions: [trimmedAction]
        })
        .eq('id', task.id)

      if (error) throw error

      updateTask(task.id, {
        status: 'blocked',
        blocked_reason: reason?.label || null,
        micro_actions: [trimmedAction]
      })

      onClose()
    } catch (err) {
      console.error('Error unblocking task:', err)
      setErrorMessage('Could not save this breakdown. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="blocked-task-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-primary-600 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-semibold">TASK STUCK {'>'}24 HOURS</span>
              </div>
              <h2 id="blocked-task-title" className="text-2xl font-display font-bold text-neutral-900 mb-2">
                {task.title}
              </h2>
              <p className="text-neutral-600">
                Let&apos;s break this down into a concrete first step.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              aria-label="Close blocked task modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Blocking Reasons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              What's blocking you?
            </h3>
            <div className="space-y-2">
              {BLOCKING_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReasonSelect(reason.id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedReason === reason.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="font-medium text-neutral-900">{reason.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Micro Action */}
          {selectedReason && (
            <div className="mb-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Your first 30-second action:
              </h3>
              <textarea
                value={customMicroAction}
                onChange={(e) => setCustomMicroAction(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-primary-50 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-medium text-neutral-900"
                placeholder="Edit this to make it even more specific..."
              />
              <p className="mt-2 text-sm text-neutral-600">
                Make it so concrete you can start immediately. No thinking required.
              </p>
            </div>
          )}

          {/* Actions */}
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUnblock}
              disabled={!selectedReason || !customMicroAction.trim() || loading}
              className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                selectedReason && customMicroAction.trim()
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Unblocking...' : 'Unblock & Start'}
            </button>
          </div>

          <p className="mt-4 text-xs text-center text-neutral-500">
            This breakdown will be saved. You can edit it anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
