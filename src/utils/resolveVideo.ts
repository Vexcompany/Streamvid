/**
 * Resolve a public video-wrapper URL to its corresponding CDN MP4 URL.
 *
 * Supported wrapper providers:
 *   https://disiniiyaa.click/{ID}  →  https://cdn2.videy.co/{ID}.mp4
 *   https://asupanrare.com/{ID}    →  https://cdn.asupanrare.com/videos/raw/{ID}.mp4
 *
 * Only known public wrapper domains are resolved. Query strings and trailing
 * slashes are tolerated.
 */

const ID_PATTERN = /^[A-Za-z0-9]+$/

const PROVIDERS: Record<string, (id: string) => string> = {
  'disiniiyaa.click': (id) => `https://cdn2.videy.co/${id}.mp4`,
  'asupanrare.com': (id) =>
    `https://cdn.asupanrare.com/videos/raw/${id}.mp4`,
}

/**
 * Extract the first meaningful pathname segment from a supported wrapper URL
 * and return its resolved CDN MP4 URL, or null if the provider/ID is invalid.
 */
export function resolveVideoUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL

  try {
    // Ensure we have a protocol so URL() parses correctly.
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

    url = new URL(withProtocol)
  } catch {
    return null
  }

  const hostname = url.hostname.toLowerCase()
  const resolveProvider = PROVIDERS[hostname]

  if (!resolveProvider) return null

  const segments = url.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)

  if (segments.length === 0) return null

  const id = segments[0]

  // Reject obviously invalid IDs.
  if (!ID_PATTERN.test(id) || id.length < 3 || id.length > 64) {
    return null
  }

  return resolveProvider(id)
}

/**
 * Parse a multi-line textarea value into unique resolved video URLs.
 * Empty lines and unsupported/invalid entries are skipped.
 */
export function parseAndResolveUrls(text: string): string[] {
  const lines = text.split(/\r?\n/)
  const seen = new Set<string>()
  const results: string[] = []

  for (const line of lines) {
    const resolved = resolveVideoUrl(line)
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved)
      results.push(resolved)
    }
  }

  return results
}
