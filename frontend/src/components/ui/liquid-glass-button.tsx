'use client'

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  glowColor?: string
}

const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, glowColor, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-300',
          'rounded-2xl border overflow-hidden',
          'backdrop-blur-xl',
          'select-none outline-none',
          'disabled:opacity-50 disabled:pointer-events-none',
          'group',

          // Sizes
          size === 'sm' && 'px-4 py-2 text-xs gap-1.5',
          size === 'md' && 'px-6 py-3 text-sm gap-2',
          size === 'lg' && 'px-8 py-4 text-base gap-2.5',

          // Variants
          variant === 'primary' && [
            'bg-white/5 border-white/10',
            'text-white',
            'hover:bg-white/10 hover:border-white/20',
            'shadow-[0_0_20px_rgba(0,229,255,0.1)]',
            'hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]',
          ],
          variant === 'secondary' && [
            'bg-medical-cyan/5 border-medical-cyan/20',
            'text-medical-cyan',
            'hover:bg-medical-cyan/10 hover:border-medical-cyan/30',
            'shadow-[0_0_20px_rgba(0,229,255,0.05)]',
            'hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]',
          ],
          variant === 'ghost' && [
            'bg-transparent border-transparent',
            'text-white/70',
            'hover:bg-white/5 hover:text-white',
          ],
          variant === 'danger' && [
            'bg-red-500/10 border-red-500/20',
            'text-red-400',
            'hover:bg-red-500/20 hover:border-red-500/30',
            'shadow-[0_0_20px_rgba(255,23,68,0.05)]',
            'hover:shadow-[0_0_30px_rgba(255,23,68,0.15)]',
          ],

          className,
        )}
        {...props}
      >
        {/* Liquid glass shimmer overlay */}
        <span
          className={cn(
            'absolute inset-0 -translate-x-full',
            'bg-gradient-to-r from-transparent via-white/5 to-transparent',
            'group-hover:translate-x-full transition-transform duration-700',
            'pointer-events-none'
          )}
        />

        {/* Glow effect */}
        <span
          className={cn(
            'absolute -inset-1 rounded-3xl opacity-0',
            'group-hover:opacity-100 transition-opacity duration-500',
            'blur-xl pointer-events-none',
          )}
          style={{
            background: glowColor || 'radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Border glow */}
        <span
          className={cn(
            'absolute inset-0 rounded-2xl opacity-0',
            'group-hover:opacity-100 transition-opacity duration-500',
            'pointer-events-none',
          )}
          style={{
            boxShadow: glowColor
              ? `inset 0 0 20px ${glowColor}30, 0 0 20px ${glowColor}20`
              : 'inset 0 0 20px rgba(0,229,255,0.15), 0 0 20px rgba(0,229,255,0.1)',
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Comp>
    )
  }
)

LiquidGlassButton.displayName = 'LiquidGlassButton'

export { LiquidGlassButton }
export type { LiquidGlassButtonProps }
