import { useState, useCallback } from 'react'
import { parseAndResolveUrls } from './utils/resolveVideo'
import { VideoCard } from './components/VideoCard'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [videos, setVideos] = useState<string[]>([])

  const handleReveal = useCallback(() => {
    const resolved = parseAndResolveUrls(input)
    setVideos(resolved)
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setVideos([])
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Streamvid</h1>
        <p className="header__subtitle">Paste wrapper URLs · reveal public MP4s</p>
      </header>

      <main className="main">
        <section className="input-section">
          <label htmlFor="urls" className="input-label">
            Video URLs (one per line)
          </label>
          <textarea
            id="urls"
            className="input-textarea"
            placeholder={`https://disiniiyaa.click/kE2edBBO1
https://disiniiyaa.click/ABC123
disiniiyaa.click/XYZ789`}
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
        </section>

        {videos.length > 0 && (
          <section className="results">
            <p className="results__count">
              {videos.length} video{videos.length === 1 ? '' : 's'} resolved
            </p>
            <div className="results__list">
              {videos.map((src, i) => (
                <VideoCard key={src} src={src} index={i + 1} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
