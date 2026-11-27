import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import lottie from 'lottie-web'

interface CandidatePageLoaderProps {
  open: boolean
}

let cachedLoadingData: unknown | null = null
let loadingDataPromise: Promise<unknown | null> | null = null

const visitedPaths = new Set<string>()
let isWelcomeActive = false
let loaderOpen = false
let loaderStartTime = 0
let hideTimer: ReturnType<typeof setTimeout> | null = null
let pendingTargetPath: string | null = null
let listenersBound = false
const subscribers = new Set<() => void>()

function normalizePath(path: string): string {
  const clean = (path || '/').split('?')[0].replace(/\/+$/, '')
  return clean || '/'
}

function notify() {
  subscribers.forEach((cb) => cb())
}

function bindRouterListeners() {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true

  router.on('start', (event) => {
    const visit = event.detail.visit as {
      url: URL
      method?: string
      prefetch?: boolean
      poll?: boolean
    }
    const method = (visit.method ?? 'get').toLowerCase()
    const targetPath = normalizePath(visit.url.pathname)

    if (
      visit.prefetch ||
      visit.poll ||
      isWelcomeActive ||
      method !== 'get' ||
      !targetPath.startsWith('/kandidat') ||
      visitedPaths.has(targetPath)
    ) {
      return
    }

    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }

    pendingTargetPath = targetPath
    loaderStartTime = Date.now()
    loaderOpen = true
    notify()
  })

  router.on('finish', (event) => {
    const visit = event.detail.visit as {
      cancelled?: boolean
      interrupted?: boolean
    }

    if (pendingTargetPath && !visit.cancelled && !visit.interrupted) {
      visitedPaths.add(pendingTargetPath)
    }
    pendingTargetPath = null

    if (!loaderOpen) return

    const elapsed = Date.now() - loaderStartTime
    const remaining = Math.max(0, 2000 - elapsed)

    if (hideTimer) {
      clearTimeout(hideTimer)
    }
    hideTimer = setTimeout(() => {
      loaderOpen = false
      hideTimer = null
      notify()
    }, remaining)
  })
}

export function markPathVisited(path: string) {
  visitedPaths.add(normalizePath(path))
}

export function resetVisitedPaths() {
  visitedPaths.clear()
  pendingTargetPath = null
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  loaderOpen = false
  notify()
}

export function setWelcomeLoaderBlocked(blocked: boolean) {
  isWelcomeActive = blocked
}

export function useCandidatePageLoader(): boolean {
  const [open, setOpen] = useState(loaderOpen)

  useEffect(() => {
    bindRouterListeners()
    const sync = () => setOpen(loaderOpen)
    subscribers.add(sync)
    sync()

    return () => {
      subscribers.delete(sync)
    }
  }, [])

  return open
}

export function preloadLoadingAnimation(): Promise<unknown | null> {
  if (cachedLoadingData) {
    return Promise.resolve(cachedLoadingData)
  }
  if (!loadingDataPromise) {
    loadingDataPromise = fetch('/assets/animations/save.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cachedLoadingData = data
        return data
      })
      .catch(() => null)
  }
  return loadingDataPromise
}

export default function CandidatePageLoader({ open }: CandidatePageLoaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [skipEnterAnim] = useState(() => open)

  useEffect(() => {
    void preloadLoadingAnimation()
  }, [])

  useEffect(() => {
    if (!open) return

    const container = containerRef.current
    if (!container) return

    let anim: ReturnType<typeof lottie.loadAnimation> | null = null
    let cancelled = false

    const initAnimation = async () => {
      const data = await preloadLoadingAnimation()
      if (cancelled || !containerRef.current) return

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        ...(data ? { animationData: data } : { path: '/assets/animations/save.json' }),
      })
    }

    void initAnimation()

    return () => {
      cancelled = true
      if (anim) {
        anim.destroy()
      }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="candidate-page-loader"
          initial={skipEnterAnim ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-white/75 backdrop-blur-sm select-none"
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            initial={skipEnterAnim ? false : { opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <div ref={containerRef} className="w-40 h-40 sm:w-48 sm:h-48" />
            <span className="font-['Instrument_Sans',system-ui,sans-serif] text-sm font-semibold tracking-[-0.02em] text-[var(--color-ink,#3a2e5c)]">
              Memuat halaman...
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
