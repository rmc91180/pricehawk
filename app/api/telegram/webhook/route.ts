import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

async function sendTelegramMessage(chat_id: string, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chat_id = message.chat.id.toString()
  const text = message.text?.trim()

  if (!text) return NextResponse.json({ ok: true })

  // Handle /start command
  if (text === '/start') {
    await sendTelegramMessage(
      chat_id,
      '👋 Welcome to <b>PriceHawk</b>!\n\nTo connect your account, go to your Settings page on PriceHawk, generate a verification code, and send it here.'
    )
    return NextResponse.json({ ok: true })
  }

  // Handle 6-digit verification code
  if (/^\d{6}$/.test(text)) {
    const now = new Date().toISOString()

    // Look up the code
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, telegram_code_expires_at')
      .eq('telegram_verify_code', text)
      .gt('telegram_code_expires_at', now)
      .limit(1)

    if (error || !profiles || profiles.length === 0) {
      await sendTelegramMessage(
        chat_id,
        '❌ Invalid or expired code. Please generate a new code from your PriceHawk Settings page.'
      )
      return NextResponse.json({ ok: true })
    }

    const profile = profiles[0]

    // Save the telegram_chat_id and mark as verified
    await supabase
      .from('user_profiles')
      .update({
        telegram_chat_id: chat_id,
        telegram_verified: true,
        telegram_verify_code: null,
        telegram_code_expires_at: null,
      })
      .eq('id', profile.id)

    await sendTelegramMessage(
      chat_id,
      '✅ <b>Connected!</b>\n\nYour Telegram account is now linked to PriceHawk. You will receive price drop alerts here as soon as a product on your watchlist hits your target price.\n\n🦅 Happy saving!'
    )

    return NextResponse.json({ ok: true })
  }

  // Unknown message
  await sendTelegramMessage(
    chat_id,
    '🤔 I didn\'t understand that. Please send your 6-digit verification code from PriceHawk Settings.'
  )

  return NextResponse.json({ ok: true })
}