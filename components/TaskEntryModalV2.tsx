'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useTaskStore } from '@/store/taskStore'
import { Tables } from '@/lib/supabase'
import { TASK_TEMPLATES, TaskTemplate } from '@/lib/taskTemplates'
import { useModalA11y } from '@/lib/useModalA11y'

type Task = Tables<'tasks'>

interface TaskEntryModalProps {
  isOpen: boolean
  onClose: () => void
  editingTask?: Task | null
}

export default function TaskEntryModal({ isOpen, onClose, editingTask }: TaskEntryModalProps) {
  const { user } = useAuth()
  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  
  const [step, setStep] = useState<'choice' | 'template' | 'ai' | 'manual'>('choice')
  const [title, setTitle] = useState('')
  const [doneCriteria, setDoneCriteria] = useState('')
  const [deadline, setDeadline] = useState('')
  const [timeBlockMins, setTimeBlockMins] = useState(30)
  const [firstAction, setFirstAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [aiContext, setAiContext] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useModalA11y(isOpen, onClose, dialogRef, closeButtonRef)

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setStep('manual')
      setTitle(editingTask.title)
      setDoneCriteria(editingTask.done_criteria)
      setTimeBlockMins(editingTask.time_block_mins)
      setFirstAction(editingTask.micro_actions?.[0] || '')
      const date = new Date(editingTask.deadline)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setDeadline(`${year}-${month}-${day}T${hours}:${minutes}`)
    } else {
      setStep('choice')
      setTitle('')
      setDoneCriteria('')
      setDeadline('')
      setTimeBlockMins(30)
      setFirstAction('')
      setSelectedTemplate(null)
      setAiContext('')
    }
    setError('')
  }, [editingTask, isOpen])

  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      setError('Enter a task title first')
      return
    }

    setAiLoading(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Please sign in again to use AI breakdown.')
      }

      const response = await fetch('/api/ai-breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          taskTitle: title,
          context: aiContext || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'AI breakdown failed')
      }

      const breakdown = await response.json()
      const parsedEstimate = Number(breakdown.timeEstimate)
      const safeEstimate =
        Number.isFinite(parsedEstimate) && parsedEstimate > 0
          ? Math.min(Math.round(parsedEstimate), 240)
          : 30
      
      setFirstAction(breakdown.firstAction || '')
      setDoneCriteria(breakdown.doneCriteria || '')
      setTimeBlockMins(safeEstimate)
      
      setStep('manual') // Move to manual editing
    } catch (err: any) {
      setError(err.message || 'AI breakdown failed. Try manual entry.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setTitle(template.title)
    setDoneCriteria(template.doneCriteria)
    setTimeBlockMins(template.timeEstimate)
    setFirstAction(template.firstAction)
    setStep('manual')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmedTitle = title.trim()
    const trimmedCriteria = doneCriteria.trim()
    const trimmedAction = firstAction.trim()
    
    if (!trimmedTitle || !trimmedCriteria) {
      setError('Title and done criteria are required')
      return
    }

    const deadlineDate = new Date(deadline)
    if (!deadline || Number.isNaN(deadlineDate.getTime())) {
      setError('Please choose a valid deadline')
      return
    }

    if (deadlineDate < new Date() && !editingTask) {
      setError('Deadline must be in the future')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (editingTask) {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: trimmedTitle,
            done_criteria: trimmedCriteria,
            time_block_mins: timeBlockMins,
            deadline: deadlineDate.toISOString(),
            micro_actions: trimmedAction ? [trimmedAction] : null,
          })
          .eq('id', editingTask.id)
          .select()
          .single()

        if (error) throw error

        updateTask(editingTask.id, {
          title: trimmedTitle,
          done_criteria: trimmedCriteria,
          time_block_mins: timeBlockMins,
          deadline: deadlineDate.toISOString(),
          micro_actions: trimmedAction ? [trimmedAction] : null,
        })
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: trimmedTitle,
            done_criteria: trimmedCriteria,
            time_block_mins: timeBlockMins,
            deadline: deadlineDate.toISOString(),
            status: 'queued',
            micro_actions: trimmedAction ? [trimmedAction] : null,
          })
          .select()
          .single()

        if (error) throw error

        addTask(data)
      }
      
      // Reset
      setTitle('')
      setDoneCriteria('')
      setDeadline('')
      setTimeBlockMins(30)
      setFirstAction('')
      setStep('choice')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
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
        aria-labelledby="task-entry-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="task-entry-title" className="text-2xl font-display font-bold text-neutral-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              {!editingTask && step === 'choice' && (
                <p className="text-sm text-neutral-600 mt-1">
                  Choose how you want to create this task
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close task entry modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Choice (only for new tasks) */}
          {!editingTask && step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('template')}
                className="w-full p-6 bg-primary-50 hover:bg-primary-100 border-2 border-primary-300 rounded-xl transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📋</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                      Use a Template
                    </h3>
                    <p className="text-sm text-neutral-700">
                      Pre-filled common tasks. Fast and predictable.
                    </p>
                    <div className="mt-2 text-xs text-primary-700 font-medium">
                      → Email, Reports, Reviews, Planning, and more
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('ai')}
                className="w-full p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 rounded-xl transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                      AI Breakdown
                    </h3>
                    <p className="text-sm text-neutral-700">
                      Let AI break down your task into concrete first steps.
                    </p>
                    <div className="mt-2 text-xs text-purple-700 font-medium">
                      → Best for complex or vague tasks
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('manual')}
                className="w-full p-6 bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-300 rounded-xl transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✍️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                      Manual Entry
                    </h3>
                    <p className="text-sm text-neutral-700">
                      You know exactly what you need. Fill it in yourself.
                    </p>
                    <div className="mt-2 text-xs text-neutral-600 font-medium">
                      → Full control over every detail
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {step === 'template' && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="mb-4 text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                ← Back
              </button>
              
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {TASK_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-4 bg-neutral-50 hover:bg-primary-50 border-2 border-neutral-200 hover:border-primary-300 rounded-xl transition-all text-left"
                  >
                    <div className="text-2xl mb-2">{template.emoji}</div>
                    <div className="font-semibold text-neutral-900 text-sm mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {template.timeEstimate}min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: AI Breakdown */}
          {step === 'ai' && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="mb-4 text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    What do you need to do? <span className="text-primary-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Write Q4 strategy report"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Any extra context? (Optional)
                  </label>
                  <textarea
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="e.g., Needs 4 sections, manager wants data charts, due Friday"
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleAIBreakdown}
                  disabled={aiLoading || !title.trim()}
                  className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AI is thinking...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Break Down This Task</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-neutral-500">
                  AI will suggest a concrete first step, time estimate, and completion criteria
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Manual Form (also used after AI/template) */}
          {step === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {selectedTemplate && (
                <div className="p-3 bg-primary-50 border-l-4 border-primary-500 rounded-lg">
                  <p className="text-sm text-primary-700">
                    <span className="font-semibold">Template:</span> {selectedTemplate.name}. Edit below if needed.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Task Title <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Write Q4 report"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  First 30-Second Action (Helps you start)
                </label>
                <input
                  type="text"
                  value={firstAction}
                  onChange={(e) => setFirstAction(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-50 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Open Google Docs and type 'Q4 Report' as title"
                />
                <p className="mt-1 text-xs text-neutral-600">
                  One simple action to break paralysis. No thinking required.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  How will you know it's done? <span className="text-primary-500">*</span>
                </label>
                <textarea
                  value={doneCriteria}
                  onChange={(e) => setDoneCriteria(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="e.g., All 4 sections complete, reviewed by manager, exported to PDF"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Time Estimate (minutes)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeBlockMins(mins)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        timeBlockMins === mins
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Deadline <span className="text-primary-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (editingTask) {
                      onClose()
                    } else {
                      setStep('choice')
                    }
                  }}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors"
                >
                  {editingTask ? 'Cancel' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !doneCriteria.trim() || !deadline}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editingTask ? 'Saving...' : 'Adding...') : (editingTask ? 'Save Changes' : 'Add to Queue')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
