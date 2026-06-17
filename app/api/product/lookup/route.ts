import { NextResponse } from 'next/server'
import { extractASIN, buildReferralUrl } from '@/lib/amazon/asin'
import { createClient } from '@/lib/supabase/server'

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'pricehawk0b-20'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
]

async function scrapeAmazonProduct(asin: string) {
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

  if (!res.ok) {
    throw new Error(`Amazon returned ${res.status}`)
  }

  const html = await res.text()

  if (
    html.includes('api-services-support@amazon.com') ||
    html.includes('Type the characters you see in this image')
  ) {
    throw new Error('Amazon is showing a CAPTCHA. Please try again in a few minutes.')
  }

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
