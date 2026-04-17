"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ActivityKPIsProps {
  activities: any[]
}

export function ActivityKPIs({ activities }: ActivityKPIsProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="grid grid-cols-3 gap-6 mb-12">{[1,2,3].map(i => <div key={i} className="h-32 bg-surface/30 animate-pulse rounded-[32px]" />)}</div>

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const safeActivities = Array.isArray(activities) ? activities : []
  
  const pending = safeActivities.filter(a => a.status === "OPEN")
  const overdue = pending.filter(a => {
    if (!a.dueAt) return false
    const d = new Date(a.dueAt)
    return !isNaN(d.getTime()) && d < now
  })
  const today = pending.filter(a => {
    if (!a.dueAt) return false
    const d = new Date(a.dueAt)
    return !isNaN(d.getTime()) && d >= now && d < tomorrow
  })

  const stats = [
    { label: 'Atrasadas', value: overdue.length, icon: 'priority_high', color: '#EF4444', glow: 'shadow-red-500/10' },
    { label: 'Para Hoje', value: today.length, icon: 'bolt', color: '#FFB800', glow: 'shadow-yellow-500/10' },
    { label: 'Total Ativo', value: pending.length, icon: 'layers', color: '#8B5CF6', glow: 'shadow-purple-500/10' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {stats.map((s) => (
        <div key={s.label} className={cn(
          "bg-[#0D0D0D] border border-white/5 rounded-[40px] p-8 transition-all duration-500 group relative overflow-hidden shadow-2xl",
          s.glow,
          "hover:border-white/10 hover:-translate-y-1"
        )}>
          {/* DECORATIVE LIGHT */}
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-25" style={{ backgroundColor: s.color }} />
          
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 shadow-Inner" 
              style={{ backgroundColor: `${s.color}15`, borderColor: `${s.color}30` }}
            >
              <span className="material-symbols-outlined text-[32px] font-black" style={{ color: s.color }}>{s.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="text-[10px] font-black font-mono text-secondary uppercase tracking-[0.4em] mb-1 italic opacity-60">
                 {s.label}
               </div>
               <div className="text-4xl font-black text-white tracking-tighter font-mono flex items-baseline gap-2">
                 {s.value}
                 <span className="text-[10px] text-secondary lowercase font-bold tracking-normal italic opacity-40">registros</span>
               </div>
            </div>
          </div>
          
          {/* HOVER ACCENT */}
          <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-40 transition-opacity">
             <span className="material-symbols-outlined text-[40px] text-white/5 font-black">{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
