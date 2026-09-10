import { useState, useMemo, type ReactNode } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Shell, Sidebar, Row, Stack } from '@/components/pouf/layout'
import { NavLink } from '@/components/pouf/NavLink'
import { BottomNav, type NavItem } from '@/components/pouf/BottomNav'
import { Heading, Text } from '@/components/pouf/text'
import { Blob, Badge } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
import { Card } from '@/components/pouf/surface'
import { Dialog } from '@/components/pouf/controls'
import { Toaster } from '@/components/pouf/toaster'
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
    role?: { id: number; name: string; label: string } | null
  } | null
  menus: SharedMenu[]
  permissions: string[]
}

interface AppLayoutProps {
  children: ReactNode
}

// Inertia Link compatible with NavLink's LinkComponent type
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

export function AppLayout({ children }: AppLayoutProps) {
  const { auth } = usePage<{ auth: SharedAuth }>().props
  const { url } = usePage()
  const currentPath = (url || '').split('?')[0]
  const menus: SharedMenu[] = auth?.menus ?? []

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const navItems: AppNavItem[] = menus.map((m) => ({
    href: m.href,
    label: m.label,
    kelompok: m.kelompok || 'Menu Utama',
    icon: (m.icon || 'overview') as IconLike,
    tone: (m.tone || 'purple') as Tone,
  }))

  if (auth?.user?.role?.name === 'kandidat' && navItems.length === 0) {
    navItems.push(
      { href: '/kandidat/lowongan', label: 'Lowongan Kerja', icon: 'target', tone: 'purple', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/profil', label: 'Profil Biodata', icon: 'users', tone: 'mint', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/lamaran', label: 'Riwayat Lamaran', icon: 'log', tone: 'blue', kelompok: 'Portal Kandidat' },
      { href: '/kandidat/survey', label: 'Survey Kepuasan', icon: 'star', tone: 'yellow', kelompok: 'Portal Kandidat' },
    )
  }

  // Group menus by kelompok
  const groupedNavItems = useMemo(() => {
    const groups: Record<string, AppNavItem[]> = {}
    for (const item of navItems) {
      const g = item.kelompok || 'Menu Utama'
      if (!groups[g]) {
        groups[g] = []
      }
      groups[g].push(item)
    }
    return groups
  }, [navItems])

  function logout() {
    router.post('/logout')
  }

  return (
    <>
      <Shell>
        <Sidebar mobile="hide">
          <Card variant="tight" className="max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="flex flex-col h-full min-h-0 gap-4">
              {/* Brand Header - Fixed */}
              <div className="shrink-0">
                <Row gap={2} wrap={false} align="center">
                  <Stack gap={1}>
                    <Heading level={3} className="text-center">CITALENT</Heading>
                    <Text size="sm" muted className="text-center text-xs">
                      HR & Rekrutmen
                    </Text>
                  </Stack>
                </Row>
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

              {/* User Info & Logout - Fixed Footer */}
              <div className="shrink-0 pt-3 border-t border-[var(--color-line,#0000000d)] flex flex-col gap-2.5">
                {auth?.user && (
                  <div className="p-2.5 rounded-2xl bg-black/[0.03] border border-[var(--color-line,#0000000d)] shadow-2xs">
                    <Row gap={3} align="center" wrap={false}>
                      <div className="w-9 h-9 rounded-full bg-[var(--color-purple)]/20 text-[var(--color-ink)] border border-[var(--color-purple)]/40 flex items-center justify-center shrink-0 font-bold text-sm">
                        {auth.user.name.charAt(0).toUpperCase()}
                      </div>
                      <Stack gap={1} className="min-w-0 flex-1">
                        <Text size="sm" className="truncate font-semibold leading-tight">
                          {auth.user.name}
                        </Text>
                        <Text size="sm" muted truncate className="leading-tight mt-0.5 text-xs">
                          {auth.user.role?.label ?? auth.user.email}
                        </Text>
                      </Stack>
                    </Row>
                  </div>
                )}

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
          <div className="flex lg:hidden items-center justify-between w-full pb-1">
            <Row gap={2} wrap={false} align="center">
              <Blob icon="target" tone="purple" size="sm" />
              <Stack gap={1}>
                <Heading level={3}>CITALENT</Heading>
                {auth?.user && (
                  <Text size="sm" muted truncate>
                    {auth.user.role?.label ?? auth.user.name}
                  </Text>
                )}
              </Stack>
            </Row>
            <Button size="sm" variant="quiet" tone="pink" onClick={() => setLogoutDialogOpen(true)}>
              Keluar
            </Button>
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
          {auth?.user && (
            <Card variant="tight">
              <Row gap={3} align="center" wrap={false}>
                <div className="w-11 h-11 rounded-full bg-[var(--color-purple)]/20 text-[var(--color-ink)] border border-[var(--color-purple)]/40 flex items-center justify-center shrink-0 font-bold text-base">
                  {auth.user.name.charAt(0).toUpperCase()}
                </div>
                <Stack gap={1} className="min-w-0 flex-1">
                  <Text className="truncate"><strong>{auth.user.name}</strong></Text>
                  <Text size="sm" muted truncate>{auth.user.email}</Text>
                  {auth.user.role?.label && (
                    <div className="mt-1">
                      <Badge tone="purple">{auth.user.role.label}</Badge>
                    </div>
                  )}
                </Stack>
              </Row>
            </Card>
          )}

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
    </>
  )
}
