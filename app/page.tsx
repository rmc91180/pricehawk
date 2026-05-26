import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦅</span>
          <span className="text-xl font-bold text-gray-900">PriceHawk</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span>🔔</span>
          <span>Never overpay on Amazon again</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get alerted when Amazon prices drop
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Add any Amazon product to your watchlist, set your target price or discount, and receive an instant Telegram notification the moment the price drops.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
            Start Watching for Free
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-900 font-medium px-8 py-4 transition-colors">
            How it works →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            How PriceHawk works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Paste an Amazon link</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Find any product on Amazon and copy the URL. Paste it into PriceHawk to add it to your personal watchlist.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Set your target</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choose a target price in dollars or a percentage discount. PriceHawk checks prices every few hours automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Get a Telegram alert</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The moment a price hits your target, you receive a Telegram message with a direct link to buy the product instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Everything you need to shop smarter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '💰', title: 'Dollar or percent targets', desc: 'Set a fixed price target like $49.99 or a percentage drop like 20% off — whichever makes more sense for you.' },
              { icon: '⚡', title: 'Instant Telegram alerts', desc: 'No email delays. Get a Telegram notification the moment your product hits your price target.' },
              { icon: '📋', title: 'Personal watchlist', desc: 'Manage all your tracked products in one place. See current prices, your targets, and alert history at a glance.' },
              { icon: '🛒', title: 'One-click purchase links', desc: 'Every alert includes a direct link straight to the Amazon product page so you can buy immediately.' },
              { icon: '🔄', title: 'Continuous monitoring', desc: 'PriceHawk checks prices automatically every few hours — no need to keep checking yourself.' },
              { icon: '🆓', title: 'Completely free', desc: 'PriceHawk is free to use. No subscriptions, no hidden fees, no credit card required.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                <div className="text-2xl">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500 py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start saving?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join PriceHawk for free and never miss an Amazon price drop again.
          </p>
          <Link href="/signup" className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-8 py-4 rounded-xl text-lg transition-colors inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🦅</span>
            <span className="font-semibold text-gray-900">PriceHawk</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-gray-600">About</Link>
            <Link href="/login" className="hover:text-gray-600">Log in</Link>
            <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 PriceHawk. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  )
}