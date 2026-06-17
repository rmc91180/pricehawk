import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'pricehawk0b-20'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
]

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

async function scrapePrice(asin) {
  const targetUrl = `https://www.amazon.com/dp/${asin}`
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  })
  if (!res.ok) throw new Error(`Amazon error: ${res.status}`)
  const html = await res.text()
  if (
    html.includes('api-services-support@amazon.com') ||
    html.includes('Type the characters you see in this image')
  ) {
    throw new Error('Amazon is showing a CAPTCHA. Please try again in a few minutes.')
  }
  const pricePatterns = [
    /class="a-price-whole">([0-9,]+)</i,
    /"priceAmount":([0-9.]+)/i,
    /id="priceblock_ourprice"[^>]*>\s*\$([0-9,.]+)/i,
    /class="a-offscreen">\$([0-9,.]+)</i,
    /"buyingPrice":([0-9.]+)/i,
  ]
  for (const pattern of pricePatterns) {
    const match = html.match(pattern)
    if (match) {
      const cleaned = match[1].replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) return parsed
    }
  }
  return null
}

async function checkPrices() {
  console.log('Starting price check:', new Date().toISOString())

  const { data: watches, error: watchError } = await supabase
    .from('watches')
    .select('*')
    .eq('is_active', true)

  if (watchError) {
    console.error('Failed to fetch watches:', watchError.message)
    process.exit(1)
  }

  if (!watches || watches.length === 0) {
    console.log('No active watches found')
    process.exit(0)
  }

  const userIds = [...new Set(watches.map(w => w.user_id))]

  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, telegram_chat_id, telegram_verified')
    .in('id', userIds)
    .eq('telegram_verified', true)

  if (profileError) {
    console.error('Failed to fetch profiles:', profileError.message)
    process.exit(1)
  }

  const chatIdMap = {}
  for (const profile of profiles) {
    chatIdMap[profile.id] = profile.telegram_chat_id
  }

  const activeWatches = watches.filter(w => chatIdMap[w.user_id])
  console.log(`Checking ${activeWatches.length} watches with Telegram connected`)

  for (const watch of activeWatches) {
    try {
      console.log(`Checking ASIN ${watch.asin} - ${watch.product_title}`)
      const currentPrice = await scrapePrice(watch.asin)

      if (!currentPrice) {
        console.log(`Could not get price for ${watch.asin} - skipping`)
        continue
      }

      console.log(`Current: $${currentPrice} | Target: $${watch.target_price}`)

      await supabase.from('watches').update({
        current_price: currentPrice,
        last_checked_at: new Date().toISOString(),
      }).eq('id', watch.id)

      if (currentPrice <= watch.target_price) {
        const chatId = chatIdMap[watch.user_id]
        const savings = (watch.original_price - currentPrice).toFixed(2)
        const savingsPct = (((watch.original_price - currentPrice) / watch.original_price) * 100).toFixed(0)
        const referralUrl = `https://www.amazon.com/dp/${watch.asin}?tag=${ASSOCIATE_TAG}`
        const message = [
          '🔔 <b>Price Alert - PriceHawk</b>',
          '',
          `📦 ${watch.product_title}`,
          ...(watch.ships_to_israel ? ['🌍 Ships free to Israel: ✅ confirmed by user'] : []),
          '',
          `💰 Now: <b>$${currentPrice.toFixed(2)}</b>`,
          `📉 Was: $${watch.original_price.toFixed(2)}`,
          `✅ You save: $${savings} (${savingsPct}% off)`,
          '',
          `🛒 <a href="${referralUrl}">Buy now on Amazon</a>`,
          '',
          `<i>Alert sent by PriceHawk</i>`,
        ].join('\n')
        await sendTelegramMessage(chatId, message)
        console.log(`Alert sent to ${chatId} for ${watch.asin}`)
        await supabase.from('alert_log').insert({
          watch_id: watch.id,
          user_id: watch.user_id,
          price_at_alert: currentPrice,
          original_price: watch.original_price,
        })
      } else {
        console.log(`Price $${currentPrice} has not hit target $${watch.target_price} yet`)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (err) {
      console.error(`Error checking ${watch.asin}:`, err.message)
    }
  }

  console.log('Price check complete:', new Date().toISOString())
}

checkPrices()
