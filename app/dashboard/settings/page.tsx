'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useCalmMode } from '@/store/calmModeStore'

const NOTIFICATION_PREF_KEY = 'kickstart_notification_pref'

export default function SettingsPage() {
  const { user } = useAuth()
  const { isCalm, toggleCalm } = useCalmMode()
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'denied' | 'granted'>('default')
  const [notificationPrefEnabled, setNotificationPrefEnabled] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    const savedPref = window.localStorage.getItem(NOTIFICATION_PREF_KEY)
    setNotificationPrefEnabled(savedPref === 'enabled')
  }, [])

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setMessage('Notifications are not supported in this browser.')
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      window.localStorage.setItem(NOTIFICATION_PREF_KEY, 'enabled')
      setNotificationPrefEnabled(true)
      setMessage('Notifications enabled.')
    } else {
      setMessage('Notification permission was not granted.')
    }
  }

  const toggleNotificationPref = () => {
    const nextValue = !notificationPrefEnabled
    setNotificationPrefEnabled(nextValue)
    window.localStorage.setItem(NOTIFICATION_PREF_KEY, nextValue ? 'enabled' : 'disabled')
    setMessage(nextValue ? 'Notification reminders enabled.' : 'Notification reminders disabled.')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-2">Settings</h1>
      <p className="text-neutral-600 mb-8">Customize your focus environment.</p>

      {message && (
        <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {message}
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <h2 className="text-lg font-display font-bold text-neutral-900 mb-2">Calm Mode</h2>
          <p className="text-sm text-neutral-600 mb-4">Reduce visual intensity for a quieter workspace.</p>
          <button
            onClick={toggleCalm}
            className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
          >
            {isCalm ? 'Disable Calm Mode' : 'Enable Calm Mode'}
          </button>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <h2 className="text-lg font-display font-bold text-neutral-900 mb-2">Notifications</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Status: <span className="font-semibold">{notificationPermission}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={requestNotifications}
              disabled={notificationPermission === 'granted'}
              className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Permission
            </button>
            <button
              onClick={toggleNotificationPref}
              disabled={notificationPermission !== 'granted'}
              className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {notificationPrefEnabled ? 'Disable Reminders' : 'Enable Reminders'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
          <h2 className="text-lg font-display font-bold text-neutral-900 mb-2">Account</h2>
          <p className="text-sm text-neutral-600">
            Signed in as <span className="font-medium text-neutral-900">{user?.email}</span>
          </p>
          <div className="mt-3">
            <Link href="/support" className="text-sm text-primary-600 hover:text-primary-700">
              Need help? Open Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
