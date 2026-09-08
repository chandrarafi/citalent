import type { ReactNode } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Shell, Sidebar, Row, Stack } from '@/components/pouf/layout'
import { NavLink } from '@/components/pouf/NavLink'
import { BottomNav, type NavItem } from '@/components/pouf/BottomNav'
import { Heading, Text } from '@/components/pouf/text'
import { Blob } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
import { Card } from '@/components/pouf/surface'
import { Toaster } from '@/components/pouf/toaster'
import type { Tone } from '@/components/pouf/tone'
import type { IconLike } from '@/components/pouf/Icon'

interface SharedMenu {
  id: number
  name: string
  href: string
  label: string
  icon: string
  tone: string
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
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const menus: SharedMenu[] = auth?.menus ?? []

  const navItems: NavItem[] = menus.map((m) => ({
    href: m.href,
    label: m.label,
    icon: (m.icon || 'overview') as IconLike,
    tone: (m.tone || 'purple') as Tone,
  }))

  if (auth?.user?.role?.name === 'kandidat' && navItems.length === 0) {
    navItems.push(
      { href: '/kandidat/lowongan', label: 'Lowongan Kerja', icon: 'target', tone: 'purple' },
      { href: '/kandidat/profil', label: 'Profil Biodata', icon: 'users', tone: 'mint' },
      { href: '/kandidat/lamaran', label: 'Riwayat Lamaran', icon: 'log', tone: 'blue' },
    )
  }

  function logout() {
    router.post('/logout')
  }

  return (
    <>
      <Shell>
        <Sidebar mobile="hide">
          <Card variant="tight">
            <Stack gap={4}>
              {/* Brand / User */}
              <Row gap={2} wrap={false} align="center">
                <Blob icon="user" tone="purple" size="sm" />
                <Stack gap={1}>
                  <Heading level={3}>CITALENT</Heading>
                  {auth?.user && (
                    <Text size="sm" muted truncate>
                      {auth.user.role?.label ?? auth.user.name}
                    </Text>
                  )}
                </Stack>
              </Row>

              <div className="h-[2px] bg-[var(--purple)] opacity-10 my-0.5" />

              {/* Navigation */}
              <div className="flex flex-col gap-(--s2)">
                {navItems.map((item) => (
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

              {/* Logout */}
              <div style={{ paddingTop: 8 }}>
                <Button variant="quiet" block onClick={logout}>
                  Keluar
                </Button>
              </div>
            </Stack>
          </Card>
        </Sidebar>

        {/* Main content */}
        <main className="min-w-0 w-full flex flex-col gap-5">
          {/* Mobile Top Bar (visible only below 1024px) */}
          <div className="flex lg:hidden items-center justify-between w-full pb-1">
            <Row gap={2} wrap={false} align="center">
              <Blob icon="user" tone="purple" size="sm" />
              <Stack gap={1}>
                <Heading level={3}>CITALENT</Heading>
                {auth?.user && (
                  <Text size="sm" muted truncate>
                    {auth.user.role?.label ?? auth.user.name}
                  </Text>
                )}
              </Stack>
            </Row>
            <Button size="sm" variant="quiet" onClick={logout}>
              Keluar
            </Button>
          </div>

          {children}
        </main>
      </Shell>

      {/* Mobile bottom nav (icon-only mode) */}
      {navItems.length > 0 && (
        <BottomNav
          primary={navItems.length <= 5 ? navItems : navItems.slice(0, 4)}
          groups={[{ title: 'Menu', items: navItems }]}
          currentPath={currentPath}
          link={InertiaLink}
        />
      )}

      <Toaster />
    </>
  )
}
