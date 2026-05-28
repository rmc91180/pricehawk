export function extractASIN(url: string): string | null {
  try {
    // Clean up the URL
    const cleaned = url.trim()

    // Match all common Amazon URL formats
    const patterns = [
      /amazon\.com\/dp\/([A-Z0-9]{10})/i,
      /amazon\.com\/gp\/product\/([A-Z0-9]{10})/i,
      /amazon\.com\/.*\/dp\/([A-Z0-9]{10})/i,
      /amazon\.com\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
      /\/dp\/([A-Z0-9]{10})/i,
    ]

    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match && match[1]) {
        return match[1].toUpperCase()
      }
    }

    return null
  } catch {
    return null
  }
}

export function buildReferralUrl(asin: string, tag: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`
}