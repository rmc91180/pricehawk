'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [codeLoading, setCodeLoading] = useState(false)
  const [message, setMessage] = useState('')
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

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setLoading(false)
    }
    load()
  }, [])

  const generateCode = async () => {
    setCodeLoading(true)
    setMessage('')
    const res = await fetch('/api/telegram/generate-code', {
      method: 'POST',
    })
    const data = await res.json()
    if (data.code) {
      setVerifyCode(data.code)
    } else {
      setMessage('Failed to generate code. Please try again.')
    }
    setCodeLoading(false)
  }

  const refreshProfile = async () => {
    if (!user) return
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profile)
    if (profile?.telegram_verified) {
      setMessage('✅ Telegram connected successfully!')
      setVerifyCode('')
    }
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

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
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

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your account and notifications</p>

        {/* Account Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-gray-900">
              {new Date(user?.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Telegram Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">Telegram Alerts</h2>
            {profile?.telegram_verified && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Connected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Connect your Telegram account to receive price drop alerts instantly.
          </p>

          {profile?.telegram_verified ? (
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-medium text-green-900">Telegram is connected</p>
                <p className="text-sm text-green-600">
                  You will receive alerts via Telegram when your products hit their target price.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {!verifyCode ? (
                <div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800 font-medium mb-2">How to connect:</p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click "Generate Code" below</li>
                      <li>Open Telegram and search for <strong>@PriceHawkAlertBot</strong></li>
                      <li>Send the code to the bot</li>
                      <li>Come back here and click "I sent the code"</li>
                    </ol>
                  </div>
                  <button
                    onClick={generateCode}
                    disabled={codeLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                  >
                    {codeLoading ? 'Generating...' : 'Generate Code'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Send this code to <strong>@PriceHawkAlertBot</strong> on Telegram:</p>
                    <div className="text-4xl font-bold text-gray-900 tracking-widest my-4">
                      {verifyCode}
                    </div>
                    <p className="text-xs text-gray-400">This code expires in 10 minutes</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={refreshProfile}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      I sent the code ✓
                    </button>
                    <button
                      onClick={() => setVerifyCode('')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {message && (
            <div className={`mt-4 text-sm px-4 py-3 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to dashboard
        </button>
      </div>
    </main>
  )
}