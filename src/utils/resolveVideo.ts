/**
 * Resolve a public video-wrapper URL to its corresponding CDN MP4 URL.
 *
 * Pattern:
 *   https://disiniiyaa.click/{ID}  →  https://cdn2.videy.co/{ID}.mp4
 *
 * Also accepts bare domain forms and tolerates query strings / trailing slashes.
 */

const CDN_BASE = 'https://cdn2.videy.co'

/** Allowed characters for a video ID (alphanumeric). */
const ID_PATTERN = /^[A-Za-z0-9]+$/

/**
 * Extract the first meaningful pathname segment from a URL-like string
 * and return a resolved CDN MP4 URL, or null if invalid.
 */
export function resolveVideoUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let pathname: string

  try {
    // Ensure we have a protocol so URL() parses correctly
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

    const url = new URL(withProtocol)
    pathname = url.pathname
  } catch {
    // Fallback: treat as a raw path / ID
    pathname = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  // Remove leading/trailing slashes and split
  const segments = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)

  if (segments.length === 0) return null

  const id = segments[0]

  // Reject obviously invalid IDs
  if (!ID_PATTERN.test(id) || id.length < 3 || id.length > 64) {
    return null
  }

  return `${CDN_BASE}/${id}.mp4`
}

/**
 * Parse a multi-line textarea value into unique resolved video URLs.
 * Empty lines and invalid entries are skipped.
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
