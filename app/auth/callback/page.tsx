'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmailOtpType } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const OTP_TYPES: EmailOtpType[] = ['signup', 'recovery', 'email', 'email_change']

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your link...')

  const nextPath = useMemo(() => searchParams.get('next') || '/dashboard', [searchParams])

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const typeParam = searchParams.get('type')
      const safeType = OTP_TYPES.includes(typeParam as EmailOtpType)
        ? (typeParam as EmailOtpType)
        : null

      try {
        if (tokenHash && safeType) {
          const { error } = await supabase.auth.verifyOtp({
            type: safeType,
            token_hash: tokenHash,
          })
          if (error) throw error

          if (!isMounted) return
          if (safeType === 'recovery') {
            router.replace(nextPath)
          } else {
            router.replace('/dashboard')
          }
          return
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error

          if (!isMounted) return
          router.replace('/dashboard')
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return
        if (session) {
          router.replace('/dashboard')
          return
        }

        throw new Error('Invalid or expired auth link.')
      } catch (error) {
        if (!isMounted) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Could not verify your link.')
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [router, searchParams, nextPath])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">One moment</h1>
          <p className="text-neutral-600">{message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          ⚠️
        </div>
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">Verification failed</h1>
        <p className="text-neutral-600 mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-flex px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">One moment</h1>
            <p className="text-neutral-600">Verifying your link...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
