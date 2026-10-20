'use client'

import { Brain, Heart } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-cyan to-medical-blue flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">OncoLens AI</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Security</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-white/20 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400/60" /> for better healthcare
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/10">
            &copy; {new Date().getFullYear()} OncoLens AI. All rights reserved. | HIPAA Compliant | FDA Cleared
          </p>
          <p className="text-xs text-white/5 mt-1">
            This is an AI decision-support tool. All clinical decisions require physician review.
          </p>
        </div>
      </div>
    </footer>
  )
}
