'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Scan,
  Radio,
  FileText,
  Eye,
  Cloud,
  Dna,
  Microscope,
} from 'lucide-react'
import { GlassCard } from '@/components/shared/glass-card'

const features = [
  {
    icon: Scan,
    title: 'MRI Analysis',
    description: 'Advanced MRI scan analysis for brain tumor detection with sub-millimeter precision.',
    color: 'from-medical-cyan/20 to-medical-blue/20',
    glow: 'rgba(0,229,255,0.2)',
  },
  {
    icon: Radio,
    title: 'CT Scan Detection',
    description: 'Real-time CT scan processing with automated anomaly detection and 3D reconstruction.',
    color: 'from-medical-blue/20 to-medical-teal/20',
    glow: 'rgba(41,121,255,0.2)',
  },
  {
    icon: Eye,
    title: 'X-Ray Prediction',
    description: 'Chest X-ray analysis with deep learning models for rapid preliminary diagnosis.',
    color: 'from-medical-teal/20 to-medical-green/20',
    glow: 'rgba(0,191,165,0.2)',
  },
  {
    icon: FileText,
    title: 'AI Risk Reports',
    description: 'Comprehensive AI-generated clinical reports with treatment protocol suggestions.',
    color: 'from-medical-cyan/20 to-medical-purple/20',
    glow: 'rgba(0,229,255,0.15)',
  },
  {
    icon: Brain,
    title: 'Tumor Visualization',
    description: 'Grad-CAM heatmap overlays highlighting tumor regions with molecular subtyping.',
    color: 'from-medical-purple/20 to-medical-cyan/20',
    glow: 'rgba(213,0,249,0.2)',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Reports',
    description: 'HIPAA-compliant cloud storage with instant PDF report generation and sharing.',
    color: 'from-medical-blue/20 to-medical-cyan/20',
    glow: 'rgba(41,121,255,0.2)',
  },
  {
    icon: Dna,
    title: 'Molecular Subtyping',
    description: 'AI-driven molecular subtype classification for personalized treatment planning.',
    color: 'from-medical-teal/20 to-medical-blue/20',
    glow: 'rgba(0,191,165,0.2)',
  },
  {
    icon: Microscope,
    title: 'Ensemble Validation',
    description: 'Multi-model ensemble validation ensuring 99.8% diagnostic accuracy.',
    color: 'from-medical-cyan/20 to-medical-teal/20',
    glow: 'rgba(0,229,255,0.2)',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-medical-cyan/20 to-transparent" />

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
              Advanced AI
            </span>{' '}
            <span className="bg-gradient-to-r from-medical-cyan to-medical-blue bg-clip-text text-transparent">
              Diagnostic Suite
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Powered by deep learning models trained on millions of medical images for clinical-grade accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <GlassCard key={i} delay={i * 0.1} glowColor={feature.glow}>
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
