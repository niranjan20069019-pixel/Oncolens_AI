import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white',
          'placeholder:text-white/30',
          'backdrop-blur-xl',
          'focus:outline-none focus:border-medical-cyan/50 focus:ring-1 focus:ring-medical-cyan/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-300',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
