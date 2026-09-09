export interface FeedItem {
  id: string
  title: string
  link: string
  description: string
  publishedAt: string | null
}

export interface Feed {
  title: string
  description: string
  items: FeedItem[]
}

function text(parent: Element, selector: string): string {
  return parent.querySelector(selector)?.textContent?.trim() ?? ''
}

function parseRss(doc: Document): Feed {
  const channel = doc.querySelector('channel')

  if (!channel) {
    throw new Error('RSS channel tidak ditemukan')
  }

  const items = Array.from(channel.querySelectorAll(':scope > item')).map(
    (item, index) => {
      const link = text(item, 'link')
      const guid = text(item, 'guid')

      return {
        id: guid || link || String(index),
        title: text(item, 'title'),
        link,
        description: text(item, 'description'),
        publishedAt: text(item, 'pubDate') || null,
      }
    },
  )

  return {
    title: text(channel, 'title'),
    description: text(channel, 'description'),
    items,
  }
}

function parseAtom(doc: Document): Feed {
  const root = doc.querySelector('feed')

  if (!root) {
    throw new Error('Atom feed tidak ditemukan')
  }

  const items = Array.from(root.querySelectorAll(':scope > entry')).map(
    (entry, index) => {
      const linkElement =
        entry.querySelector('link[rel="alternate"]') ??
        entry.querySelector('link')

      const link = linkElement?.getAttribute('href')?.trim() ?? ''
      const id = text(entry, 'id') || link || String(index)

      return {
        id,
        title: text(entry, 'title'),
        link,
        description:
          text(entry, 'summary') ||
          text(entry, 'content'),
        publishedAt:
          text(entry, 'published') ||
          text(entry, 'updated') ||
          null,
      }
    },
  )

  return {
    title: text(root, 'title'),
    description: text(root, 'subtitle'),
    items,
  }
}

export function parseFeed(xml: string): Feed {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('Feed XML tidak valid')
  }

  if (doc.querySelector('rss')) {
    return parseRss(doc)
  }

  if (doc.querySelector('feed')) {
    return parseAtom(doc)
  }

  throw new Error('Format feed tidak didukung')
}

export async function fetchFeed(url: string): Promise<Feed> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Feed gagal diambil (${response.status})`)
  }

  const xml = await response.text()
  return parseFeed(xml)
}
