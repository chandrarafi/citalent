import type { ReactNode } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Shell, Sidebar, Row, Stack } from '@/components/pouf/layout'
import { NavLink } from '@/components/pouf/NavLink'
import { BottomNav, type NavItem } from '@/components/pouf/BottomNav'
import { Heading, Text } from '@/components/pouf/text'
import { Blob } from '@/components/pouf/media'
import { Button } from '@/components/pouf/Button'
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
}: {
  href: string
  className?: string
  'aria-current'?: 'page'
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className={className}
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
  const currentPath = window.location.pathname

  const menus: SharedMenu[] = auth?.menus ?? []

  const navItems: NavItem[] = menus.map((m) => ({
    href: m.href,
    label: m.label,
    icon: (m.icon || 'overview') as IconLike,
    tone: (m.tone || 'purple') as Tone,
  }))

  function logout() {
    router.post('/logout')
  }

  return (
    <>
      <Shell>
        <Sidebar mobile="hide">
          {/* Brand / User */}
          <Row gap={2} wrap={false} align="center">
            <Blob icon="user" tone="purple" size="sm" />
            <Stack gap={1}>
              <Heading level={3}>Citalent</Heading>
              {auth?.user && (
                <Text size="sm" muted truncate>
                  {auth.user.role?.label ?? auth.user.name}
                </Text>
              )}
            </Stack>
          </Row>

          {/* Navigation */}
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              currentPath={currentPath}
              icon={item.icon}
              tone={item.tone}
              link={InertiaLink}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Logout */}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <Button variant="quiet" block onClick={logout}>
              Keluar
            </Button>
          </div>
        </Sidebar>

        {/* Main content */}
        {children}
      </Shell>

      {/* Mobile bottom nav */}
      {navItems.length > 0 && (
        <BottomNav
          primary={navItems.slice(0, 4)}
          groups={[{ title: 'Menu', items: navItems }]}
          currentPath={currentPath}
          link={InertiaLink}
        />
      )}
    </>
  )
}
