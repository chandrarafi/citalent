import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  maxWidth?: string
}

export default function AuthLayout({
  children,
  maxWidth = 'max-w-[440px]',
}: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-3 sm:p-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/assets/images/backgroud_auth.jpg')",
      }}
    >
      {/* Dark overlay with subtle backdrop blur for visual clarity */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      {/* Auth Content Container */}
      <div className={`relative z-10 w-full ${maxWidth} my-auto drop-shadow-xl`}>
        {children}
      </div>
    </div>
  )
}
