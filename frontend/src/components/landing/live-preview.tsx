'use client'

import { motion } from 'framer-motion'
import { Brain, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/shared/glass-card'
import { Badge } from '@/components/ui/badge'

const scanPreviews = [
  {
    type: 'MRI - Brain',
    probability: 97.4,
    confidence: 0.96,
    risk: 'High',
    heatmapColor: 'from-red-500/20 via-orange-500/20 to-yellow-500/20',
    result: 'Malignant Detected',
    resultColor: 'text-red-400',
    imgColor: 'bg-gradient-to-br from-medical-cyan/5 to-medical-blue/10',
  },
  {
    type: 'CT - Chest',
    probability: 2.1,
    confidence: 0.99,
    risk: 'Low',
    heatmapColor: 'from-green-500/20 via-teal-500/20 to-medical-cyan/20',
    result: 'No Anomaly',
    resultColor: 'text-medical-green',
    imgColor: 'bg-gradient-to-br from-medical-teal/5 to-medical-green/10',
  },
  {
    type: 'X-Ray - Chest',
    probability: 78.6,
    confidence: 0.93,
    risk: 'Elevated',
    heatmapColor: 'from-orange-500/20 via-red-500/20 to-medical-cyan/20',
    result: 'Nodule Suspected',
    resultColor: 'text-medical-orange',
    imgColor: 'bg-gradient-to-br from-medical-cyan/5 to-medical-teal/10',
  },
]

export function LivePreviewSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-medical-cyan/20 bg-medical-cyan/5 backdrop-blur-xl mb-6">
            <span className="w-2 h-2 rounded-full bg-medical-cyan animate-pulse-glow" />
            <span className="text-xs font-medium text-medical-cyan tracking-wider uppercase">
              Live AI Analysis
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Real-Time
            </span>{' '}
            <span className="bg-gradient-to-r from-medical-cyan to-medical-blue bg-clip-text text-transparent">
              Scan Analysis
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Watch our AI analyze medical scans in real-time with clinical-grade confidence metrics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scanPreviews.map((scan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <GlassCard glowColor="rgba(0,229,255,0.15)">
                <div className="p-5">
                  {/* Scan image placeholder */}
                  <div className={`relative h-48 rounded-xl mb-4 overflow-hidden ${scan.imgColor}`}>
                    {/* Animated scan line */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-medical-cyan/30 to-transparent animate-scan-line" />
                    </div>
                    {/* Heatmap overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${scan.heatmapColor} opacity-40`} />
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-12 h-12 text-white/10" />
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-black/50 backdrop-blur-xl text-white/70 text-xs">
                        {scan.type}
                      </Badge>
                    </div>
                    {/* AI badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="bg-medical-cyan/20 text-medical-cyan text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${scan.resultColor}`}>{scan.result}</span>
                      {scan.risk === 'High' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-medical-green" />
                      )}
                    </div>

                    {/* Probability bar */}
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>Malignancy Probability</span>
                        <span className={scan.probability > 50 ? 'text-red-400' : 'text-medical-green'}>
                          {scan.probability}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${scan.probability}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.2, duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            scan.probability > 70
                              ? 'bg-gradient-to-r from-red-500 to-orange-500'
                              : scan.probability > 30
                              ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                              : 'bg-gradient-to-r from-green-500 to-medical-cyan'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex justify-between text-xs text-white/30">
                      <span>Confidence</span>
                      <span>{(scan.confidence * 100).toFixed(0)}%</span>
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
