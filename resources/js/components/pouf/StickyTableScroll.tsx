import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from 'class-variance-authority'

interface StickyTableScrollProps {
  children: ReactNode
  className?: string
}

interface Coords {
  left: number
  width: number
  bottom: number
  scrollWidth: number
  isVisible: boolean
}

/**
 * StickyTableScroll
 * Wraps a DataTable (like Pouf <Table />) and creates a synced, floating horizontal scrollbar
 * that sticks to the bottom of the viewport whenever the table's native bottom scrollbar
 * is hidden below the fold.
 */
export function StickyTableScroll({ children, className }: StickyTableScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const floatingBarRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const isSyncingFromFloating = useRef(false)
  const isSyncingFromTable = useRef(false)

  const [coords, setCoords] = useState<Coords>({
    left: 0,
    width: 0,
    bottom: 0,
    scrollWidth: 0,
    isVisible: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    // Find the scrollable table wrapper inside
    const tableWrap =
      (containerRef.current.querySelector('.pouf-table__wrap') as HTMLElement | null) ??
      (containerRef.current.querySelector('[class*="overflow-x-auto"]') as HTMLElement | null) ??
      containerRef.current

    if (!tableWrap) return

    let rafId: number | null = null

    const updateCoords = () => {
      const scrollWidth = tableWrap.scrollWidth
      const clientWidth = tableWrap.clientWidth
      const hasOverflow = scrollWidth > clientWidth + 2

      if (!hasOverflow) {
        setCoords((prev) => (prev.isVisible ? { ...prev, isVisible: false } : prev))
        return
      }

      const rect = tableWrap.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Check if mobile BottomNav is visible
      const bottomNav = document.querySelector('.pouf-bottomnav') as HTMLElement | null
      let bottomOffset = 0
      if (bottomNav && window.getComputedStyle(bottomNav).display !== 'none') {
        bottomOffset = bottomNav.offsetHeight + 12
      }

      // Visibility conditions:
      // 1. Table has entered or is within viewport
      const isTopInView = rect.top < windowHeight - 40
      // 2. Table bottom is below viewport (so native scrollbar is hidden below screen)
      const isBottomOffscreen = rect.bottom > windowHeight + 10
      // 3. Table hasn't scrolled completely past the top of the viewport
      const isStillInView = rect.bottom > bottomOffset + 40

      const isVisible = hasOverflow && isTopInView && isBottomOffscreen && isStillInView

      setCoords({
        left: Math.max(0, rect.left),
        width: rect.width,
        bottom: bottomOffset,
        scrollWidth,
        isVisible,
      })

      // Sync scrollLeft from table to floating bar if not currently dragging floating bar
      if (floatingBarRef.current && !isSyncingFromFloating.current) {
        floatingBarRef.current.scrollLeft = tableWrap.scrollLeft
      }
    }

    const scheduleUpdate = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        updateCoords()
      })
    }

    // Scroll listeners
    const handleTableScroll = () => {
      if (isSyncingFromFloating.current) return
      isSyncingFromTable.current = true
      if (floatingBarRef.current) {
        floatingBarRef.current.scrollLeft = tableWrap.scrollLeft
      }
      requestAnimationFrame(() => {
        isSyncingFromTable.current = false
      })
    }

    const handleFloatingScroll = () => {
      if (isSyncingFromTable.current) return
      isSyncingFromFloating.current = true
      tableWrap.scrollLeft = floatingBarRef.current?.scrollLeft ?? 0
      requestAnimationFrame(() => {
        isSyncingFromFloating.current = false
      })
    }

    // Wheel listener on floating bar to convert vertical wheel to horizontal scroll
    const handleFloatingWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault()
        if (floatingBarRef.current) {
          floatingBarRef.current.scrollLeft += e.deltaY
        }
      }
    }

    // Attach listeners
    window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    tableWrap.addEventListener('scroll', handleTableScroll, { passive: true })

    const floatingEl = floatingBarRef.current
    if (floatingEl) {
      floatingEl.addEventListener('scroll', handleFloatingScroll, { passive: true })
      floatingEl.addEventListener('wheel', handleFloatingWheel, { passive: false })
    }

    // Observers
    const resizeObserver = new ResizeObserver(() => scheduleUpdate())
    resizeObserver.observe(tableWrap)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    const mutationObserver = new MutationObserver(() => scheduleUpdate())
    mutationObserver.observe(tableWrap, { childList: true, subtree: true })

    // Initial check
    updateCoords()
    const timer = setTimeout(updateCoords, 100)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      clearTimeout(timer)
      window.removeEventListener('scroll', scheduleUpdate, { capture: true })
      window.removeEventListener('resize', scheduleUpdate)
      tableWrap.removeEventListener('scroll', handleTableScroll)
      if (floatingEl) {
        floatingEl.removeEventListener('scroll', handleFloatingScroll)
        floatingEl.removeEventListener('wheel', handleFloatingWheel)
      }
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [mounted])

  // Synchronize listeners if floatingBarRef mounts after initial effect
  useEffect(() => {
    if (!mounted || !floatingBarRef.current || !containerRef.current) return
    const tableWrap =
      (containerRef.current.querySelector('.pouf-table__wrap') as HTMLElement | null) ??
      containerRef.current

    const floatingEl = floatingBarRef.current

    const handleFloatingScroll = () => {
      if (isSyncingFromTable.current) return
      isSyncingFromFloating.current = true
      tableWrap.scrollLeft = floatingEl.scrollLeft
      requestAnimationFrame(() => {
        isSyncingFromFloating.current = false
      })
    }

    const handleFloatingWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault()
        floatingEl.scrollLeft += e.deltaY
      }
    }

    floatingEl.addEventListener('scroll', handleFloatingScroll, { passive: true })
    floatingEl.addEventListener('wheel', handleFloatingWheel, { passive: false })

    // Sync initial scrollLeft
    floatingEl.scrollLeft = tableWrap.scrollLeft

    return () => {
      floatingEl.removeEventListener('scroll', handleFloatingScroll)
      floatingEl.removeEventListener('wheel', handleFloatingWheel)
    }
  }, [mounted])

  return (
    <div ref={containerRef} className={cx('relative w-full', className)}>
      {children}

      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={floatingBarRef}
            className={cx(
              'fixed z-40 transition-opacity duration-200 select-none cursor-pointer',
              'bg-surface/95 backdrop-blur-md border-t-2 border-[rgba(201,168,255,0.45)] shadow-[0_-6px_20px_rgba(0,0,0,0.12)]',
              'rounded-t-xl overflow-x-auto overflow-y-hidden px-1',
              '[scrollbar-width:auto] [scrollbar-color:var(--color-purple)_rgba(0,0,0,0.04)]',
              '[&::-webkit-scrollbar]:h-3.5',
              '[&::-webkit-scrollbar-track]:bg-black/[0.04] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:my-0.5',
              '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-purple)]/65 hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-purple)]/95 active:[&::-webkit-scrollbar-thumb]:bg-[var(--color-purple)]',
              '[&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-surface',
              coords.isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            style={{
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              bottom: `${coords.bottom}px`,
              height: '22px',
            }}
            title="Scroll horizontal tabel (geser atau gunakan roda mouse)"
            aria-hidden={!coords.isVisible}
          >
            <div style={{ width: `${coords.scrollWidth}px`, height: '1px' }} />
          </div>,
          document.body
        )}
    </div>
  )
}
