'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Brain,
  FileText,
  TrendingUp,
  Clock,
  Scan,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { GlassCard } from '@/components/shared/glass-card'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { isMalignant } from '@/lib/utils'

export function DoctorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalScans: 0,
    malignantDetected: 0,
    benignDetected: 0,
    avgConfidence: 0,
  })
  const [recentScans, setRecentScans] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await api.history(10)
        setRecentScans(history)
        setStats({
          totalScans: history.length,
          malignantDetected: history.filter((s: any) => isMalignant(s.malignancy_probability)).length,
          benignDetected: history.filter((s: any) => !isMalignant(s.malignancy_probability)).length,
          avgConfidence: history.length > 0
            ? history.reduce((a: number, s: any) => a + s.malignancy_probability, 0) / history.length * 100
            : 0,
        })
      } catch {}
    }
    loadData()
  }, [])

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Scan, label: 'Total Scans', value: stats.totalScans, suffix: '', color: 'from-medical-cyan/20 to-medical-blue/20', glow: 'rgba(0,229,255,0.2)' },
              { icon: AlertTriangle, label: 'Malignant Detected', value: stats.malignantDetected, suffix: '', color: 'from-red-500/20 to-orange-500/20', glow: 'rgba(255,23,68,0.2)' },
              { icon: CheckCircle, label: 'Benign / No Tumor', value: stats.benignDetected, suffix: '', color: 'from-medical-green/20 to-medical-teal/20', glow: 'rgba(0,230,118,0.2)' },
              { icon: TrendingUp, label: 'Avg Malignancy Risk', value: stats.avgConfidence, suffix: '%', decimals: 1, color: 'from-medical-teal/20 to-medical-cyan/20', glow: 'rgba(0,191,165,0.2)' },
            ].map((stat, i) => (
              <GlassCard key={i} delay={i * 0.05} glowColor={stat.glow}>
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
            ))}
          </div>

          {/* Recent scans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/scan')}>
                <Scan className="w-4 h-4 mr-2" />
                New Scan
              </Button>
            </div>
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                <GlassCard>
                  <div className="p-12 text-center">
                    <Brain className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 text-sm">No scans yet. Upload your first scan to get started.</p>
                    <Button className="mt-4" onClick={() => navigate('/doctor/scan')}>
                      Upload Scan
                    </Button>
                  </div>
                </GlassCard>
              ) : (
                recentScans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard hover={false}>
                      <div className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isMalignant(scan.malignancy_probability) ? 'bg-red-500/10' : 'bg-medical-green/10'
                        }`}>
                          {isMalignant(scan.malignancy_probability) ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-medical-green" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{scan.filename}</div>
                          <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                            <span>{scan.modality}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(scan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-medical-cyan">
                            {(scan.malignancy_probability * 100).toFixed(1)}%
                          </div>
                          <Badge variant={isMalignant(scan.malignancy_probability) ? 'destructive' : 'success'} className="text-[10px]">
                            {isMalignant(scan.malignancy_probability) ? 'Malignant' : 'Benign'}
                          </Badge>
                        </div>
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
