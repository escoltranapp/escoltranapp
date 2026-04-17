"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"
import { useTodayActivities } from "@/hooks/useTodayActivities"
import { format } from "date-fns"

function KPICard({ 
  label, value, icon, trend, color = "#F97316" 
}: { 
  label: string; value: string | number; icon: string; trend?: string; color?: string 
}) {
  return (
    <div className="relative group overflow-hidden h-full">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
      <div className="relative bg-[#1A1A1A]/40 backdrop-blur-3xl border border-white/[0.04] rounded-[32px] p-8 hover:bg-[#1A1A1A]/60 transition-all shadow-2xl flex flex-col justify-between h-full group/card">
        {/* RADIAL GLOW */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover/card:opacity-40 transition-opacity rounded-full" 
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-xl"
            style={{ 
              backgroundColor: `${color}10`,
              borderColor: `${color}30`,
              boxShadow: `0 0 15px ${color}10`
            }}
          >
            <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
          </div>
          {trend && (
             <div className="px-4 py-1.5 rounded-full text-[10px] font-black font-mono tracking-widest text-white bg-white/[0.03] border border-white/[0.06] group-hover/card:bg-[#F97316]/20 group-hover/card:border-[#F97316]/30 transition-all uppercase">
                {trend}
             </div>
          )}
        </div>

        <div className="space-y-2 relative z-10 pt-8">
           <div className="text-[11px] font-mono text-[#404040] uppercase tracking-[0.3em] font-black italic group-hover/card:translate-x-1 transition-transform">{label}</div>
           <div className="text-3xl font-black text-white tracking-tighter font-mono flex items-baseline gap-2">
              {value}
           </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: stats } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  const { data: todayActivities = [], isLoading: isActivitiesLoading } = useTodayActivities()

  if (!mounted) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>

  const TYPE_ICONS: Record<string, string> = {
    CALL: 'call',
    MEETING: 'groups',
    TASK: 'task_alt',
    NOTE: 'description',
    WHATSAPP: 'chat',
    EMAIL: 'mail',
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
      
      {/* IMMERSIVE AETHER BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F97316]/5 blur-[160px] rounded-full animate-pulse duration-[10s]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F97316]/5 blur-[160px] rounded-full animate-pulse duration-[8s]" />
      </div>

      {/* HEADER ESCOLTRAN STYLE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)] relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20" />
                  <span className="material-symbols-outlined text-white text-3xl font-black relative z-10">monitoring</span>
               </div>
               <div>
                  <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Overview <span className="text-[#F97316] drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">Operacional</span>
                  </h1>
                  <p className="text-[#404040] text-[10px] font-mono font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                     <span className="w-8 h-[1px] bg-[#262626]" />
                     RELATÓRIO SINCRONIZADO: ESCOLTRAN_CLUSTER_AETHER
                  </p>
               </div>
            </div>
          </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        <KPICard label="Dataset Leads" value="1.284" icon="groups" trend="+12.5% VOL" />
        <KPICard label="Volume Financeiro" value="R$ 452k" icon="currency_exchange" trend="+8.2% REV" />
        <KPICard label="Taxa Conversão" value="18.5%" icon="hub" trend="Optimized" color="#A855F7" />
        <KPICard label="Nodes Ativos" value="42" icon="dns" trend="Stable" color="#22C55E" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* GRÁFICO REVENUE (GLASSMORPHIC) */}
        <div className="lg:col-span-8 group relative">
           <div className="absolute -inset-1 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-[32px] blur-3xl opacity-20 transition-opacity group-hover:opacity-40" />
           <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.06] rounded-[32px] p-8 flex flex-col shadow-2xl h-full">
              <div className="flex items-center justify-between mb-20">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Evolução de Dataset</h3>
                    <p className="text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.3em]">Historical_Revenue_Sinc</p>
                 </div>
                 <div className="flex items-center gap-4 bg-[#1A1A1A]/40 px-6 py-3 rounded-full border border-white/[0.04]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                    <span className="text-[11px] font-mono font-black text-[#F2F2F2] uppercase tracking-widest">Global_Metric: BRL</span>
                 </div>
              </div>
              
              <div className="flex-1 flex items-end justify-between px-6 relative min-h-[350px] mb-8 gap-6">
                 <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pr-8">
                    {[...Array(6)].map((_, i) => <div key={i} className="w-full border-t border-white/[0.04]" />)}
                 </div>
                 
                 {[
                   { m: 'JAN', v: 45 }, { m: 'FEV', v: 65 }, { m: 'MAR', v: 55 }, 
                   { m: 'ABR', v: 85 }, { m: 'MAI', v: 75 }, { m: 'JUN', v: 100 }
                 ].map((b, i) => (
                   <div key={i} className="flex flex-col items-center gap-8 flex-1 group/bar relative">
                      <div className="w-full max-w-[40px] bg-gradient-to-t from-[#F97316]/20 to-[#F97316] rounded-t-2xl shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-700 group-hover/bar:shadow-[0_0_50px_rgba(249,115,22,0.6)] group-hover/bar:brightness-125 cursor-pointer relative overflow-hidden" style={{ height: `${b.v}%` }}>
                         <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[11px] font-mono font-black text-[#404040] group-hover/bar:text-white transition-colors tracking-widest">{b.m}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* FEED DE ATIVIDADES OPERACIONAIS */}
        <div className="lg:col-span-4 group relative">
           <div className="absolute -inset-1 bg-gradient-to-br from-white/5 to-transparent rounded-[32px] blur-3xl opacity-10 transition-opacity" />
           <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.06] rounded-[32px] p-10 shadow-2xl h-full overflow-hidden">
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-4">
                 <span className="material-symbols-outlined text-[#F97316]">history</span>
                 Timeline Operacional
              </h3>
              
              {isActivitiesLoading ? (
                 <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#F97316]/20 border-t-[#F97316] rounded-full animate-spin" />
                 </div>
              ) : todayActivities.length === 0 ? (
                 <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                    <span className="material-symbols-outlined text-[#404040] text-3xl mb-2">event_available</span>
                    <p className="text-[10px] text-[#404040] font-black uppercase tracking-widest">Zero Atividades Hoje</p>
                 </div>
              ) : (
                <div className="space-y-8 relative">
                   <div className="absolute left-[24px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-[#F97316]/40 via-[#262626] to-transparent" />
                   
                   {todayActivities.slice(0, 5).map((item: any, i: number) => (
                     <div key={i} className="flex gap-6 relative z-10 group/item">
                        <div className="w-12 h-12 rounded-2xl border border-[#F97316]/30 bg-[#0A0A0A] flex items-center justify-center text-[#F97316] group-hover/item:bg-[#F97316] group-hover/item:text-black transition-all duration-500 shadow-xl relative overflow-hidden">
                           <span className="material-symbols-outlined text-[20px] relative z-10">
                              {TYPE_ICONS[item.tipo] || 'event'}
                           </span>
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className="text-[13px] font-bold text-foreground truncate italic">
                              {item?.titulo || "Sem título"}
                           </p>
                           <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-[0.2em]">
                              {(() => {
                                 if (!item.dueAt) return 'Sem hora'
                                 const d = new Date(item.dueAt)
                                 return isNaN(d.getTime()) ? 'Hora Inválida' : format(d, "HH:mm")
                              })()}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* FOOTER DO FEED */}
              <div className="mt-12 pt-8 border-t border-white/[0.04] text-center">
                 <button 
                  onClick={() => window.location.href = '/activities'}
                  className="text-[11px] font-mono font-black text-[#404040] hover:text-[#F97316] transition-colors uppercase tracking-[0.3em]"
                >
                  Abrir Central de Atividades
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* FAB ESCOLTRAN (GLASSMORPHIC) */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl shadow-[0_20px_40px_rgba(249,115,22,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-[100] group border border-white/20">
         <span className="material-symbols-outlined text-[28px] font-black group-hover:rotate-180 transition-transform duration-700">add</span>
      </button>

    </div>
  )
}
