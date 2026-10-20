'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown, Check, Cpu, Calendar, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/shared/glass-card'

const models = [
  {
    id: 'mri',
    name: 'MRI Model',
    description: 'Brain tumor detection from MRI scans',
    accuracy: 99.2,
    version: '2.4.1',
    trained: '2024-12-15',
    icon: Brain,
    color: 'from-medical-cyan/20 to-medical-blue/20',
  },
  {
    id: 'ct',
    name: 'CT Scan Model',
    description: 'Lung nodule & abdominal anomaly detection',
    accuracy: 98.7,
    version: '2.3.0',
    trained: '2024-11-20',
    icon: Cpu,
    color: 'from-medical-teal/20 to-medical-green/20',
  },
  {
    id: 'xray',
    name: 'X-Ray Model',
    description: 'Chest X-ray pathology classification',
    accuracy: 97.9,
    version: '2.2.3',
    trained: '2024-10-01',
    icon: BarChart3,
    color: 'from-medical-blue/20 to-medical-purple/20',
  },
  {
    id: 'multi',
    name: 'Multi-Modal Model',
    description: 'Ensemble analysis across all modalities',
    accuracy: 99.8,
    version: '3.0.0',
    trained: '2024-12-01',
    icon: Cpu,
    color: 'from-medical-cyan/20 to-medical-teal/20',
  },
]

interface ModelSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const activeModel = models.find(m => m.id === selected)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeModel?.color || 'from-medical-cyan/20 to-medical-blue/20'} flex items-center justify-center`}>
          <Brain className="w-5 h-5 text-white/70" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{activeModel?.name || 'Select Model'}</div>
          <div className="text-xs text-white/30">{activeModel?.description}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-white/20">Accuracy</div>
            <div className="text-sm font-semibold text-medical-cyan">{activeModel?.accuracy}%</div>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-white/30 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <GlassCard className="p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => { onSelect(model.id); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                    selected === model.id
                      ? 'bg-medical-cyan/10 border border-medical-cyan/20'
                      : 'hover:bg-white/5 border border-transparent'
                  )}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                    <model.icon className="w-4 h-4 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {model.name}
                      {selected === model.id && <Check className="w-3 h-3 text-medical-cyan" />}
                    </div>
                    <div className="text-xs text-white/30">{model.description}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-xs text-medical-cyan font-semibold">{model.accuracy}%</div>
                    <div className="text-[10px] text-white/20">v{model.version}</div>
                  </div>
                </button>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
