'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  title: string
  description: string
  icon: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Kickstart',
    description: 'One task at a time. No overwhelm. Let\'s get you started.',
    icon: '👋',
  },
  {
    title: 'Add Your First Task',
    description: 'Click "Add Task" to create your first task. Use templates or AI breakdown to get started quickly.',
    icon: '✍️',
  },
  {
    title: 'Focus Sprint Timer',
    description: 'Start a Pomodoro timer to work in focused 25-minute sprints. Breaks are built in.',
    icon: '🍅',
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('kickstart-onboarding-complete')
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('kickstart-onboarding-complete', 'true')
    setIsOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem('kickstart-onboarding-complete', 'true')
    setIsOpen(false)
  }

  const step = steps[currentStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-description"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl" aria-hidden="true">{step.icon}</div>
                  <button
                    onClick={handleSkip}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Skip tutorial"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <h2 id="onboarding-title" className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                    {step.title}
                  </h2>
                  <p id="onboarding-description" className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2" role="group" aria-label="Progress indicator">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-8 bg-primary-500'
                          : index < currentStep
                          ? 'w-1.5 bg-primary-300 dark:bg-primary-700'
                          : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
                      }`}
                      aria-label={`Step ${index + 1}${index === currentStep ? ' (current)' : index < currentStep ? ' (completed)' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous step"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite" aria-atomic="true">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label={currentStep === steps.length - 1 ? 'Complete tutorial' : 'Next step'}
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}