import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Shell, Sidebar, Row, Stack } from '@/components/pouf/layout'
import { NavLink } from '@/components/pouf/NavLink'
import { BottomNav, type NavItem } from '@/components/pouf/BottomNav'
import { Heading, Text } from '@/components/pouf/text'
import { Blob } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
import { Card } from '@/components/pouf/surface'
import { Dialog } from '@/components/pouf/controls'
import { Toaster } from '@/components/pouf/toaster'
import WelcomeIntroOverlay from '@/components/kandidat/WelcomeIntroOverlay'
import CandidatePageLoader, {
  markPathVisited,
  preloadLoadingAnimation,
  resetVisitedPaths,
  setWelcomeLoaderBlocked,
  useCandidatePageLoader,
} from '@/components/kandidat/CandidatePageLoader'
import type { Tone } from '@/components/pouf/tone'
import type { IconLike } from '@/components/pouf/Icon'
import { IconLogout } from '@tabler/icons-react'

interface SharedMenu {
  id: number
  name: string
  href: string
  label: string
  kelompok?: string | null
  icon: string
  tone: string
}

interface AppNavItem extends NavItem {
  kelompok?: string | null
}

interface SharedAuth {
  user: {
    id: number
    name: string
    email: string
    foto_url?: string | null
    role?: { id: number; name: string; label: string } | null
  } | null
  menus: SharedMenu[]
  permissions: string[]
}

interface CandidateAvatarProps {
  name: string
  fotoUrl?: string | null
  sizeClass?: string
  textSizeClass?: string
}

function CandidateAvatar({
  name,
  fotoUrl,
  sizeClass = 'w-9 h-9',
  textSizeClass = 'text-sm',
}: CandidateAvatarProps) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [fotoUrl])

  if (fotoUrl && !imgError) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden border border-[var(--color-purple)]/40 bg-black/5 shrink-0 shadow-2xs`}
      >
        <img
          src={fotoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[var(--color-purple)]/20 text-[var(--color-ink)] border border-[var(--color-purple)]/40 flex items-center justify-center shrink-0 font-bold ${textSizeClass}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

interface KandidatLayoutProps {
  children: ReactNode
  wide?: boolean
}

function InertiaLink({
  href,
  className,
  'aria-current': ariaCurrent,
  children,
  title,
}: {
  href: string
  className?: string
  'aria-current'?: 'page'
  children: ReactNode
  title?: string
}) {
  return (
    <a
      href={href}
      className={className}
      title={title}
      aria-current={ariaCurrent}
      onClick={(e) => {
        e.preventDefault()
        router.visit(href)
      }}
    >
      {children}
    </a>
  )
}

export function KandidatLayout({ children, wide = false }: KandidatLayoutProps) {
  const { auth, flash } = usePage<{
    auth: SharedAuth
    flash?: { welcome_animation?: boolean }
  }>().props
  const { url } = usePage()
  const currentPath = (url || '').split('?')[0]
  const menus: SharedMenu[] = auth?.menus ?? []

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => Boolean(flash?.welcome_animation))
  const isNavigating = useCandidatePageLoader()

  useEffect(() => {
    setWelcomeLoaderBlocked(showWelcome)
  }, [showWelcome])

  useEffect(() => {
    if (flash?.welcome_animation) {
      resetVisitedPaths()
      setShowWelcome(true)
    }
    markPathVisited(currentPath)
  }, [flash?.welcome_animation, currentPath])

  useEffect(() => {
    void preloadLoadingAnimation()
  }, [])

  const navItems: AppNavItem[] = menus.map((m) => ({
    href: m.href,
    label: m.label,
    kelompok: m.kelompok || 'Portal Kandidat',
    icon: (m.icon || 'overview') as IconLike,
    tone: (m.tone || 'purple') as Tone,
  }))

  if (navItems.length === 0) {
    navItems.push(
      { href: '/kandidat/lowongan', label: 'Lowongan Kerja', icon: 'target', tone: 'purple', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/profil', label: 'Profil Biodata', icon: 'users', tone: 'mint', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/lamaran', label: 'Riwayat Lamaran', icon: 'log', tone: 'blue', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/survey', label: 'Survey Kepuasan', icon: 'star', tone: 'yellow', kelompok: 'Portal Kandidat' },
    )
  }

  const groupedNavItems = useMemo(() => {
    const groups: Record<string, AppNavItem[]> = {}
    navItems.forEach((item) => {
      const group = item.kelompok || 'Portal Kandidat'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
    })
    return groups
  }, [navItems])

  function logout() {
    router.post('/logout')
  }

  return (
    <>
      <Shell wide={wide}>
        <Sidebar mobile="hide">
          <Card variant="tight" className="max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="flex flex-col h-full min-h-0 gap-4">
              {/* Brand Header & Candidate Photo - Fixed */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <Stack gap={1} className="items-center">
                  <Heading level={3} className="text-center">CITALENT</Heading>
                  <Text size="sm" muted className="text-center text-xs">
                    Portal Kandidat
                  </Text>
                </Stack>

                {auth?.user && (
                  <a
                    href="/kandidat/profil"
                    onClick={(e) => {
                      e.preventDefault()
                      router.visit('/kandidat/profil')
                    }}
                    title="Profil Biodata"
                    className="flex flex-col items-center gap-2 group w-full px-2"
                  >
                    <div className="rounded-full transition-transform group-hover:scale-105">
                      <CandidateAvatar
                        name={auth.user.name}
                        fotoUrl={auth.user.foto_url}
                        sizeClass="w-28 h-28 border-2 border-white shadow-md"
                        textSizeClass="text-3xl"
                      />
                    </div>
                    <Text className="text-base font-bold text-center truncate w-full leading-tight">
                      {auth.user.name}
                    </Text>
                  </a>
                )}
              </div>

              <div className="h-[2px] bg-[var(--purple)] opacity-10 my-0.5 shrink-0" />

              {/* Navigation - Grouped Independent Scrolling */}
              <div className="flex flex-col gap-3.5 overflow-y-auto min-h-0 flex-1 pr-1 overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--color-purple)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-purple)]/40 hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-purple)]">
                {Object.entries(groupedNavItems).map(([groupTitle, items]) => (
                  <div key={groupTitle} className="flex flex-col gap-1.5">
                    {Object.keys(groupedNavItems).length > 1 && (
                      <div className="px-2 pt-1 pb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted/80 select-none block">
                          {groupTitle}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      {items.map((item) => (
                        <NavLink
                          key={item.href}
                          href={item.href}
                          currentPath={currentPath}
                          icon={item.icon}
                          tone={item.tone}
                          title={item.label}
                          link={InertiaLink}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Logout - Fixed Footer */}
              <div className="shrink-0 pt-3 border-t border-[var(--color-line,#0000000d)] flex flex-col gap-2.5">
                <Button
                  tone="pink"
                  block
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <Row gap={2} align="center" justify="center" wrap={false}>
                    <IconLogout size={16} />
                    <span>Keluar</span>
                  </Row>
                </Button>
              </div>
            </div>
          </Card>
        </Sidebar>

        {/* Main content */}
        <main className="min-w-0 w-full flex flex-col gap-5">
          {/* Mobile Top Bar (visible only below 1024px) */}
          <div className="block lg:hidden w-full">
            <Card variant="tight">
              <Row justify="between" align="center" wrap={false} gap={3}>
                <Row gap={3} wrap={false} align="center" className="min-w-0 flex-1">
                  {auth?.user ? (
                    <a
                      href="/kandidat/profil"
                      onClick={(e) => {
                        e.preventDefault()
                        router.visit('/kandidat/profil')
                      }}
                      title="Profil Biodata"
                      className="shrink-0"
                    >
                      <CandidateAvatar
                        name={auth.user.name}
                        fotoUrl={auth.user.foto_url}
                        sizeClass="w-10 h-10 border border-white shadow-xs"
                        textSizeClass="text-sm"
                      />
                    </a>
                  ) : (
                    <Blob icon="target" tone="purple" size="sm" />
                  )}
                  <Stack gap={1} className="min-w-0 flex-1">
                    <Heading level={3}>CITALENT</Heading>
                    {auth?.user && (
                      <Text size="sm" muted truncate>
                        {auth.user.name}
                      </Text>
                    )}
                  </Stack>
                </Row>

                <Button
                  size="sm"
                  tone="pink"
                  label="Keluar"
                  title="Keluar"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <IconLogout size={18} />
                </Button>
              </Row>
            </Card>
          </div>

          {children}
        </main>
      </Shell>

      {/* Mobile bottom nav */}
      {navItems.length > 0 && (
        <BottomNav
          primary={navItems.length <= 5 ? navItems : navItems.slice(0, 4)}
          groups={Object.entries(groupedNavItems).map(([title, items]) => ({
            title,
            items,
          }))}
          currentPath={currentPath}
          link={InertiaLink}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sistem CITALENT?"
      >
        <Stack gap={4}>
          <Text size="sm" muted>
            Sesi akun Anda akan diakhiri dan Anda perlu memasukkan kredensial login kembali untuk mengakses aplikasi.
          </Text>

          <Row justify="end" gap={2}>
            <Button variant="quiet" onClick={() => setLogoutDialogOpen(false)}>
              Batal
            </Button>
            <Button tone="pink" onClick={logout}>
              Ya, Keluar
            </Button>
          </Row>
        </Stack>
      </Dialog>

      <Toaster />

      <CandidatePageLoader open={isNavigating && !showWelcome} />

      <WelcomeIntroOverlay
        open={showWelcome}
        userName={auth?.user?.name}
        onComplete={() => setShowWelcome(false)}
      />
    </>
  )
}
