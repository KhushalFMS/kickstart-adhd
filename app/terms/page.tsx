import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-display font-bold text-neutral-900">Terms of Service</h1>
        <p className="mb-8 text-sm text-neutral-600">Last updated: February 14, 2026</p>

        <div className="space-y-6 text-sm leading-6 text-neutral-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">1. Use of the App</h2>
            <p>
              Kickstart is provided to help you plan and complete tasks. You are responsible for the
              information you enter and for how you use task recommendations.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">2. Accounts</h2>
            <p>
              You must keep your login credentials secure and notify us if you suspect unauthorized
              access to your account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">3. Acceptable Use</h2>
            <p>
              Do not misuse the service, attempt unauthorized access, or use the app for unlawful
              activities.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">4. Service Availability</h2>
            <p>
              We aim for reliable uptime but cannot guarantee uninterrupted service. Features may change
              as the product improves.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">5. Contact</h2>
            <p>
              For questions about these terms, contact support using your product support channel.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/signup" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            ← Back to sign up
          </Link>
        </div>
      </div>
    </main>
  )
}
