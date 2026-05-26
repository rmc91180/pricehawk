import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // Store it in user_profiles with expiry
  const { error } = await supabase
    .from('user_profiles')
    .update({
      telegram_verify_code: code,
      telegram_code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ code })
}