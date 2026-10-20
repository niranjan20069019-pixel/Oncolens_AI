'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, User, Bell, Shield, Palette } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { GlassCard } from '@/components/shared/glass-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export function DoctorSettingsPage() {
  const navigate = useNavigate()

  const handleLogout = () => { api.logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile settings */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-medical-cyan" />
                  <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue="Dr. Researcher" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" defaultValue="doctor@hospital.com" />
                    </div>
                  </div>
                  <Button variant="default" size="sm">Save Changes</Button>
                </div>
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-medical-cyan" />
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications for scan results', enabled: true },
                    { label: 'Push notifications for urgent findings', enabled: true },
                    { label: 'Weekly summary reports', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-9 h-5 rounded-full bg-white/5 peer-checked:bg-medical-cyan after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Security */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-medical-cyan" />
                  <h3 className="text-lg font-semibold text-white">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update Password</Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  )
}
