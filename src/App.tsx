import { useState, useCallback } from 'react'
import { parseAndResolveUrls } from './utils/resolveVideo'
import { fetchFeed, type Feed } from './utils/feed'
import { VideoCard } from './components/VideoCard'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'watch' | 'feed'>('watch')

  const [input, setInput] = useState('')
  const [videos, setVideos] = useState<string[]>([])

  const [feed, setFeed] = useState<Feed | null>(null)
  const [feedUrl, setFeedUrl] = useState('')
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)

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

      const result = await fetchFeed(url)
      setFeed(result)
    } catch (error) {
      setFeed(null)

      setFeedError(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil feed',
      )
    } finally {
      setFeedLoading(false)
    }
  }, [feedUrl])

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Streamvid</h1>
        <p className="header__subtitle">
          Paste wrapper URLs · reveal public MP4s
        </p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'watch' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('watch')}
        >
          Watch
        </button>

        <button
          type="button"
          className={`tab ${activeTab === 'feed' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </button>
      </nav>

      <main className="main">
        {activeTab === 'watch' && (
          <section className="input-section">
            <label htmlFor="urls" className="input-label">
              Video URLs (one per line)
            </label>

            <textarea
              id="urls"
              className="input-textarea"
              placeholder={`https://example.com/VIDEO_ID
https://example.com/ANOTHER_ID`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              spellCheck={false}
            />

            <div className="actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleReveal}
                disabled={!input.trim()}
              >
                Reveal
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            {videos.length > 0 && (
              <section className="results">
                <p className="results__count">
                  {videos.length} video
                  {videos.length === 1 ? '' : 's'} resolved
                </p>

                <div className="results__list">
                  {videos.map((src, i) => (
                    <VideoCard
                      key={src}
                      src={src}
                      index={i + 1}
                    />
                  ))}
                </div>
              </section>
            )}
          </section>
        )}

        {activeTab === 'feed' && (
          <section className="feed-section">
            <label htmlFor="feed-url" className="input-label">
              RSS / Atom Feed URL
            </label>

            <input
              id="feed-url"
              className="feed-input"
              type="url"
              placeholder="https://example.com/feed.xml"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleLoadFeed()
                }
              }}
            />

            <div className="actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void handleLoadFeed()}
                disabled={!feedUrl.trim() || feedLoading}
              >
                {feedLoading ? 'Loading…' : 'Load Feed'}
              </button>
            </div>

            {feedError && (
              <p className="feed-error">
                {feedError}
              </p>
            )}

            {feed && (
              <section className="feed-results">
                <div className="feed-header">
                  <h2>{feed.title || 'Feed'}</h2>

                  {feed.description && (
                    <p>{feed.description}</p>
                  )}
                </div>

                <p className="results__count">
                  {feed.items.length} item
                  {feed.items.length === 1 ? '' : 's'}
                </p>

                <div className="feed-list">
                  {feed.items.map((item) => (
                    <article
                      className="feed-item"
                      key={item.id}
                    >
                      <h3>{item.title || 'Untitled'}</h3>

                      {item.publishedAt && (
                        <time>
                          {new Date(
                            item.publishedAt,
                          ).toLocaleString()}
                        </time>
                      )}

                      {item.description && (
                        <p>{item.description}</p>
                      )}

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      )}
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
