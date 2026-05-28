import { NextResponse } from 'next/server'
import { extractASIN, buildReferralUrl } from '@/lib/amazon/asin'
import { createClient } from '@/lib/supabase/server'

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'pricehawk0b-20'

async function scrapeAmazonProduct(asin: string) {
  const targetUrl = `https://www.amazon.com/dp/${asin}`
  const scraperUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=us`

  const res = await fetch(scraperUrl, {
    headers: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!res.ok) {
    throw new Error(`ScraperAPI returned ${res.status}`)
  }

  const html = await res.text()

  let title = 'Unknown Product'
  const titleMatch = html.match(/id="productTitle"[^>]*>\s*([^<]+)/i)
  if (titleMatch) title = titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&#\d+;/g, '').replace(/&amp;/g, '&').replace(/&#\d+;/g, '')

  let price: number | null = null
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
        price = parsed
        break
      }
    }
  }

  let image = ''
  const imageMatch = html.match(/"hiRes":"(https:\/\/[^"]+\.jpg)"/i)
    || html.match(/id="landingImage"[^>]*src="([^"]+)"/i)
    || html.match(/"large":"(https:\/\/[^"]+\.jpg)"/i)
  if (imageMatch) image = imageMatch[1]

  return { title, price, image }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const asin = extractASIN(url)
    if (!asin) {
      return NextResponse.json(
        { error: 'Could not find a valid Amazon product in that URL.' },
        { status: 400 }
      )
    }

    const scraperKey = process.env.SCRAPER_API_KEY
    if (!scraperKey) {
      return NextResponse.json(
        { error: 'ScraperAPI key not configured.' },
        { status: 500 }
      )
    }

    const product = await scrapeAmazonProduct(asin)

    if (!product.price) {
      return NextResponse.json(
        { error: `Price not found. Title found: "${product.title}". Please try again.` },
        { status: 422 }
      )
    }

    return NextResponse.json({
      asin,
      title: product.title,
      image: product.image,
      price: product.price,
      referral_url: buildReferralUrl(asin, ASSOCIATE_TAG),
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    )
  }
}
