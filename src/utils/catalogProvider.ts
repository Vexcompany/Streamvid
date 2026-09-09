import { parseVideoCatalog, type VideoCatalog } from './videoCatalog'

export interface CatalogProvider {
  readonly id: string
  readonly name: string
  parse(html: string, baseUrl: string): VideoCatalog
}

/**
 * Default provider for pages that expose conventional video-card markup.
 * Source-specific selectors belong in dedicated adapters, not in the UI.
 */
export const genericCatalogProvider: CatalogProvider = {
  id: 'generic-html',
  name: 'Generic HTML catalog',
  parse(html, baseUrl) {
    return parseVideoCatalog(html, baseUrl)
  },
}
