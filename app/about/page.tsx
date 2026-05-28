import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦅</span>
          <span className="text-xl font-bold text-gray-900">PriceHawk</span>
        </Link>
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
      <section className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About PriceHawk</h1>
        <p className="text-xl text-gray-500 leading-relaxed mb-6">
          PriceHawk is a free Amazon price tracking tool that sends you instant Telegram alerts when the products you want drop to your target price.
        </p>
        <p className="text-gray-500 leading-relaxed">
          We built PriceHawk because we got tired of checking Amazon every day waiting for prices to drop. Now the app does it for you — automatically, every few hours, while you get on with your life.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our mission</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            Online prices change constantly — sometimes dozens of times a day. The difference between buying at the right moment and the wrong one can be anywhere from a few dollars to hundreds. Most people never capture those savings simply because they don't know when to buy.
          </p>
          <p className="text-gray-500 leading-relaxed mb-4">
            PriceHawk levels the playing field. Whether you're waiting for a TV to drop 15%, a pair of running shoes to hit $99, or a kitchen appliance to go on sale, PriceHawk watches for you and tells you the moment it's time to buy.
          </p>
          <p className="text-gray-500 leading-relaxed">
            No subscriptions. No ads. No spam. Just a simple, honest tool that helps you spend less.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">How PriceHawk works</h2>
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Create a free account',
                desc: 'Sign up with your email address in seconds. No credit card required, no trial period — PriceHawk is completely free to use.'
              },
              {
                step: '02',
                title: 'Connect your Telegram',
                desc: 'Link your Telegram account in Settings. This is how PriceHawk sends you alerts — instantly, directly to your phone, no email delays.'
              },
              {
                step: '03',
                title: 'Add products from Amazon',
                desc: 'Find any product on Amazon, copy the URL, and paste it into PriceHawk. Set your target as a dollar amount or a percentage discount.'
              },
              {
                step: '04',
                title: 'We watch prices for you',
                desc: 'PriceHawk checks prices automatically every few hours. You don\'t need to open the app or do anything — it runs completely in the background.'
              },
              {
                step: '05',
                title: 'Get alerted and buy',
                desc: 'The moment a price hits your target, you receive a Telegram notification with a direct link to buy the product on Amazon. One tap and you\'re done.'
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="text-3xl font-bold text-orange-200 flex-shrink-0 w-12">{item.step}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amazon Disclosure */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Amazon Associates Disclosure</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            PriceHawk participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p className="text-gray-500 leading-relaxed mb-4">
            When you click a product link in a PriceHawk alert and make a purchase on Amazon, we may earn a small commission at no additional cost to you. This helps us keep PriceHawk free for everyone.
          </p>
          <p className="text-gray-500 leading-relaxed">
            Our price tracking and alert system operates independently of this program — we track prices objectively and alert you based solely on your target criteria, not on commission rates or promotional considerations.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">Frequently asked questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'Is PriceHawk really free?',
                a: 'Yes, completely. There are no paid plans, no trials, and no hidden fees. PriceHawk is free to use.'
              },
              {
                q: 'How often does PriceHawk check prices?',
                a: 'PriceHawk checks prices automatically every 6 hours. If a price drops to your target at any point, you\'ll be notified within the next check cycle.'
              },
              {
                q: 'Do I need to keep the app open to receive alerts?',
                a: 'No. Once you\'ve added a product and connected Telegram, everything runs automatically in the background. You\'ll receive a Telegram push notification whenever a price drops to your target.'
              },
              {
                q: 'Can I track any Amazon product?',
                a: 'PriceHawk works with most Amazon.com products. Simply copy the product URL from your browser and paste it into PriceHawk.'
              },
              {
                q: 'How do I set a price target?',
                a: 'When adding a product you can set either a fixed dollar target (e.g. alert me when the price reaches $49.99) or a percentage discount target (e.g. alert me when the price drops 20% or more).'
              },
              {
                q: 'Why do I need to connect Telegram?',
                a: 'Telegram is how PriceHawk sends you alerts. It\'s free, instant, and works on any phone. You\'ll receive a push notification the moment a price drops to your target.'
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500 py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start saving?</h2>
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
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <Link href="/about" className="hover:text-gray-600">About</Link>
            <Link href="/login" className="hover:text-gray-600">Log in</Link>
            <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 PriceHawk. All rights reserved.</p>
        </div>
      </footer>

    </main>
  )
}