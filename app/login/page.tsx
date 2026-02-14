'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth, AuthProvider } from '@/contexts/AuthContext'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const nextPath =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null
    const safeRedirect =
      nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
        ? nextPath
        : '/dashboard'
    const { error } = await signIn(email, password, safeRedirect)
    
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Email not confirmed. Please verify your email before signing in.')
      } else if (error.message.includes('Invalid')) {
        setError('Invalid email or password. Please try again or sign up for a new account.')
      } else if (error.message.includes('rate limit')) {
        setError('Too many login attempts. Please wait a few minutes and try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
          <span className="text-2xl font-display font-bold text-neutral-900">Kickstart</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Welcome back
          </h1>
          <p className="text-neutral-600 mb-8">
            Sign in to continue focusing on what matters.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-right">
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Need a new confirmation email?{' '}
              <Link href={`/verify-email?email=${encodeURIComponent(email)}`} className="text-primary-600 hover:text-primary-700 font-medium">
                Resend
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
