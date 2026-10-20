'use client'

import { Bell, Search, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <Badge variant="outline" className="text-[10px] bg-medical-cyan/5 text-medical-cyan border-medical-cyan/20">
          v1.0.0
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search scans, patients..."
            className="w-64 h-9 pl-9 pr-4 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-medical-cyan/30 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4 text-white/50" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-medical-cyan text-[8px] font-bold flex items-center justify-center text-black">
            3
          </span>
        </button>

        {/* Theme toggle */}
        <button className="w-9 h-9 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/5 transition-colors">
          <Sun className="w-4 h-4 text-white/50" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-gradient-to-br from-medical-cyan to-medical-blue text-white text-[10px]">
                  DR
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white/70 hidden sm:block">Dr. Researcher</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-400">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
