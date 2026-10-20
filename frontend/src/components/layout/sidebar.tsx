'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  History,
  Settings,
  LogOut,
  Brain,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
  { icon: Upload, label: 'Upload Scan', path: '/doctor/scan' },
  { icon: FileText, label: 'AI Reports', path: '/doctor/reports' },
  { icon: Users, label: 'Patients', path: '/doctor/patients' },
  { icon: History, label: 'Scan History', path: '/doctor/history' },
  { icon: Settings, label: 'Settings', path: '/doctor/settings' },
]

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-white/5', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-medical-cyan to-medical-blue flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold text-white">OncoLens</span>
            <span className="text-[10px] text-medical-cyan block leading-tight">AI Platform</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/doctor'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
              )
            }
          >
            <link.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/5 py-3 px-2 space-y-1">
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/5 bg-black flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
