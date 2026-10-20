'use client'

import { HeroSection } from '@/components/landing/hero'
import { FeaturesSection } from '@/components/landing/features'
import { LivePreviewSection } from '@/components/landing/live-preview'
import { StatsSection } from '@/components/landing/stats'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { FooterSection } from '@/components/landing/footer'
import { FlyingParticles } from '@/components/shared/flying-particles'

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <FlyingParticles />
      <HeroSection />
      <FeaturesSection />
      <LivePreviewSection />
      <StatsSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}
