import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-display font-bold text-neutral-900">Privacy Policy</h1>
        <p className="mb-8 text-sm text-neutral-600">Last updated: February 14, 2026</p>

        <div className="space-y-6 text-sm leading-6 text-neutral-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">1. Data We Store</h2>
            <p>
              We store your account email and the task data you create, including titles, deadlines,
              completion status, and optional notes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">2. Why We Use It</h2>
            <p>
              Your data is used to run core task features, maintain your queue, and improve reliability
              and quality-related insights.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">3. AI Requests</h2>
            <p>
              If you use AI breakdown, task text you submit is sent to the configured AI provider to
              generate suggestions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">4. Access and Deletion</h2>
            <p>
              You can delete tasks from the app. For account-level data deletion requests, contact support
              using your product support channel.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">5. Security</h2>
            <p>
              We use managed authentication and database protections, but no online system is completely
              risk-free.
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
