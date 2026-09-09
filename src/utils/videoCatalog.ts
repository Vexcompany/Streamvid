/**
 * Provider-agnostic HTML catalog parser.
 *
 * The parser only understands common card semantics and does not depend on a
 * particular provider hostname. A provider adapter can normalize its HTML
 * into this shape before handing it to the Streamvid UI.
 */

export interface VideoItem {
  id: string
  title: string
  thumbnail: string | null
  pageUrl: string
  duration: string | null
  views: string | null
  category: string | null
  publishedAt: string | null
}

export interface VideoCatalog {
  items: VideoItem[]
  total: number
  page: number | null
  pageCount: number | null
}

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function absoluteUrl(value: string | null | undefined, baseUrl?: string): string | null {
  const valueClean = clean(value)
  if (!valueClean) return null

  try {
    return new URL(valueClean, baseUrl || document.baseURI).href
  } catch {
    return null
  }
}

function firstText(element: Element, selectors: string[]): string {
  for (const selector of selectors) {
    const value = clean(element.querySelector(selector)?.textContent)
    if (value) return value
  }
  return ''
}

function firstAttribute(element: Element, selectors: string[], attribute: string): string {
  for (const selector of selectors) {
    const value = clean(element.querySelector(selector)?.getAttribute(attribute))
    if (value) return value
  }
  return ''
}

function parsePageNumber(doc: Document): number | null {
  const current = doc.querySelector(
    '[aria-current="page"], .pagination .active, .pagination .current',
  )
  const value = clean(current?.textContent)
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) ? page : null
}

function parsePageCount(doc: Document): number | null {
  const links = Array.from(
    doc.querySelectorAll('.pagination a, nav[aria-label*="pagination" i] a'),
  )
    .map((link) => Number.parseInt(clean(link.textContent), 10))
    .filter((value) => Number.isFinite(value))

  if (!links.length) return null
  return Math.max(...links)
}

/**
 * Parse generic video-card HTML into Streamvid's stable catalog model.
 * Call this from a provider adapter; the UI never needs to know the source
 * site's DOM structure.
 */
export function parseVideoCatalog(html: string, baseUrl?: string): VideoCatalog {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const cards = Array.from(
    doc.querySelectorAll(
      '.videoCard, [data-video-card], article[class*="video" i], a[class*="videoCard" i]',
    ),
  )

  const items: VideoItem[] = []
  const seen = new Set<string>()

  for (const card of cards) {
    const link = card.matches('a') ? card : card.querySelector('a[href]')
    const pageUrl = absoluteUrl(link?.getAttribute('href'), baseUrl)
    if (!pageUrl || seen.has(pageUrl)) continue

    const image = card.querySelector('img[src], img[data-src], source[src]')
    const thumbnail = absoluteUrl(
      image?.getAttribute('src') || image?.getAttribute('data-src'),
      baseUrl,
    )

    const title =
      clean(link?.getAttribute('aria-label')) ||
      firstText(card, ['h1', 'h2', 'h3', 'h4', 'h5', '[data-title]', '.title', '.videoText']) ||
      clean(image?.getAttribute('alt')) ||
      pageUrl

    const duration = firstText(card, [
      '[data-duration]',
      '.duration',
      '[class*="duration" i]',
      'time',
    ]) || null

    const views = firstText(card, [
      '[data-views]',
      '.views',
      '[class*="views" i]',
    ]) || null

    const category = firstText(card, [
      '[data-category]',
      '.category',
      '[class*="category" i]',
    ]) || null

    const publishedAt =
      clean(card.querySelector('time')?.getAttribute('datetime')) || null

    const id =
      clean(card.getAttribute('data-video-id')) ||
      clean(card.querySelector('[data-video-id]')?.getAttribute('data-video-id')) ||
      pageUrl

    seen.add(pageUrl)
    items.push({ id, title, thumbnail, pageUrl, duration, views, category, publishedAt })
  }

  return {
    items,
    total: items.length,
    page: parsePageNumber(doc),
    pageCount: parsePageCount(doc),
  }
}

/**
 * Optional helper for adapters that already have a Document.
 */
export function parseVideoCatalogDocument(doc: Document, baseUrl?: string): VideoCatalog {
  return parseVideoCatalog(doc.documentElement.outerHTML, baseUrl)
}
