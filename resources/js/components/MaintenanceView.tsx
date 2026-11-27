import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import lottie from 'lottie-web'
import { IconTool } from '@tabler/icons-react'

const MAIN_EASE: [number, number, number, number] = [0.165, 0.84, 0.44, 1]

export default function MaintenanceView() {
  const lottieRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = lottieRef.current
    if (!container) return

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/animations/sad.json',
    })

    return () => {
      anim.destroy()
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#D4F6FF] text-[#3a2e5c] flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-10 select-none font-['Instrument_Sans','Nunito',system-ui,sans-serif]">
      {/* Animated Ambient Pastel Blobs */}
      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, 36, -16, 0],
          y: [0, -28, 22, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#90CAF9]/45 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, -32, 20, 0],
          y: [0, 26, -20, 0],
          scale: [1, 0.94, 1.08, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#ffb3d1]/35 blur-3xl"
      />

      {/* Top Brand */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: MAIN_EASE }}
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center sm:justify-start"
      >
        <span className="font-bold text-xl sm:text-2xl tracking-[-0.04em] text-[#3a2e5c]">
          CITALENT
        </span>
      </motion.div>

      {/* Full-screen Center Content (No Card, No Button) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center gap-6 sm:gap-7 py-6">
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: MAIN_EASE }}
          className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#90CAF9]/70 px-4 py-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#3a2e5c]"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb38a] opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff8c5a]" />
          </span>
          <IconTool size={15} className="shrink-0" />
          <span>503 • Server Maintenance</span>
        </motion.div>

        {/* Larger Lottie sad.json Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.14, ease: MAIN_EASE }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center"
          >
            <div ref={lottieRef} className="w-full h-full" />
          </motion.div>
        </motion.div>

        {/* Larger Masked Headline & Description */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="overflow-hidden py-1">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.55, delay: 0.2, ease: MAIN_EASE }}
              className="font-bold tracking-[-0.045em] leading-[1.02] text-[clamp(2.25rem,6vw,4.75rem)] text-[#3a2e5c]"
            >
              Server Sedang Maintenance
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: MAIN_EASE }}
            className="text-base sm:text-xl text-[#71609b] leading-relaxed max-w-2xl font-medium"
          >
            Kami sedang melakukan pemeliharaan dan peningkatan sistem CITALENT agar layanan kembali lebih cepat dan stabil. Mohon tunggu beberapa saat ya.
          </motion.p>
        </div>

        {/* Animated Progress Strip */}
        <div className="w-full max-w-sm h-2 rounded-full bg-white/70 border border-[#90CAF9]/40 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#90CAF9] via-[#6cb9f7] to-[#90CAF9]"
          />
        </div>
      </div>

      {/* Bottom Brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="relative z-10 w-full max-w-6xl mx-auto text-center text-xs sm:text-sm font-medium text-[#71609b]"
      >
        PT Menara Agung • Rekrutmen & Talenta
      </motion.div>
    </div>
  )
}
