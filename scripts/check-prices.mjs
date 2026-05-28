import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'pricehawk0b-20'
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY

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
  const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=us`

  const res = await fetch(scraperUrl)
  if (!res.ok) throw new Error(`ScraperAPI error: ${res.status}`)

  const html = await res.text()

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
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) {
        return parsed
      }
    }
  }

  return null
}

async function checkPrices() {
  console.log('Starting price check:', new Date().toISOString())

  const { data: watches, error } = await supabase
    .from('watches')
    .select('*, user_profiles!inner(telegram_chat_id, telegram_verified)')
    .eq('is_active', true)
    .eq('user_profiles.telegram_verified', true)

  if (error) {
    console.error('Failed to fetch watches:', error.message)
    process.exit(1)
  }

  console.log(`Checking ${watches.length} active watches`)

  for (const watch of watches) {
    try {
      console.log(`Checking ASIN ${watch.asin} (${watch.product_title})`)

      const currentPrice = await scrapePrice(watch.asin)

      if (!currentPrice) {
        console.log(`Could not get price for ${watch.asin} - skipping`)
        continue
      }

      console.log(`Current price: $${currentPrice}, Target: $${watch.target_price}`)

      await supabase
        .from('watches')
        .update({
          current_price: currentPrice,
          last_checked_at: new Date().toISOString(),
        })
        .eq('id', watch.id)

      if (currentPrice <= watch.target_price) {
        const chatId = watch.user_profiles.telegram_chat_id
        const savings = (watch.original_price - currentPrice).toFixed(2)
        const savingsPct = (((watch.original_price - currentPrice) / watch.original_price) * 100).toFixed(0)
        const referralUrl = `https://www.amazon.com/dp/${watch.asin}?tag=${ASSOCIATE_TAG}`

        const message = [
          '🔔 <b>Price Alert — PriceHawk</b>',
          '',
          `📦 ${watch.product_title}`,
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
      }

      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (err) {
      console.error(`Error checking ${watch.asin}:`, err.message)
    }
  }

  console.log('Price check complete:', new Date().toISOString())
}

checkPrices()
