'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Brain, AlertCircle, Loader2, Stethoscope, User } from 'lucide-react'
import { WebGLShader } from '@/components/ui/web-gl-shader'
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register(email, password, fullName, role)
      navigate(role === 'doctor' ? '/doctor' : '/patient')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <WebGLShader speed={0.15} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-[1]" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-medical-teal/5 blur-[100px] z-[1]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-medical-cyan/5 blur-[100px] z-[1]" />

      <div className="relative z-10 flex w-full">
        {/* Left - Branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-medical-teal to-medical-cyan flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-medical-cyan/20"
            >
              <UserPlus className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-black text-white mb-4">
              Join{' '}
              <span className="bg-gradient-to-r from-medical-teal to-medical-cyan bg-clip-text text-transparent">
                OncoLens AI
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Create your account and start leveraging AI-powered cancer detection for better patient outcomes.
            </p>

            <div className="mt-12 space-y-4">
              {[
                'Role-based access control',
                'Secure HIPAA-compliant platform',
                'Instant AI analysis setup',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex items-center gap-3 text-white/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-teal" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right - Register form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-cyan to-medical-blue flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">OncoLens AI</span>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
                <p className="text-white/40 text-sm">Choose your role and register</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={cn(
                    'p-4 rounded-2xl border transition-all duration-300 text-center',
                    role === 'doctor'
                      ? 'border-medical-cyan/50 bg-medical-cyan/10 text-medical-cyan'
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10'
                  )}
                >
                  <Stethoscope className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={cn(
                    'p-4 rounded-2xl border transition-all duration-300 text-center',
                    role === 'patient'
                      ? 'border-medical-teal/50 bg-medical-teal/10 text-medical-teal'
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10'
                  )}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Patient</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={role === 'doctor' ? 'Dr. John Doe' : 'John Doe'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={role === 'doctor' ? 'doctor@hospital.com' : 'patient@email.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <LiquidGlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  glowColor={role === 'doctor' ? 'rgba(0,229,255,0.3)' : 'rgba(0,191,165,0.3)'}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  {loading ? 'Creating account...' : 'Create Account'}
                </LiquidGlassButton>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/30">
                  Already have an account?{' '}
                  <Link to="/login" className="text-medical-cyan hover:text-medical-cyan/80 transition-colors font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
