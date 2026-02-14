'use client'

import { useAuth, AuthProvider } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCalmMode } from '@/store/calmModeStore'
import { supabase } from '@/lib/supabase'
import { Json } from '@/types/supabase'

type UserTemplatePrefs = {
  bodyDoublingEnabled?: boolean
}

const parseTemplatePrefs = (value: Json | null): UserTemplatePrefs => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as UserTemplatePrefs
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const {
    isCalm,
    toggleCalm,
    bodyDoublingEnabled,
    setBodyDoublingEnabled,
  } = useCalmMode()
  const [bodyDoubleVideoError, setBodyDoubleVideoError] = useState(false)
  const [savingBodyDoublePref, setSavingBodyDoublePref] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Apply calm mode on mount
  useEffect(() => {
    if (isCalm) {
      document.documentElement.classList.add('calm-mode')
    }
  }, [isCalm])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const loadPreference = async () => {
      const { data } = await supabase
        .from('users')
        .select('task_templates')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return
      const prefs = parseTemplatePrefs(data?.task_templates ?? null)
      setBodyDoublingEnabled(Boolean(prefs.bodyDoublingEnabled))
    }

    void loadPreference()

    return () => {
      cancelled = true
    }
  }, [user, setBodyDoublingEnabled])

  const bodyDoubleLabel = useMemo(
    () => (bodyDoublingEnabled ? 'Disable body double' : 'Enable body double'),
    [bodyDoublingEnabled]
  )

  const handleToggleBodyDouble = async () => {
    if (!user || savingBodyDoublePref) return
    const nextValue = !bodyDoublingEnabled
    setBodyDoublingEnabled(nextValue)
    setSavingBodyDoublePref(true)

    try {
      const { data: currentProfile } = await supabase
        .from('users')
        .select('task_templates')
        .eq('id', user.id)
        .single()

      const currentPrefs = parseTemplatePrefs(currentProfile?.task_templates ?? null)
      const nextPrefs: Json = {
        ...currentPrefs,
        bodyDoublingEnabled: nextValue,
      }

      const { error } = await supabase
        .from('users')
        .update({ task_templates: nextPrefs })
        .eq('id', user.id)

      if (error) throw error
    } catch {
      setBodyDoublingEnabled(!nextValue)
    } finally {
      setSavingBodyDoublePref(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-neutral-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-lg font-display font-bold text-neutral-900">Kickstart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/support"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Support
            </Link>
            <button
              onClick={toggleCalm}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              title={isCalm ? "Exit Calm Mode" : "Enter Calm Mode"}
              aria-pressed={isCalm}
              aria-label={isCalm ? "Exit calm mode" : "Enter calm mode"}
            >
              {isCalm ? (
                <span className="text-xl">☀️</span>
              ) : (
                <span className="text-xl">🌙</span>
              )}
            </button>
            {isCalm && (
              <button
                onClick={handleToggleBodyDouble}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                title={bodyDoubleLabel}
                aria-pressed={bodyDoublingEnabled}
                aria-label={bodyDoubleLabel}
                disabled={savingBodyDoublePref}
              >
                <span className="text-xl">{bodyDoublingEnabled ? '👥' : '🧑‍💻'}</span>
              </button>
            )}
            <span className="text-sm text-neutral-600 hidden sm:block">{user.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {isCalm && bodyDoublingEnabled && (
        <aside
          className="fixed bottom-4 right-4 z-40 w-44 rounded-xl border border-neutral-200 bg-white shadow-xl"
          aria-label="Body doubling companion"
        >
          {bodyDoubleVideoError ? (
            <div className="aspect-video p-3 text-xs text-neutral-600">
              Body doubling on.
              <br />
              Add `/public/media/body-doubling-placeholder.mp4` for loop video.
            </div>
          ) : (
            <video
              className="aspect-video w-full rounded-t-xl bg-neutral-900"
              autoPlay
              loop
              muted
              controls
              playsInline
              preload="none"
              onError={() => setBodyDoubleVideoError(true)}
              aria-label="Body doubling focus video"
            >
              <source src="/media/body-doubling-placeholder.mp4" type="video/mp4" />
            </video>
          )}
          <div className="rounded-b-xl border-t border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700">
            Body Double: Active
          </div>
        </aside>
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
