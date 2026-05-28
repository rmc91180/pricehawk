'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Product = {
  asin: string
  title: string
  image: string
  price: number
  referral_url: string
}

export default function AddProductPage() {
  const [url, setUrl] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [targetType, setTargetType] = useState<'percent' | 'fixed'>('percent')
  const [targetValue, setTargetValue] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const lookupProduct = async () => {
    setError('')
    setProduct(null)
    setLookupLoading(true)

    try {
      const res = await fetch('/api/product/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const text = await res.text()

      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError('Server returned an unexpected response. Please try again.')
        setLookupLoading(false)
        return
      }

      setLookupLoading(false)

      if (!res.ok) {
        setError(data.error || 'Failed to look up product.')
        return
      }

      setProduct(data)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLookupLoading(false)
    }
  }

  const saveWatch = async () => {
    if (!product || !targetValue) return
    setSaveLoading(true)
    setError('')

    try {
      const res = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin: product.asin,
          product_title: product.title,
          product_image_url: product.image,
          original_price: product.price,
          target_type: targetType,
          target_value: parseFloat(targetValue),
          referral_url: product.referral_url,
        }),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError('Server returned an unexpected response. Please try again.')
        setSaveLoading(false)
        return
      }

      setSaveLoading(false)

      if (!res.ok) {
        setError(data.error || 'Failed to save watch.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSaveLoading(false)
    }
  }

  const targetPrice = product && targetValue
    ? targetType === 'percent'
      ? (product.price * (1 - parseFloat(targetValue) / 100)).toFixed(2)
      : parseFloat(targetValue).toFixed(2)
    : null

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Watch added!</h2>
          <p className="text-gray-500">Taking you back to your dashboard...</p>
        </div>
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
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">

        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a Product</h1>
        <p className="text-gray-500 text-sm mb-8">
          Paste an Amazon product URL and set your target price to start tracking.
        </p>

        {/* Step 1 - URL Input */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Step 1 — Paste Amazon URL
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Find a product on Amazon, copy the URL from your browser, and paste it below.
          </p>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setProduct(null)
                setError('')
              }}
              placeholder="https://www.amazon.com/dp/..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
            />
            <button
              onClick={lookupProduct}
              disabled={!url || lookupLoading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              {lookupLoading ? 'Looking up...' : 'Look up'}
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Step 2 - Product Preview */}
        {product && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Step 2 — Confirm Product
            </h2>
            <div className="flex gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-100 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">
                  {product.title}
                </p>
                <p className="text-xs text-gray-400 mb-1">ASIN: {product.asin}</p>
                <p className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Current price</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Set Target */}
        {product && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Step 3 — Set Your Target
            </h2>

            {/* Target Type Toggle */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setTargetType('percent'); setTargetValue('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  targetType === 'percent'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                % Discount
              </button>
              <button
                onClick={() => { setTargetType('fixed'); setTargetValue('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  targetType === 'fixed'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                $ Target Price
              </button>
            </div>

            {/* Target Input */}
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                {targetType === 'percent' ? '%' : '$'}
              </div>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={targetType === 'percent' ? 'e.g. 20' : 'e.g. 49.99'}
                min="0"
                max={targetType === 'percent' ? '99' : undefined}
                step={targetType === 'percent' ? '1' : '0.01'}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Target Preview */}
            {targetPrice && (
              <div className="bg-orange-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-orange-800">
                  {targetType === 'percent' ? (
                    <>Alert me when price drops <strong>{targetValue}%</strong> to <strong>${targetPrice}</strong> or below</>
                  ) : (
                    <>Alert me when price drops to <strong>${targetPrice}</strong> or below</>
                  )}
                </p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveWatch}
              disabled={!targetValue || saveLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {saveLoading ? 'Saving...' : '🎯 Start Watching This Product'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}