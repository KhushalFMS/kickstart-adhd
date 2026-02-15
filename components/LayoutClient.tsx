'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-neutral-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4">
              <span className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                Kickstart
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark)
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
  }

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/'

  if (isAuthPage) return null

  return (
    <>
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                Kickstart
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/pomodoro"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/pomodoro'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Pomodoro
              </Link>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </nav>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse" aria-label="Loading">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
      <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
      <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
    </div>
  )
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        {loading ? <LoadingSkeleton /> : children}
      </main>
    </>
  )
}