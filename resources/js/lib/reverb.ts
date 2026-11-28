import { useEffect, useState } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher?: typeof Pusher
    Echo?: Echo<'reverb'>
  }
}

export type ReverbConnectionState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'unavailable'
  | 'unconfigured'

let echoInstance: Echo<'reverb'> | null = null
const stateListeners = new Set<(state: ReverbConnectionState) => void>()
let currentConnectionState: ReverbConnectionState = 'disconnected'

function emitConnectionState(next: ReverbConnectionState) {
  currentConnectionState = next
  stateListeners.forEach((cb) => cb(next))
}

function getXsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function initEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') return null
  if (echoInstance) return echoInstance

  const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
  if (!key) {
    emitConnectionState('unconfigured')
    return null
  }

  window.Pusher = Pusher

  const scheme = ((import.meta.env.VITE_REVERB_SCHEME as string | undefined) || 'http')
    .trim()
    .toLowerCase()
  const rawHost =
    (import.meta.env.VITE_REVERB_HOST as string | undefined) || window.location.hostname
  const host =
    rawHost
      .trim()
      .replace(/^(https?|wss?):\/\//i, '')
      .replace(/\/+.*$/, '') || window.location.hostname
  const port = Number(import.meta.env.VITE_REVERB_PORT || (scheme === 'https' ? 443 : 8081))
  const forceTLS = scheme === 'https'

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        fetch('/broadcasting/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': getXsrfToken(),
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(async (res) => {
            const payload = await res.json().catch(() => ({}))
            if (!res.ok) {
              callback(new Error(payload?.message || 'Channel auth failed'), null)
              return
            }
            callback(null, payload)
          })
          .catch((err) => {
            callback(err instanceof Error ? err : new Error('Network error'), null)
          })
      },
    }),
  })

  window.Echo = echoInstance

  const pusher = (echoInstance.connector as unknown as { pusher?: Pusher })?.pusher
  if (pusher?.connection) {
    const syncState = () => {
      const state = pusher.connection.state as string
      if (state === 'connected') {
        emitConnectionState('connected')
      } else if (state === 'connecting' || state === 'initialized') {
        emitConnectionState('connecting')
      } else if (state === 'unavailable' || state === 'failed') {
        emitConnectionState('unavailable')
      } else {
        emitConnectionState('disconnected')
      }
    }

    syncState()
    pusher.connection.bind('state_change', syncState)
    pusher.connection.bind('connected', () => emitConnectionState('connected'))
    pusher.connection.bind('unavailable', () => emitConnectionState('unavailable'))
    pusher.connection.bind('disconnected', () => emitConnectionState('disconnected'))
  }

  return echoInstance
}

export function getEcho(): Echo<'reverb'> | null {
  return echoInstance ?? initEcho()
}

export function useReverbConnectionStatus(): ReverbConnectionState {
  const [state, setState] = useState<ReverbConnectionState>(() => {
    initEcho()
    return currentConnectionState
  })

  useEffect(() => {
    const handler = (next: ReverbConnectionState) => setState(next)
    stateListeners.add(handler)
    setState(currentConnectionState)
    return () => {
      stateListeners.delete(handler)
    }
  }, [])

  return state
}
