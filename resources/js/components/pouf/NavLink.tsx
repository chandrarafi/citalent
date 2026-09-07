import clsx from 'clsx'
import type { ReactElement, ReactNode } from 'react'
import { toneClass, type Tone } from './tone'
import { renderIcon, type IconLike } from './Icon'

export type LinkComponent = (props: {
  href: string
  className?: string
  'aria-current'?: 'page'
  title?: string
  children: ReactNode
}) => ReactElement

const Anchor: LinkComponent = (props) => <a {...props} />

/** True when `href` is the active route. Exact for '/', prefix elsewhere so
 *  nested paths keep their tab lit. */
export function isActivePath(href: string, currentPath: string): boolean {
  return href === '/'
    ? currentPath === '/'
    : currentPath === href || currentPath.startsWith(`${href}/`)
}

interface NavLinkProps {
  href: string
  /** The app's current pathname — pouf has no router; the host app does. */
  currentPath: string
  children: ReactNode
  icon: IconLike
  tone?: Tone
  title?: string
  className?: string
  /** Swap in your router's Link (must forward href/className/children). */
  link?: LinkComponent
}

export function NavLink({
  href,
  currentPath,
  children,
  icon,
  tone = 'purple',
  title,
  className,
  link: Link = Anchor,
}: NavLinkProps) {
  const active = isActivePath(href, currentPath)
  const labelText = typeof children === 'string' ? children : undefined

  return (
    <Link
      href={href}
      title={title || labelText}
      className={clsx(
        'pouf-navlink',
        active && 'pouf-navlink--active',
        active && toneClass(tone),
        className,
      )}
      aria-current={active ? 'page' : undefined}
    >
      {renderIcon(icon, 'md')}
      <span className="truncate">{children}</span>
    </Link>
  )
}
