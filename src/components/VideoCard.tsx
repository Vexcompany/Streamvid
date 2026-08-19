import { useState } from 'react'

interface VideoCardProps {
  src: string
  index: number
}

export function VideoCard({ src, index }: VideoCardProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <article className="video-card">
      <header className="video-card__header">
        <h2 className="video-card__title">Video {index}</h2>
        {status === 'error' && (
          <span className="video-card__error">Unable to load video</span>
        )}
      </header>

      <div className="video-card__player-wrap">
        {status === 'loading' && (
          <div className="video-card__loading">Loading…</div>
        )}
        <video
          className="video-card__player"
          src={src}
          controls
          playsInline
          preload="metadata"
          onLoadedData={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      </div>
    </article>
  )
}
