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

  if (!mounted) return <div className="h-32 bg-surface/50 animate-pulse rounded-2xl mb-12" />

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
    { label: 'Atrasadas', value: overdue.length, icon: 'priority_high', color: '#EF4444', trend: 'Crítico' },
    { label: 'Para Hoje', value: today.length, icon: 'today', color: '#3B82F6', trend: 'Foco' },
    { label: 'Total Pendente', value: pending.length, icon: 'list_alt', color: '#F97316', trend: 'Pipeline' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface border border-border rounded-2xl p-6 hover:bg-foreground/[0.02] transition-all group overflow-hidden relative shadow-lg">
          {/* AMBIENT GLOW */}
          <div className="absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: s.color }} />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110" style={{ backgroundColor: `${s.color}10`, borderColor: `${s.color}30` }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-black font-mono border uppercase tracking-widest" style={{ color: s.color, backgroundColor: `${s.color}05`, borderColor: `${s.color}10` }}>
               {s.trend}
            </div>
          </div>
          <div>
             <div className="text-[9px] font-mono text-secondary uppercase tracking-[0.3em] font-black mb-1 italic">{s.label}</div>
             <div className="text-3xl font-black text-foreground tracking-tighter font-mono">{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
