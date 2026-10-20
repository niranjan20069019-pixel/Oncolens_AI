'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { GlassCard } from '@/components/shared/glass-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Chief Radiologist, St. Mary\'s Hospital',
    quote: 'OncoLens AI has revolutionized our diagnostic workflow. The accuracy and speed of tumor detection is remarkable.',
    initials: 'SM',
    color: 'from-medical-cyan/20 to-medical-blue/20',
  },
  {
    name: 'Dr. James Chen',
    role: 'Director of Oncology, Pacific Medical Center',
    quote: 'The AI heatmap overlay feature alone has improved our early detection rates by 40%. A game-changer in oncology.',
    initials: 'JC',
    color: 'from-medical-teal/20 to-medical-green/20',
  },
  {
    name: 'Dr. Elena Rodriguez',
    role: 'Head of AI Research, MedTech Institute',
    quote: 'Deploying OncoLens across our network of 12 hospitals was seamless. The cloud infrastructure is enterprise-grade.',
    initials: 'ER',
    color: 'from-medical-blue/20 to-medical-purple/20',
  },
]

export function TestimonialsSection() {
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
              What
            </span>{' '}
            <span className="bg-gradient-to-r from-medical-cyan to-medical-blue bg-clip-text text-transparent">
              Doctors Say
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <GlassCard glowColor="rgba(0,229,255,0.1)">
                <div className="p-6">
                  <Quote className="w-8 h-8 text-medical-cyan/30 mb-4" />
                  <p className="text-white/60 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={`bg-gradient-to-br ${t.color} text-white text-xs font-bold`}>
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-white">{t.name}</div>
                      <div className="text-xs text-white/30">{t.role}</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
