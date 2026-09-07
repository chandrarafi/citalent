import { cva, cx } from 'class-variance-authority'
import type { ReactNode } from 'react'

/** Layout primitives exist so a screen never writes `display:flex` itself.
 * Without them the first screen that needs a gap reaches for an inline style,
 * and spacing silently escapes the design system. */

type Gap = 1 | 2 | 3 | 4 | 5 | 6

/* The --gap indirection is kept from the original: children may not read it,
 * but emitting the same custom property keeps the computed-style contract
 * byte-identical, and it remains the single knob a wrapper can retune. */
const gapVariant = {
  1: '[--gap:var(--s1)] gap-[var(--gap,var(--s4))]',
  2: '[--gap:var(--s2)] gap-[var(--gap,var(--s4))]',
  3: '[--gap:var(--s3)] gap-[var(--gap,var(--s4))]',
  4: '[--gap:var(--s4)] gap-[var(--gap,var(--s4))]',
  5: '[--gap:var(--s5)] gap-[var(--gap,var(--s4))]',
  6: '[--gap:var(--s6)] gap-[var(--gap,var(--s4))]',
} as const

/* min-width: 0 on BOTH layout primitives, everywhere.
 *
 * A flex item defaults to `min-width: auto` — "never shrink below my content" —
 * and that default cascades: `<Text truncate>` can only ellipsis if EVERY
 * ancestor between it and the sized container is allowed to shrink. One Stack
 * without this and a long title (some run 200 characters of Persian)
 * drags the whole row wider than the dialog, producing a horizontal scrollbar
 * and pushing content off-screen.
 *
 * Set on the primitives rather than at call sites, because "remember min-width:0
 * on every wrapper" is exactly the kind of rule that gets forgotten once and
 * then looks like a mysterious layout bug. */

const stack = cva('pouf-stack flex flex-col min-w-0 w-full', {
  variants: { gap: gapVariant },
  defaultVariants: { gap: 4 },
})

interface StackProps {
  children: ReactNode
  gap?: Gap
  className?: string
}

export function Stack({ children, gap, className }: StackProps) {
  return <div className={cx(stack({ gap }), className)}>{children}</div>
}

const row = cva('pouf-row flex flex-row min-w-0', {
  variants: {
    gap: gapVariant,
    align: { center: 'items-center', top: 'items-start', stretch: 'items-stretch' },
    justify: { start: '', center: 'justify-center', between: 'justify-between', end: 'justify-end' },
    wrap: { true: 'flex-wrap', false: 'flex-nowrap' },
  },
  defaultVariants: { gap: 4, align: 'center', justify: 'start', wrap: true },
})

interface RowProps {
  children: ReactNode
  gap?: Gap
  align?: 'center' | 'top' | 'stretch'
  justify?: 'start' | 'center' | 'between' | 'end'
  wrap?: boolean
  className?: string
}

export function Row({ children, gap, align, justify, wrap, className }: RowProps) {
  return <div className={cx(row({ gap, align, justify, wrap }), className)}>{children}</div>
}

export function Spacer() {
  return <div className="pouf-spacer flex-auto min-w-0" />
}

/* Column counts are variants, not a --cols override, so a screen never needs an
 * inline style to lay out. Breakpoints adapt smoothly from mobile to widescreen. */
const grid = cva('pouf-grid grid w-full min-w-0', {
  variants: {
    cols: {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      sidebar:
        'grid-cols-1 lg:[grid-template-columns:minmax(0,2fr)_minmax(0,1fr)]',
    },
    gap: gapVariant,
  },
  defaultVariants: { cols: 2, gap: 4 },
})

interface GridProps {
  children: ReactNode
  cols?: 2 | 3 | 4 | 'sidebar'
  gap?: Gap
  className?: string
}

export function Grid({ children, cols, gap, className }: GridProps) {
  return <div className={cx(grid({ cols, gap }), className)}>{children}</div>
}

export function Shell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'pouf-shell grid [grid-template-columns:260px_minmax(0,1fr)] gap-(--s5) lg:gap-(--s6) p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-screen [align-items:start]',
        'max-[1024px]:[grid-template-columns:minmax(0,1fr)] max-[1024px]:p-4',
        'max-[1024px]:pb-[calc(96px+env(safe-area-inset-bottom,0px))]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Sidebar({
  children,
  mobile = 'show',
  className,
}: {
  children: ReactNode
  /** Hide desktop sidebar chrome when the screen supplies BottomNav on phones. */
  mobile?: 'show' | 'hide'
  className?: string
}) {
  return (
    <aside
      className={cx(
        'pouf-sidebar sticky top-4 lg:top-(--s8) flex flex-col gap-(--s3)',
        mobile === 'hide' ? 'max-[1024px]:hidden' : 'max-[1024px]:static',
        className,
      )}
    >
      {children}
    </aside>
  )
}
