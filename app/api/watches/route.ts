import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    asin,
    product_title,
    product_image_url,
    original_price,
    target_type,
    target_value,
    referral_url,
    ships_to_israel,
  } = body

  // Calculate the target price for easy comparison later
  let target_price: number
  if (target_type === 'percent') {
    target_price = parseFloat((original_price * (1 - target_value / 100)).toFixed(2))
  } else {
    target_price = parseFloat(target_value)
  }

  const { data, error } = await supabase
    .from('watches')
    .insert({
      user_id: user.id,
      asin,
      product_title,
      product_image_url,
      original_price,
      current_price: original_price,
      target_type,
      target_value,
      target_price,
      referral_url,
      ships_to_israel: ships_to_israel ?? false,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ watch: data })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('watches')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ watches: data })
}