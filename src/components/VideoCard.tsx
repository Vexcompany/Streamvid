import { useEffect, useRef, useState } from 'react'

interface VideoCardProps {
  src: string
  index: number
}

/**
 * Keep video elements dormant until they approach the viewport. This avoids
 * asking every CDN for metadata at once when a long list is revealed.
 */
export function VideoCard({ src, index }: VideoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting')

  useEffect(() => {
    const target = containerRef.current
    if (!target || shouldLoad) return
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true)
        observer.disconnect()
      }
    }, { rootMargin: '160px 0px' })

    observer.observe(target)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <article className="video-card" ref={containerRef}>
      <header className="video-card__header">
        <h2 className="video-card__title">Video {index}</h2>
        {status === 'error' && <span className="video-card__error">Unable to load video</span>}
      </header>
      <div className="video-card__player-wrap">
        {(status === 'waiting' || status === 'loading') && (
          <div className="video-card__loading">{status === 'waiting' ? 'Waiting to load…' : 'Loading…'}</div>
        )}
        <video
          className="video-card__player"
          src={shouldLoad ? src : undefined}
          controls
          playsInline
          preload="none"
          onLoadStart={() => setStatus('loading')}
          onLoadedData={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      </div>
    </article>
  )
}
