'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Brain, Activity } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { UploadZone } from '@/components/scan/upload-zone'
import { ModelSelector } from '@/components/scan/model-selector'
import { ScanResults } from '@/components/scan/scan-results'
import { GlassCard } from '@/components/shared/glass-card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

export function DoctorScan() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [model, setModel] = useState('mri')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ stage: '', percent: 0, message: '' })
  const [result, setResult] = useState<any>(null)

  const handleFileSelect = (f: File) => {
    setFile(f)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setProgress({ stage: 'Starting', percent: 0, message: 'Initializing analysis...' })
    try {
      const res = await api.predict(file, undefined, (msg) => {
        setProgress({
          stage: msg.stage,
          percent: msg.percent,
          message: msg.message,
        })
      })
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Upload Scan" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={() => { setResult(null); setFile(null) }}
                    className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    New Scan
                  </button>
                  <ScanResults result={result} />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Model selector */}
                  <GlassCard>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-4 h-4 text-medical-cyan" />
                        <h3 className="text-sm font-semibold text-white">AI Model Selection</h3>
                      </div>
                      <ModelSelector selected={model} onSelect={setModel} />
                    </div>
                  </GlassCard>

                  {/* Upload zone */}
                  <GlassCard>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-medical-cyan" />
                        <h3 className="text-sm font-semibold text-white">Upload Medical Scan</h3>
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          MRI &bull; CT &bull; X-Ray
                        </Badge>
                      </div>
                      <UploadZone onFileSelect={handleFileSelect} />
                    </div>
                  </GlassCard>

                  {/* Analyze button */}
                  {file && !analyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={handleAnalyze}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-medical-cyan to-medical-blue text-black font-bold text-lg hover:shadow-lg hover:shadow-medical-cyan/20 transition-all duration-300"
                      >
                        <Brain className="w-5 h-5 inline mr-2" />
                        Analyze with AI
                      </button>
                    </motion.div>
                  )}

                  {/* Progress */}
                  <AnimatePresence>
                    {analyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <GlassCard>
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <Loader2 className="w-5 h-5 text-medical-cyan animate-spin" />
                              <div>
                                <div className="text-sm font-medium text-white">{progress.message}</div>
                                <div className="text-xs text-white/30 capitalize">{progress.stage}</div>
                              </div>
                              <Badge variant="default" className="ml-auto">{progress.percent}%</Badge>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percent}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full rounded-full bg-gradient-to-r from-medical-cyan to-medical-blue"
                              />
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
