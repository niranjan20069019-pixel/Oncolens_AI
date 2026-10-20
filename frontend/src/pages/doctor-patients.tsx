'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Search, ChevronRight, Calendar, Brain } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { GlassCard } from '@/components/shared/glass-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'

export function DoctorPatients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    api.patients().then(setPatients).catch(() => {})
  }, [])

  const handleLogout = () => { api.logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Patients" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <GlassCard>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search by patient name or MRN..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-medical-cyan/30 transition-colors"
                  />
                </div>
              </div>
            </GlassCard>

            {patients.length === 0 ? (
              <GlassCard>
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-sm">No patients registered yet.</p>
                </div>
              </GlassCard>
            ) : (
              patients.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassCard>
                    <div className="p-5 flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-medical-cyan to-medical-blue text-white text-xs">
                          {patient.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{patient.full_name}</div>
                        <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                          <span>MRN: {patient.mrn}</span>
                          {patient.date_of_birth && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {patient.date_of_birth}
                              </span>
                            </>
                          )}
                        </div>
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
