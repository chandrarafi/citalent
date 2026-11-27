import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import lottie from 'lottie-web'

interface WelcomeIntroOverlayProps {
  open: boolean
  userName?: string
  onComplete: () => void
}

const MAIN_EASE: [number, number, number, number] = [0.165, 0.84, 0.44, 1]
const CURTAIN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function WelcomeIntroOverlay({
  open,
  userName,
  onComplete,
}: WelcomeIntroOverlayProps) {
  const lottieContainerRef = useRef<HTMLDivElement | null>(null)
  const completedRef = useRef(false)

  const finishOnce = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }

  useEffect(() => {
    if (!open) {
      completedRef.current = false
      return
    }

    const container = lottieContainerRef.current
    if (!container) return

    let anim: ReturnType<typeof lottie.loadAnimation> | null = null
    let holdTimer: ReturnType<typeof setTimeout> | null = null

    const safetyTimer = setTimeout(() => {
      finishOnce()
    }, 3400)

    anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/animations/hallo.json',
    })

    anim.addEventListener('complete', () => {
      holdTimer = setTimeout(() => {
        finishOnce()
      }, 350)
    })

    anim.addEventListener('data_failed', () => {
      holdTimer = setTimeout(() => {
        finishOnce()
      }, 1600)
    })

    return () => {
      clearTimeout(safetyTimer)
      if (holdTimer) clearTimeout(holdTimer)
      if (anim) {
        anim.destroy()
      }
    }
  }, [open])

  const firstName = (userName || 'Kandidat').trim().split(/\s+/)[0]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="candidate-welcome-curtain"
          initial={{ y: '0%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: CURTAIN_EASE }}
          className="fixed inset-0 z-[100] bg-white text-[#11110F] flex flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 overflow-hidden select-none"
        >
          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: MAIN_EASE }}
            className="flex items-center justify-center sm:justify-between w-full max-w-6xl mx-auto"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-['Instrument_Sans',system-ui,sans-serif] font-semibold text-xl sm:text-2xl tracking-[-0.04em]">
                CITALENT
              </span>
              <span className="hidden sm:inline-block font-['Instrument_Sans',system-ui,sans-serif] text-xs font-medium tracking-[-0.02em] text-[#11110F]/50">
                • Portal Kandidat
              </span>
            </div>
          </motion.div>

          {/* Center Kinetic Reveal + Lottie */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.08, ease: MAIN_EASE }}
            >
              <span className="inline-block bg-[var(--color-purple,#90CAF9)] text-[var(--color-ink,#3a2e5c)] font-['Instrument_Sans',system-ui,sans-serif] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-sm">
                Selamat Datang
              </span>
            </motion.div>

            {/* Masked Split-Line Typography */}
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="overflow-hidden py-1">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.6, delay: 0.14, ease: MAIN_EASE }}
                  className="font-['Instrument_Sans',system-ui,sans-serif] font-semibold tracking-[-0.045em] leading-[0.98] text-[clamp(2.5rem,7.5vw,5.75rem)] text-[#11110F]"
                >
                  Halo, {firstName}.
                </motion.h1>
              </div>

              <div className="overflow-hidden py-1">
                <motion.p
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.6, delay: 0.24, ease: MAIN_EASE }}
                  className="font-['Instrument_Sans',system-ui,sans-serif] font-medium tracking-[-0.03em] leading-[1.15] text-[clamp(1.1rem,2.4vw,1.75rem)] text-[#11110F]/70"
                >
                  Siap temukan peluang karir terbaikmu hari ini?
                </motion.p>
              </div>
            </div>

            {/* Lottie Animation Container */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.28, ease: MAIN_EASE }}
              className="w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center"
            >
              <div ref={lottieContainerRef} className="w-full h-full" />
            </motion.div>
          </div>

          {/* Bottom Bar + Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="w-full max-w-6xl mx-auto flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-xs text-[#11110F]/55 font-medium tracking-[-0.02em]">
              <span>PT Menara Agung • Rekrutmen & Talenta</span>
              <span>Memuat portal kandidat...</span>
            </div>
            <div className="w-full h-1 bg-[#11110F]/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.35, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
                className="h-full w-full bg-[var(--color-purple,#90CAF9)]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
