import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-neutral-50" />
        
        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Header */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <span className="text-xl font-display font-bold text-neutral-900">Kickstart</span>
            </div>
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Sign In
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-7xl font-display font-bold text-neutral-900 mb-6 animate-slide-up">
              Stop <span className="text-primary-500">staring</span> at tasks.<br />
              Start <span className="text-primary-500">doing</span> them.
            </h1>
            <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The only task manager built for ADHD brains. One task at a time. No overwhelming lists. Just simple starts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold rounded-xl shadow-md transition-all"
              >
                See How It Works
              </Link>
            </div>

            <p className="mt-6 text-sm text-neutral-500">
              No credit card required • 7-day free trial
            </p>
          </div>

          {/* Feature Preview */}
          <div className="mt-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto border border-neutral-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">Finish CoinDCX presentation</h3>
                    <p className="text-sm text-neutral-600">Due in 2 hours • 45 min</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
                    Start
                  </button>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg opacity-50">
                  <div className="w-10 h-10 bg-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-neutral-600 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-700">Review team feedback</h3>
                    <p className="text-sm text-neutral-500">Due tomorrow • 20 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg opacity-30">
                  <div className="w-10 h-10 bg-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-neutral-600 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-700">Update project docs</h3>
                    <p className="text-sm text-neutral-500">Due next week • 1 hour</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-neutral-500 italic">
                Focus on ONE task. The rest disappears.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              Traditional task managers make ADHD worse
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Endless lists. Overwhelming choices. Analysis paralysis. Sound familiar?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-neutral-50 rounded-2xl">
              <div className="text-4xl mb-4">😵</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Too Many Choices</h3>
              <p className="text-neutral-600">
                50 tasks staring at you. Which one first? Your brain freezes. Nothing gets done.
              </p>
            </div>

            <div className="p-8 bg-neutral-50 rounded-2xl">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Unclear Starting Points</h3>
              <p className="text-neutral-600">
                "Write report" feels impossible. You need to know the exact first 30-second action.
              </p>
            </div>

            <div className="p-8 bg-neutral-50 rounded-2xl">
              <div className="text-4xl mb-4">🤦</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Ship Broken Work</h3>
              <p className="text-neutral-600">
                Hit send, then spot the typo. Forget to attach files. Miss obvious errors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div id="how-it-works" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              How Kickstart fixes it
            </h2>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  Single Priority Queue
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  See ONE task at a time
                </h3>
                <p className="text-lg text-neutral-600 mb-4">
                  No overwhelming lists. No paralysis. Just the next thing to do.
                </p>
                <p className="text-neutral-600">
                  Your queue decides priority for you. Task #2 only shows after you start #1. Focus is automatic.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-sm text-neutral-500 mb-2">YOUR NEXT TASK</div>
                  <div className="text-2xl font-bold text-neutral-900 mb-4">Review Q4 budget</div>
                  <div className="flex gap-2 text-sm text-neutral-600 mb-6">
                    <span className="bg-neutral-100 px-3 py-1 rounded-full">📅 Due in 3 hours</span>
                    <span className="bg-neutral-100 px-3 py-1 rounded-full">⏱️ 30 minutes</span>
                  </div>
                  <button className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold">
                    Start Task
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  Forced Start Protocol
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Break down the first step
                </h3>
                <p className="text-lg text-neutral-600 mb-4">
                  Task stuck for 24 hours? We force you to define the literal first 30-second action.
                </p>
                <p className="text-neutral-600">
                  "Write report" becomes "Open Google Doc and type title." Concrete. Doable. Started.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-sm font-semibold text-primary-600 mb-4">⚠️ Task Stuck Protocol</div>
                  <div className="text-lg font-medium text-neutral-900 mb-4">What's blocking you?</div>
                  <div className="space-y-2 mb-4">
                    <button className="w-full p-3 bg-neutral-50 hover:bg-primary-50 rounded-lg text-left transition-colors">
                      Unclear what to write
                    </button>
                    <button className="w-full p-3 bg-neutral-50 hover:bg-primary-50 rounded-lg text-left transition-colors">
                      Need more information
                    </button>
                    <button className="w-full p-3 bg-neutral-50 hover:bg-primary-50 rounded-lg text-left transition-colors">
                      Feels too hard
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  Pre-Ship QC
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Catch errors before you ship
                </h3>
                <p className="text-lg text-neutral-600 mb-4">
                  Hit "Done" and a checklist appears. Numbers? Formatting? Logic? Forced pause to review.
                </p>
                <p className="text-neutral-600">
                  Can't ship until you check every box. Catches typos, missing attachments, calculation errors.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-lg font-semibold text-neutral-900 mb-4">✓ Pre-Ship Checklist</div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <input type="checkbox" className="w-5 h-5 accent-primary-500" />
                      <span className="text-neutral-700">Numbers double-checked?</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <input type="checkbox" className="w-5 h-5 accent-primary-500" />
                      <span className="text-neutral-700">Formatting consistent?</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <input type="checkbox" className="w-5 h-5 accent-primary-500" />
                      <span className="text-neutral-700">Ready to ship?</span>
                    </label>
                  </div>
                  <button className="w-full mt-4 py-3 bg-neutral-300 text-neutral-500 rounded-lg font-semibold cursor-not-allowed">
                    Ship (Complete all checks)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              Simple pricing for focused work
            </h2>
            <p className="text-xl text-neutral-600">
              7-day free trial. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-neutral-50 rounded-2xl">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Free</h3>
              <p className="text-neutral-600 mb-6">Try the basics</p>
              <div className="text-4xl font-bold text-neutral-900 mb-6">$0</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-neutral-700">
                  <span className="text-green-500">✓</span>
                  5 tasks per month
                </li>
                <li className="flex items-center gap-2 text-neutral-700">
                  <span className="text-green-500">✓</span>
                  Single priority queue
                </li>
                <li className="flex items-center gap-2 text-neutral-700">
                  <span className="text-green-500">✓</span>
                  Pre-ship checklist
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 bg-neutral-200 text-neutral-900 text-center font-semibold rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Start Free
              </Link>
            </div>

            <div className="p-8 bg-primary-500 text-white rounded-2xl shadow-xl transform scale-105">
              <div className="inline-block px-3 py-1 bg-white text-primary-600 rounded-full text-sm font-semibold mb-4">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-primary-100 mb-6">For serious productivity</p>
              <div className="text-4xl font-bold mb-6">
                $12<span className="text-xl font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  Unlimited tasks
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  Task breakdown protocol
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  Error pattern learning
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  Task templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  Weekly insights
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 bg-white text-primary-600 text-center font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Start 7-Day Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Stop overthinking. Start doing.
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join 1,000+ people with ADHD who finally get things done.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <span className="text-lg font-display font-bold text-neutral-900">Kickstart</span>
            </div>
            <div className="flex gap-6 text-sm text-neutral-600">
              <a href="#" className="hover:text-neutral-900">Privacy</a>
              <a href="#" className="hover:text-neutral-900">Terms</a>
              <a href="#" className="hover:text-neutral-900">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-neutral-500">
            © 2026 Kickstart. Built for ADHD brains.
          </div>
        </div>
      </footer>
    </main>
  )
}
