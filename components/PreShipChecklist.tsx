'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTaskStore } from '@/store/taskStore'
import { Tables } from '@/lib/supabase'
import { useModalA11y } from '@/lib/useModalA11y'

type Task = Tables<'tasks'>

interface PreShipChecklistProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export default function PreShipChecklist({ task, isOpen, onClose, onComplete }: PreShipChecklistProps) {
  const updateTask = useTaskStore((state) => state.updateTask)
  
  const [checks, setChecks] = useState({
    numbers: false,
    formatting: false,
    logic: false,
    ready: false,
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const allChecked = Object.values(checks).every(v => v)

  useModalA11y(isOpen, onClose, dialogRef, closeButtonRef)

  useEffect(() => {
    if (!isOpen) return

    setChecks({
      numbers: false,
      formatting: false,
      logic: false,
      ready: false,
    })
    setErrorMessage('')
    setLoading(false)
  }, [isOpen, task.id])

  const handleCheckChange = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleComplete = async () => {
    if (!allChecked) return

    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          skipped_qc: false,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (error) throw error

      updateTask(task.id, { 
        status: 'completed',
        skipped_qc: false,
        completed_at: new Date().toISOString()
      })
      
      if (onComplete) onComplete()
      onClose()
    } catch (err) {
      console.error('Error completing task:', err)
      setErrorMessage('Could not mark this task as complete. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    setErrorMessage('')
    
    // Log skip event (fire-and-forget, don't block completion)
    if (task.user_id) {
      void (async () => {
        try {
          await supabase.from('error_logs').insert({
            user_id: task.user_id,
            task_id: task.id,
            error_type: 'skipped_qc',
            description: 'User skipped pre-ship checklist'
          })
        } catch (err) {
          console.error('Failed to log QC skip:', err)
        }
      })()
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          skipped_qc: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (error) throw error

      updateTask(task.id, { 
        status: 'completed',
        skipped_qc: true,
        completed_at: new Date().toISOString()
      })
      
      if (onComplete) onComplete()
      onClose()
    } catch (err) {
      console.error('Error completing task:', err)
      setErrorMessage('Could not skip checklist right now. Please try again.')
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
        aria-labelledby="preship-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-primary-600 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">PRE-SHIP CHECKLIST</span>
              </div>
              <h2 id="preship-title" className="text-2xl font-display font-bold text-neutral-900">
                {task.title}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Take 30 seconds to avoid mistakes
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              aria-label="Close checklist"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Checklist */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={checks.numbers}
                onChange={() => handleCheckChange('numbers')}
                className="w-5 h-5 mt-0.5 accent-primary-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Numbers double-checked?</div>
                <div className="text-sm text-neutral-600">Dates, amounts, percentages, calculations</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={checks.formatting}
                onChange={() => handleCheckChange('formatting')}
                className="w-5 h-5 mt-0.5 accent-primary-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Formatting consistent?</div>
                <div className="text-sm text-neutral-600">Headers, bullets, spacing, alignment</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={checks.logic}
                onChange={() => handleCheckChange('logic')}
                className="w-5 h-5 mt-0.5 accent-primary-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Logic sound?</div>
                <div className="text-sm text-neutral-600">Edge cases, assumptions, gaps considered</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={checks.ready}
                onChange={() => handleCheckChange('ready')}
                className="w-5 h-5 mt-0.5 accent-primary-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Ready to ship without revision?</div>
                <div className="text-sm text-neutral-600">No obvious typos or missing pieces</div>
              </div>
            </label>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleComplete}
              disabled={!allChecked || loading}
              className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                allChecked
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Completing...' : allChecked ? 'Ship It! ✓' : 'Complete All Checks First'}
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full py-3 text-neutral-600 hover:text-neutral-900 font-medium text-sm transition-colors"
            >
              Skip QC (high confidence)
            </button>
          </div>

          <p className="mt-4 text-xs text-center text-neutral-500">
            Skipping frequently? We'll suggest improvements in your weekly summary.
          </p>
        </div>
      </div>
    </div>
  )
}
