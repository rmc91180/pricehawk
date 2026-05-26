'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦅</span>
          <span className="text-lg font-bold text-gray-900">PriceHawk</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-500 text-sm mt-1">Track Amazon prices and get Telegram alerts</p>
          </div>
          <button
            onClick={() => router.push('/add')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            + Add Product
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Add your first Amazon product to start tracking its price and receive Telegram alerts when it drops.
          </p>
          <button
            onClick={() => router.push('/add')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Add your first product
          </button>
        </div>

        {/* Telegram Warning */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">📱</span>
          <div>
            <p className="text-sm font-medium text-blue-900">Connect Telegram to receive alerts</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Go to <button onClick={() => router.push('/settings')} className="underline font-medium">Settings</button> to connect your Telegram account so you can receive price drop notifications.
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}