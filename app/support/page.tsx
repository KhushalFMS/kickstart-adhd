import Link from 'next/link'

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-display font-bold text-neutral-900">Support</h1>
        <p className="mb-8 text-sm text-neutral-600">
          Need help with account access, task flow, or data issues? Start here.
        </p>

        <div className="space-y-6 text-sm leading-6 text-neutral-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">Common Issues</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Can&apos;t sign in: use password reset and verify your email.</li>
              <li>AI breakdown unavailable: check API key and auth session.</li>
              <li>Queue mismatch: refresh and confirm recent task updates saved.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">Contact</h2>
            <p>
              Email support at{' '}
              <a href="mailto:support@kickstartapp.dev" className="text-primary-600 hover:text-primary-700">
                support@kickstartapp.dev
              </a>{' '}
              with your account email and a short issue summary.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">Useful Links</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>
              <Link href="/dashboard/settings" className="text-primary-600 hover:text-primary-700">
                Settings
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
