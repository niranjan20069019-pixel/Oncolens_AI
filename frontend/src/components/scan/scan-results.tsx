'use client'

import { motion } from 'framer-motion'
import {
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  Dna,
  FlaskConical,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { GlassCard } from '@/components/shared/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface ScanResultsProps {
  result: any
}

export function ScanResults({ result }: ScanResultsProps) {
  const { classification, confidence_metrics, chart_data, treatment_protocol, processing_time_ms, study_id, molecular_subtype, disease_breakdown, grad_cam_image_b64, modality } = result

  const isMalignant = (confidence_metrics?.malignancy_probability ?? 0) >= 0.5
  const confidence = confidence_metrics?.primary_confidence || 0
  const confidencePct = (confidence * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analysis Results</h2>
          <p className="text-sm text-white/30">Study ID: {study_id}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => api.downloadPdf(study_id)}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Result banner */}
      <GlassCard glowColor={isMalignant ? 'rgba(255,23,68,0.2)' : 'rgba(0,230,118,0.2)'}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isMalignant ? 'bg-red-500/10' : 'bg-medical-green/10'
            }`}>
              {isMalignant ? (
                <AlertTriangle className={`w-7 h-7 ${isMalignant ? 'text-red-400' : 'text-medical-green'}`} />
              ) : (
                <CheckCircle className="w-7 h-7 text-medical-green" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-2xl font-bold ${isMalignant ? 'text-red-400' : 'text-medical-green'}`}>
                  {classification}
                </h3>
                <Badge variant={isMalignant ? 'destructive' : 'success'}>
                  {isMalignant ? 'Action Required' : 'Clear'}
                </Badge>
              </div>
              <p className="text-white/40 text-sm">
                {isMalignant
                  ? 'AI analysis indicates presence of malignant tissue. Clinical correlation recommended.'
                  : 'No malignant indicators detected. Regular monitoring advised.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-medical-cyan">{confidencePct}%</div>
              <div className="text-xs text-white/30">Confidence</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grad-CAM visualization */}
        {grad_cam_image_b64 && (
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-white">Grad-CAM Heatmap</h3>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/5">
                <img
                  src={`data:image/png;base64,${grad_cam_image_b64}`}
                  alt="Grad-CAM heatmap"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Confidence metrics */}
        <GlassCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-white">Confidence Metrics</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Primary Confidence', value: confidence, color: 'bg-medical-cyan' },
                { label: 'Ensemble Agreement', value: confidence_metrics?.ensemble_agreement || 0, color: 'bg-medical-blue' },
                { label: 'AUC-ROC', value: confidence_metrics?.auc_roc || 0, color: 'bg-medical-teal' },
                { label: 'Calibration Score', value: confidence_metrics?.calibration_score || 0, color: 'bg-medical-green' },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">{metric.label}</span>
                    <span className="text-white/70">{(metric.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${metric.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Molecular subtype & disease breakdown */}
        <GlassCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Dna className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-white">Molecular Analysis</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm text-white/40">Molecular Subtype</span>
                <span className="text-sm font-medium text-white">{molecular_subtype}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm text-white/40">Modality</span>
                <span className="text-sm font-medium text-white">{modality}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm text-white/40">Processing Time</span>
                <span className="text-sm font-medium text-white flex items-center gap-1">
                  <Timer className="w-3 h-3 text-medical-cyan" />
                  {processing_time_ms.toFixed(0)} ms
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Disease breakdown */}
        <GlassCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-white">Disease Breakdown</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(disease_breakdown || {}).map(([key, val], i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">{key}</span>
                    <span className="text-white/70">{(Number(val) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Number(val) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-medical-cyan to-medical-blue"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Treatment protocol */}
      {treatment_protocol && treatment_protocol.length > 0 && (
        <GlassCard glowColor="rgba(0,229,255,0.1)">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-white">Recommended Treatment Protocol</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {treatment_protocol.map((agent: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="text-sm font-semibold text-white mb-1">{agent.medicine}</div>
                  <div className="text-xs text-white/30 space-y-0.5">
                    <p>{agent.dosage} &bull; {agent.route}</p>
                    <p>Cycle: {agent.cycle}</p>
                    <p className="text-medical-cyan/60 mt-1">{agent.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Malignancy vector chart area */}
      {chart_data?.malignancy_vector && (
        <GlassCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-white">Malignancy Progression Prediction</h3>
            </div>
            <div className="relative h-48 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
              {/* Simple chart visualization */}
              <div className="absolute inset-0 flex items-end p-4">
                {chart_data.malignancy_vector.timepoints_weeks.map((week: number, i: number) => {
                  const val = chart_data.malignancy_vector.malignancy_index[i]
                  const height = val * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="w-full max-w-[24px] rounded-t-lg bg-gradient-to-t from-medical-cyan to-medical-blue opacity-70"
                      />
                      <span className="text-[10px] text-white/20">{week}w</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  )
}
