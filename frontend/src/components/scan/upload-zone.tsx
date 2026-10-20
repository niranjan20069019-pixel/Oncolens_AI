'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
}

export function UploadZone({ onFileSelect, accept = '.dcm,.dicom,.jpg,.jpeg,.png,.tiff,.tif' }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const validateFile = (f: File): boolean => {
    const maxSize = 15 * 1024 * 1024
    if (f.size > maxSize) {
      setError('File exceeds 15MB maximum size')
      return false
    }
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    const allowed = accept.split(',').map(a => a.trim().toLowerCase())
    if (!allowed.includes(ext) && !allowed.includes('.' + f.type.split('/')[1])) {
      setError('Unsupported file format. Please upload a medical image (DICOM, JPG, PNG, TIFF)')
      return false
    }
    setError('')
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) {
      setFile(f)
      onFileSelect(f)
    }
  }, [onFileSelect])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) {
      setFile(f)
      onFileSelect(f)
    }
  }

  const reset = () => {
    setFile(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
              isDragging
                ? 'border-medical-cyan bg-medical-cyan/5'
                : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
            )}
          >
            {/* Background glow */}
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl bg-medical-cyan/5 blur-3xl animate-pulse-glow" />
            )}

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-medical-cyan/10 to-medical-blue/10 flex items-center justify-center mx-auto mb-4">
                <Upload className={cn('w-8 h-8 transition-colors', isDragging ? 'text-medical-cyan' : 'text-white/30')} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragging ? 'Drop your file here' : 'Upload medical scan'}
              </h3>
              <p className="text-sm text-white/30 mb-4">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-white/20">
                Supports DICOM, JPG, PNG, TIFF &bull; Max 15MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-medical-cyan/20 bg-medical-cyan/5 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                <File className="w-5 h-5 text-medical-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-white/30">{formatSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-medical-green" />
                <button onClick={reset} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/30" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
