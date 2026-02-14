'use client'

import { useEffect, useRef, useState } from 'react'
import { useModalA11y } from '@/lib/useModalA11y'

interface DistractionCaptureProps {
  isOpen: boolean
  onClose: () => void
}

export default function DistractionCapture({ isOpen, onClose }: DistractionCaptureProps) {
  const [thought, setThought] = useState('')
  const [distractions, setDistractions] = useState<string[]>([])
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useModalA11y(isOpen, onClose, dialogRef, closeButtonRef)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('kickstart_distractions')
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        setDistractions(parsed.filter((item) => typeof item === 'string'))
      }
    } catch {
      // ignore invalid stored data
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('kickstart_distractions', JSON.stringify(distractions.slice(-50)))
  }, [distractions])

  const handleCapture = () => {
    const trimmedThought = thought.trim()
    if (trimmedThought) {
      setDistractions(prev => [...prev, trimmedThought])
      setThought('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCapture()
    }
  }

  const handleDelete = (index: number) => {
    setDistractions(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="distraction-capture-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💭</span>
              <h3 id="distraction-capture-title" className="text-xl font-display font-bold text-neutral-900">
                Distraction Capture
              </h3>
            </div>
            <button
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close distraction capture"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-neutral-600 mb-4">
            Park the thought. Return to focus. Deal with it later.
          </p>

          {/* Quick Capture Input */}
          <div className="mb-4">
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What popped into your head? (Press Enter to capture)"
              rows={2}
              autoFocus
              className="w-full px-4 py-3 bg-neutral-50 border-2 border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-500">
                Enter to capture • Esc to close
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCapture}
                  type="button"
                  disabled={!thought.trim()}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Capture
                </button>
                {distractions.length > 0 && (
                  <button
                    onClick={() => setDistractions([])}
                    type="button"
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Captured Distractions */}
          {distractions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                Parked Thoughts ({distractions.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {distractions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg group"
                  >
                    <span className="text-neutral-400 text-sm mt-0.5">{index + 1}.</span>
                    <span className="flex-1 text-sm text-neutral-700">{item}</span>
                    <button
                      onClick={() => handleDelete(index)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-all"
                      aria-label={`Delete parked thought ${index + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-neutral-500 italic">
                Review these after your focus session ends
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={onClose}
              className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors"
            >
              Back to Focus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
