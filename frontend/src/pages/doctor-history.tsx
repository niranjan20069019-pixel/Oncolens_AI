'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { History, Search, Clock, Brain, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { GlassCard } from '@/components/shared/glass-card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { isMalignant } from '@/lib/utils'

export function DoctorHistory() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<any[]>([])

  useEffect(() => {
    api.history(100).then(setScans).catch(() => {})
  }, [])

  const handleLogout = () => { api.logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Scan History" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <GlassCard>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search scan history..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-medical-cyan/30 transition-colors"
                  />
                </div>
              </div>
            </GlassCard>

            {scans.length === 0 ? (
              <GlassCard>
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-sm">No scan history available.</p>
                </div>
              </GlassCard>
            ) : (
              scans.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <GlassCard>
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
                        <div className="text-sm font-medium text-white">{scan.study_id}</div>
                        <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5 flex-wrap">
                          <span>{scan.filename}</span>
                          <span>&bull;</span>
                          <span>{scan.modality}</span>
                          <span>&bull;</span>
                          <span>{scan.model_name}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-medical-cyan">
                          {(scan.malignancy_probability * 100).toFixed(1)}%
                        </div>
                        <Badge variant={isMalignant(scan.malignancy_probability) ? 'destructive' : 'success'} className="text-[10px]">
                          {scan.classification}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
