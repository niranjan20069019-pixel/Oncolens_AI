'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { GlassCard } from '@/components/shared/glass-card'
import { Activity, FileText, Users, Brain } from 'lucide-react'

const stats = [
  {
    icon: Activity,
    value: 99.8,
    suffix: '%',
    decimals: 1,
    label: 'Diagnostic Accuracy',
    glow: 'rgba(0,229,255,0.3)',
  },
  {
    icon: FileText,
    value: 50000,
    suffix: '+',
    decimals: 0,
    label: 'Reports Generated',
    glow: 'rgba(41,121,255,0.3)',
  },
  {
    icon: Users,
    value: 2500,
    suffix: '+',
    decimals: 0,
    label: 'Active Doctors',
    glow: 'rgba(0,191,165,0.3)',
  },
  {
    icon: Brain,
    value: 100000,
    suffix: '+',
    decimals: 0,
    label: 'AI Predictions',
    glow: 'rgba(213,0,249,0.3)',
  },
]

export function StatsSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-medical-cyan/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Trusted by
            </span>{' '}
            <span className="bg-gradient-to-r from-medical-cyan to-medical-blue bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Our AI platform is used by leading healthcare institutions worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <GlassCard key={i} delay={i * 0.1} glowColor={stat.glow}>
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-cyan/10 to-medical-blue/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-medical-cyan" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
                <p className="text-sm text-white/40">{stat.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
