/**
 * Resolve public video-wrapper URLs to directly accessible MP4 URLs.
 *
 * Supported wrappers:
 *   https://disiniiyaa.click/{ID} -> https://cdn2.videy.co/{ID}.mp4
 *   https://asupanrare.com/{ID}   -> https://cdn.asupanrare.com/videos/raw/{ID}.mp4
 *
 * Direct public MP4 URLs on the ACEIMG CDN are accepted as-is. The
 * short.gy URL's final destination has not been verified, so no guessed
 * wrapper-ID mapping is applied for ACEIMG.
 */

const ID_PATTERN = /^[A-Za-z0-9]+$/

const PROVIDERS: Record<string, (id: string) => string> = {
  'disiniiyaa.click': (id) => `https://cdn2.videy.co/${id}.mp4`,
  'asupanrare.com': (id) =>
    `https://cdn.asupanrare.com/videos/raw/${id}.mp4`,
}

const DIRECT_VIDEO_HOSTS = new Set(['cdn.aceimg.com'])

export function resolveVideoUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL

  try {
    const withProtocol = /^https?:\\/\\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

    url = new URL(withProtocol)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const hostname = url.hostname.toLowerCase()

  if (
    DIRECT_VIDEO_HOSTS.has(hostname) &&
    url.pathname.toLowerCase().endsWith('.mp4')
  ) {
    return url.toString()
  }

  const resolveProvider = PROVIDERS[hostname]
  if (!resolveProvider) return null

  const segments = url.pathname
    .replace(/^\\/+|\\/+$/g, '')
    .split('/')
    .filter(Boolean)

  const id = segments[0]
  if (!id || !ID_PATTERN.test(id) || id.length < 3 || id.length > 64) {
    return null
  }

  return resolveProvider(id)
}

/** Parse newline-separated links, skipping invalid entries and duplicates. */
export function parseAndResolveUrls(text: string): string[] {
  const seen = new Set<string>()
  const results: string[] = []

  for (const line of text.split(/\\r?\\n/)) {
    const resolved = resolveVideoUrl(line)
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved)
      results.push(resolved)
    }
  }

  return results
}
