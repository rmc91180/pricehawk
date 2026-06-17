'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Watch = {
  id: string
  asin: string
  product_title: string
  product_image_url: string
  original_price: number
  current_price: number
  target_type: 'percent' | 'fixed'
  target_value: number
  target_price: number
  referral_url: string
  ships_to_israel: boolean
  is_active: boolean
  created_at: string
}

function TelegramWarning({ userId, onSettingsClick }: { userId: string, onSettingsClick: () => void }) {
  const [verified, setVerified] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('telegram_verified')
        .eq('id', userId)
        .single()
      if (data) setVerified(data.telegram_verified)
    }
    check()
  }, [userId])

  if (verified) return null

  return (
    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
      <span className="text-xl">📱</span>
      <div>
        <p className="text-sm font-medium text-blue-900">Connect Telegram to receive alerts</p>
        <p className="text-sm text-blue-600 mt-0.5">
          Go to <button onClick={onSettingsClick} className="underline font-medium">Settings</button> to connect your Telegram account.
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadWatches()
      setLoading(false)
    }
    load()
  }, [])

  const loadWatches = async () => {
    const res = await fetch('/api/watches')
    const data = await res.json()
    if (data.watches) setWatches(data.watches)
  }

  const deleteWatch = async (id: string) => {
    setDeletingId(id)
    await supabase.from('watches').update({ is_active: false }).eq('id', id)
    setWatches(watches.filter(w => w.id !== id))
    setDeletingId(null)
  }

  const targetLabel = (watch: Watch) => {
    if (watch.target_type === 'percent') {
      return `${watch.target_value}% off target: $${watch.target_price.toFixed(2)}`
    }
    return `Target: $${watch.target_price.toFixed(2)}`
  }

  const priceStatus = (watch: Watch) => {
    const pct = ((watch.original_price - watch.current_price) / watch.original_price) * 100
    if (watch.current_price <= watch.target_price) {
      return { label: 'Target hit!', color: 'text-green-600 bg-green-50' }
    }
    if (pct >= 5) {
      return { label: `${pct.toFixed(0)}% drop`, color: 'text-blue-600 bg-blue-50' }
    }
    return { label: 'Watching', color: 'text-gray-500 bg-gray-50' }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦅</span>
          <span className="text-lg font-bold text-gray-900">PriceHawk</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/settings')} className="text-sm text-gray-500 hover:text-gray-900">Settings</button>
          <span className="text-sm text-gray-300">|</span>
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-500 text-sm mt-1">
              {watches.length === 0 ? 'No products yet' : `Tracking ${watches.length} product${watches.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => router.push('/add')} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
            + Add Product
          </button>
        </div>

        {user && <TelegramWarning userId={user.id} onSettingsClick={() => router.push('/settings')} />}

        {watches.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Add your first Amazon product to start tracking its price and receive Telegram alerts when it drops.
            </p>
            <button onClick={() => router.push('/add')} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
              Add your first product
            </button>
          </div>
        )}

        {watches.length > 0 && (
          <div className="space-y-4">
            {watches.map((watch) => {
              const status = priceStatus(watch)
              return (
                <div key={watch.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex gap-4">
                    {watch.product_image_url && (
                      <img src={watch.product_image_url} alt={watch.product_title} className="w-20 h-20 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{watch.product_title}</p>
                          {watch.ships_to_israel && (
                            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">🌍 IL Shipping</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 mb-3">ASIN: {watch.asin}</p>
                      <div className="flex items-center gap-6 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Current price</p>
                          <p className="text-lg font-bold text-gray-900">${watch.current_price.toFixed(2)}</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div>
                          <p className="text-xs text-gray-400">Your target</p>
                          <p className="text-sm font-semibold text-orange-500">{targetLabel(watch)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={watch.referral_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 font-medium">View on Amazon</a>
                        <span className="text-gray-200">|</span>
                        <button onClick={() => deleteWatch(watch.id)} disabled={deletingId === watch.id} className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50">
                          {deletingId === watch.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
