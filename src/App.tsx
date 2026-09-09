import { useCallback, useState } from 'react'
import { parseAndResolveUrls } from './utils/resolveVideo'
import { fetchFeed, type Feed } from './utils/feed'
import { VideoCard } from './components/VideoCard'
import './App.css'

type Page = 'home' | 'asupanrare' | 'feed'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [page, setPage] = useState<Page>('home')

  const [input, setInput] = useState('')
  const [videos, setVideos] = useState<string[]>([])

  const [feed, setFeed] = useState<Feed | null>(null)
  const [feedUrl, setFeedUrl] = useState('')
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)

  const navigate = useCallback((nextPage: Page) => {
    setPage(nextPage)
    setMenuOpen(false)
  }, [])

  const handleReveal = useCallback(() => {
    const resolved = parseAndResolveUrls(input)
    setVideos(resolved)
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setVideos([])
  }, [])

  const handleLoadFeed = useCallback(async () => {
    const url = feedUrl.trim()
    if (!url) return

    try {
      setFeedLoading(true)
      setFeedError(null)
      setFeed(await fetchFeed(url))
    } catch (error) {
      setFeed(null)
      setFeedError(error instanceof Error ? error.message : 'Gagal mengambil feed')
    } finally {
      setFeedLoading(false)
    }
  }, [feedUrl])

  const pageTitle = page === 'home' ? 'Streamvid' : page === 'asupanrare' ? 'AsupanRare' : 'Feed'

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="menu-button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="topbar__brand">{pageTitle}</div>
        <div className="topbar__spacer" />
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="menu-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="drawer">
            <div className="drawer__brand">
              <strong>Streamvid</strong>
              <span>Video workspace</span>
            </div>

            <nav className="drawer__nav" aria-label="Main navigation">
              <button
                type="button"
                className={`drawer__item ${page === 'home' ? 'drawer__item--active' : ''}`}
                onClick={() => navigate('home')}
              >
                <span className="drawer__icon">⌂</span>
                <span>Streamvid</span>
              </button>
              <button
                type="button"
                className={`drawer__item ${page === 'asupanrare' ? 'drawer__item--active' : ''}`}
                onClick={() => navigate('asupanrare')}
              >
                <span className="drawer__icon">◉</span>
                <span>AsupanRare</span>
              </button>
              <button
                type="button"
                className={`drawer__item ${page === 'feed' ? 'drawer__item--active' : ''}`}
                onClick={() => navigate('feed')}
              >
                <span className="drawer__icon">≋</span>
                <span>RSS / Atom Feed</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      <main className="main">
        {page === 'home' && (
          <section className="home-page">
            <div className="hero">
              <span className="hero__eyebrow">WATCH YOUR WAY</span>
              <h1>Streamvid</h1>
              <p>Paste public video wrapper URLs and keep your watching experience simple.</p>
            </div>

            <section className="input-section">
              <label htmlFor="urls" className="input-label">Video URLs</label>
              <textarea
                id="urls"
                className="input-textarea"
                placeholder={`https://example.com/VIDEO_ID\nhttps://example.com/ANOTHER_ID`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={7}
                spellCheck={false}
              />
              <div className="actions">
                <button type="button" className="btn btn--primary" onClick={handleReveal} disabled={!input.trim()}>
                  Reveal
                </button>
                <button type="button" className="btn btn--secondary" onClick={handleClear}>Clear</button>
              </div>
            </section>

            {videos.length > 0 && (
              <section className="results">
                <p className="results__count">{videos.length} video{videos.length === 1 ? '' : 's'} resolved</p>
                <div className="results__list">
                  {videos.map((src, i) => <VideoCard key={src} src={src} index={i + 1} />)}
                </div>
              </section>
            )}
          </section>
        )}

        {page === 'asupanrare' && (
          <section className="provider-page">
            <div className="provider-hero">
              <span className="provider-hero__badge">PROVIDER</span>
              <h1>AsupanRare</h1>
              <p>A dedicated Streamvid view for provider content. Connect its public catalog through a provider adapter.</p>
            </div>

            <div className="provider-placeholder">
              <div className="provider-placeholder__icon">◎</div>
              <h2>Catalog ready for integration</h2>
              <p>The UI is ready. The catalog adapter can supply cards, thumbnails, categories and public video URLs without embedding the source website.</p>
              <button type="button" className="btn btn--primary" onClick={() => navigate('feed')}>
                Open Feed Tools
              </button>
            </div>
          </section>
        )}

        {page === 'feed' && (
          <section className="feed-section">
            <div className="section-heading">
              <span className="hero__eyebrow">DATA SOURCE</span>
              <h1>RSS / Atom Feed</h1>
              <p>Load a feed and inspect its structured items.</p>
            </div>

            <label htmlFor="feed-url" className="input-label">Feed URL</label>
            <input
              id="feed-url"
              className="feed-input"
              type="url"
              placeholder="https://example.com/feed.xml"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLoadFeed() }}
            />
            <div className="actions">
              <button type="button" className="btn btn--primary" onClick={() => void handleLoadFeed()} disabled={!feedUrl.trim() || feedLoading}>
                {feedLoading ? 'Loading…' : 'Load Feed'}
              </button>
            </div>

            {feedError && <p className="feed-error">{feedError}</p>}

            {feed && (
              <section className="feed-results">
                <div className="feed-header">
                  <h2>{feed.title || 'Feed'}</h2>
                  {feed.description && <p>{feed.description}</p>}
                </div>
                <p className="results__count">{feed.items.length} item{feed.items.length === 1 ? '' : 's'}</p>
                <div className="feed-list">
                  {feed.items.map((item) => (
                    <article className="feed-item" key={item.id}>
                      <h3>{item.title || 'Untitled'}</h3>
                      {item.publishedAt && <time>{new Date(item.publishedAt).toLocaleString()}</time>}
                      {item.description && <p>{item.description}</p>}
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer">Open</a>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
