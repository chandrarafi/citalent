import { cva, cx } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { toneClass, type Tone } from './tone'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3
  className?: string
  display?: boolean
}

const heading = cva('font-black [text-wrap:balance]', {
  variants: {
    level: {
      1: 'pouf-h1 font-display text-[clamp(1.75rem,3.2vw+0.6rem,2.75rem)] tracking-[-0.03em] leading-[1.1]',
      2: 'pouf-h2 font-display text-[clamp(1.25rem,2vw+0.4rem,1.75rem)] tracking-[-0.02em] leading-[1.2]',
      /* h1/h2 set 1.1/1.2; without this h3 inherits the body's 1.5 and its line
         box towers over the 44px blob it commonly sits beside. */
      3: 'pouf-h3 text-[clamp(1.05rem,1.2vw+0.3rem,1.25rem)] tracking-[-0.01em] leading-[1.25]',
    },
  },
  defaultVariants: { level: 2 },
})

export function Heading({ children, level = 2, className, display }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag className={cx(heading({ level }), display && 'font-display', className)}>
      {children}
    </Tag>
  )
}

/** The reference's yellow highlight-swatch behind a word. */
export function Highlight({ children, tone = 'yellow', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cx(
        'pouf-highlight inline-block px-[14px] rounded-control text-[var(--on-accent)] bg-[var(--tone,var(--yellow))]',
        '[box-shadow:inset_0_-6px_0_rgba(0,0,0,0.08)]',
        toneClass(tone),
        className,
      )}
    >
      {children}
    </span>
  )
}

/** The reference's compact uppercase section eyebrow. The muted token clears
 * AA contrast on both the page background and white surfaces. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('pouf-eyebrow text-[clamp(11px,0.8vw+8px,13px)] tracking-[2px] uppercase font-extrabold text-muted', className)}>
      {children}
    </div>
  )
}

interface TextProps {
  children: ReactNode
  size?: 'sm' | 'md'
  muted?: boolean
  /** Tabular numerals — use for any figure in a column that must align. */
  num?: boolean
  mono?: boolean
  truncate?: boolean
  className?: string
}

const text = cva('pouf-text font-bold [overflow-wrap:anywhere]', {
  variants: {
    size: { md: 'text-[15px]', sm: 'text-[13px]' },
    muted: { true: 'text-muted' },
    num: { true: '[font-variant-numeric:tabular-nums] [font-feature-settings:"tnum"]' },
    mono: { true: "[font-family:ui-monospace,'SF_Mono',Menlo,monospace] [font-variant-numeric:tabular-nums]" },
    /* Truncation needs a real box. On an inline span the parent can be 120px
     * wide while the span's own visual rect remains its full 380px intrinsic
     * width, creating page overflow in documentation and real layouts. */
    truncate: { true: 'block truncate min-w-0 max-w-full' },
  },
  defaultVariants: { size: 'md' },
})

export function Text({ children, size, muted, num, mono, truncate, className }: TextProps) {
  return (
    <span dir="auto" className={cx(text({ size, muted, num, mono, truncate }), className)}>
      {children}
    </span>
  )
}
