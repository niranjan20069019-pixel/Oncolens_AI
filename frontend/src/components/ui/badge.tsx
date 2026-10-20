import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-medical-cyan/20 text-medical-cyan',
        secondary: 'border-transparent bg-white/10 text-white/70',
        destructive: 'border-transparent bg-red-500/20 text-red-400',
        success: 'border-transparent bg-medical-green/20 text-medical-green',
        warning: 'border-transparent bg-medical-orange/20 text-medical-orange',
        outline: 'text-white/50 border-white/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
