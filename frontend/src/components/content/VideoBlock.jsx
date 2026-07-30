import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTracking } from '../../hooks/useTracking'

let apiLoadPromise = null

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return apiLoadPromise
}

export default function VideoBlock({ block }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const lastStateRef = useRef(null)
  const { lessonId } = useParams()
  const { trackEvent } = useTracking()

  const context = { lesson_id: Number(lessonId), content_block_id: block.id }

  useEffect(() => {
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: block.video_youtube_id,
        events: {
          onStateChange: (event) => {
            const player = event.target
            const position = Math.round(player.getCurrentTime())

            if (event.data === YT.PlayerState.PLAYING) {
              // A PLAYING state right after a PAUSED state at a very different
              // position indicates the user scrubbed the seek bar.
              if (
                lastStateRef.current &&
                lastStateRef.current.state === YT.PlayerState.PAUSED &&
                Math.abs(position - lastStateRef.current.position) > 2
              ) {
                trackEvent('video_seek', { ...context, payload: { position_seconds: position } })
              }
              trackEvent('video_play', { ...context, payload: { position_seconds: position } })
            } else if (event.data === YT.PlayerState.PAUSED) {
              trackEvent('video_pause', { ...context, payload: { position_seconds: position } })
            } else if (event.data === YT.PlayerState.ENDED) {
              trackEvent('video_complete', { ...context, payload: { position_seconds: position } })
            }

            lastStateRef.current = { state: event.data, position }
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.video_youtube_id])

  return (
    <div style={{ aspectRatio: '16 / 9', maxWidth: 640 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
