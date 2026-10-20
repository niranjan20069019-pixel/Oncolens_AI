'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WebGLShader } from '@/components/ui/web-gl-shader'
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* WebGL Shader Background */}
      <WebGLShader className="z-0" speed={0.2} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-[1]" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-medical-cyan/5 blur-[120px] z-[1]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-medical-blue/5 blur-[120px] z-[1]" />

      {/* Medical grid overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating medical elements */}
      <motion.div
        className="absolute top-1/4 right-[15%] z-[2] hidden lg:block"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-16 h-16 rounded-2xl border border-medical-cyan/20 bg-medical-cyan/5 backdrop-blur-xl flex items-center justify-center">
          <Activity className="w-8 h-8 text-medical-cyan/60" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-[10%] z-[2] hidden lg:block"
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-20 h-20 rounded-2xl border border-medical-blue/20 bg-medical-blue/5 backdrop-blur-xl flex items-center justify-center">
          <Shield className="w-10 h-10 text-medical-blue/60" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[60%] right-[20%] z-[2] hidden lg:block"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <div className="w-12 h-12 rounded-full border border-medical-teal/20 bg-medical-teal/5 backdrop-blur-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-medical-teal/60" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-medical-cyan/20 bg-medical-cyan/5 backdrop-blur-xl mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-medical-cyan animate-pulse-glow" />
            <span className="text-xs font-medium text-medical-cyan tracking-wider uppercase">
              AI-Powered Medical Imaging
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              OncoLens
            </span>
            <br />
            <span className="bg-gradient-to-r from-medical-cyan via-medical-blue to-medical-cyan bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Advanced AI Powered Cancer Detection for MRI, CT & X-Ray Scans{' '}
            <br className="hidden sm:block" />
            with real-time analysis and clinical-grade accuracy.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <LiquidGlassButton variant="primary" size="lg" glowColor="rgba(0,229,255,0.3)">
                <Sparkles className="w-5 h-5" />
                Doctor Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LiquidGlassButton>
            </Link>
            <Link to="/register">
              <LiquidGlassButton variant="secondary" size="lg">
                Get Started
              </LiquidGlassButton>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center justify-center gap-8 text-white/30 text-sm"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-medical-cyan" />
              HIPAA Compliant
            </span>
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-medical-cyan" />
              99.8% Accuracy
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-medical-cyan" />
              FDA Cleared
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[3]" />
    </section>
  )
}
