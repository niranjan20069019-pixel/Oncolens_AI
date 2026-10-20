'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  hover?: boolean
  delay?: number
}

export function GlassCard({ children, className, glowColor, hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        'relative rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'hover:border-white/10',
        'transition-all duration-500',
        'overflow-hidden',
        'group',
        className
      )}
    >
      {/* Glow */}
      {glowColor && (
        <div
          className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${glowColor}15 0%, transparent 70%)`,
          }}
        />
      )}
      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: glowColor ? `inset 0 0 20px ${glowColor}10` : 'none' }}
      />
      {children}
    </motion.div>
  )
}
