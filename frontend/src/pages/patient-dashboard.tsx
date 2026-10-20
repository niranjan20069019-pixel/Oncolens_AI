'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Brain,
  FileText,
  Clock,
  Download,
  Shield,
  Calendar,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { GlassCard } from '@/components/shared/glass-card'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { WebGLShader } from '@/components/ui/web-gl-shader'
import { api } from '@/lib/api'
import { isMalignant } from '@/lib/utils'

export function PatientDashboard() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const h = await api.history(20)
        setScans(h)
      } catch {}
    }
    load()
  }, [])

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen bg-black">
      <WebGLShader speed={0.1} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-[1]" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-medical-cyan/3 blur-[100px] z-[1]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-medical-teal/3 blur-[100px] z-[1]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-medical-teal to-medical-cyan flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">OncoLens AI</span>
              <Badge variant="outline" className="text-[10px]">Patient Portal</Badge>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-white/30 hover:text-white/60 transition-colors text-sm">Settings</button>
              <button
                onClick={handleLogout}
                className="text-white/30 hover:text-red-400 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard>
              <div className="p-6 sm:p-8 flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-medical-teal to-medical-cyan text-white text-lg">
                    P
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                  <p className="text-white/40 text-sm">View your scan history, AI analysis results, and health reports.</p>
                </div>
                <Shield className="w-8 h-8 text-medical-cyan/30 hidden sm:block" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Activity, label: 'Total Scans', value: scans.length, suffix: '', color: 'from-medical-teal/20 to-medical-cyan/20' },
              { icon: FileText, label: 'AI Reports', value: scans.length, suffix: '', color: 'from-medical-blue/20 to-medical-teal/20' },
              { icon: TrendingUp, label: 'Avg Malignancy Risk', value: scans.length > 0 ? scans.reduce((a, s) => a + s.malignancy_probability, 0) / scans.length * 100 : 0, suffix: '%', decimals: 1, color: 'from-medical-cyan/20 to-medical-blue/20' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <GlassCard>
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white/70" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">{stat.label}</div>
                      <div className="text-2xl font-bold text-white">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Scan history */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your Scan History</h2>
            <div className="space-y-3">
              {scans.length === 0 ? (
                <GlassCard>
                  <div className="p-12 text-center">
                    <Brain className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 text-sm">No scans found. Your doctor will upload scans here.</p>
                  </div>
                </GlassCard>
              ) : (
                scans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard>
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-medical-cyan" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{scan.filename}</div>
                          <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                            <span>{scan.modality}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(scan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-semibold text-medical-cyan">
                            {(scan.malignancy_probability * 100).toFixed(1)}%
                          </div>
                          <Badge variant={isMalignant(scan.malignancy_probability) ? 'destructive' : 'success'} className="text-[10px]">
                            {isMalignant(scan.malignancy_probability) ? 'Malignant' : 'Benign'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => api.downloadPdf(scan.study_id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
