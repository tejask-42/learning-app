import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import client from '../api/client'

const SESSION_KEY = 'learning-app-session-id'
const FLUSH_INTERVAL_MS = 5000
const FLUSH_SIZE = 10

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// Module-level queue so it survives across component instances and can be
// flushed from a beforeunload handler regardless of which component set it up.
const queue = []

function flush() {
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  client.post('/events', { events: batch }).catch(() => {
    // best-effort; dropped events are acceptable for a demo app
  })
}

let flushTimer = null

export function useTracking() {
  const trackEvent = useCallback((eventType, { payload, ...context } = {}) => {
    queue.push({
      event_type: eventType,
      session_id: getSessionId(),
      client_timestamp: new Date().toISOString(),
      payload,
      ...context,
    })
    if (queue.length >= FLUSH_SIZE) flush()
  }, [])

  useEffect(() => {
    if (!flushTimer) {
      flushTimer = setInterval(flush, FLUSH_INTERVAL_MS)
    }
    const handleUnload = () => flush()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return { trackEvent }
}

export function usePageViewTracking(enabled) {
  const { trackEvent } = useTracking()
  const location = useLocation()

  useEffect(() => {
    if (!enabled) return
    trackEvent('page_view', { payload: { path: location.pathname } })
  }, [enabled, location.pathname, trackEvent])
}
