'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Brain, AlertCircle, Loader2 } from 'lucide-react'
import { WebGLShader } from '@/components/ui/web-gl-shader'
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, password)
      if (data.role === 'doctor' || data.role === 'admin') {
        navigate('/doctor')
      } else {
        navigate('/patient')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* WebGL Background */}
      <WebGLShader speed={0.15} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-[1]" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-medical-cyan/5 blur-[100px] z-[1]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-medical-blue/5 blur-[100px] z-[1]" />

      <div className="relative z-10 flex w-full">
        {/* Left side - Branding */}
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
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-medical-cyan to-medical-blue flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-medical-cyan/20"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-black text-white mb-4">
              OncoLens{' '}
              <span className="bg-gradient-to-r from-medical-cyan to-medical-blue bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Advanced AI-powered cancer detection platform. Access your diagnostic dashboard with secure authentication.
            </p>

            <div className="mt-12 space-y-4">
              {[
                '99.8% Diagnostic Accuracy',
                'HIPAA Compliant & Secure',
                'Real-time AI Analysis',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex items-center gap-3 text-white/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-cyan" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-cyan to-medical-blue flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">OncoLens AI</span>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-white/40 text-sm">Sign in to access your diagnostic dashboard</p>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
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
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-medical-cyan focus:ring-medical-cyan/20"
                    />
                    <span className="text-sm text-white/40">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-medical-cyan hover:text-medical-cyan/80 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <LiquidGlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  glowColor="rgba(0,229,255,0.3)"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </LiquidGlassButton>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/30">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-medical-cyan hover:text-medical-cyan/80 transition-colors font-medium">
                    Register here
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
