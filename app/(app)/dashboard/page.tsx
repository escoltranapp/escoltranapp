"use client"

import { useQuery } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"

function KPICard({ 
  label, value, icon, trend, color = "#F97316" 
}: { 
  label: string; value: string | number; icon: string; trend?: string; color?: string 
}) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-7 hover:bg-[#262626] transition-all group relative overflow-hidden flex flex-col justify-between h-full shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-transparent border border-[#F97316]/20 flex items-center justify-center shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]">
          <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-3 py-1 rounded-full text-[11px] font-black font-mono tracking-tighter text-[#F97316] bg-[#F97316]/10">
              {trend}
           </div>
        )}
      </div>
      <div>
         <div className="text-3xl font-black text-white tracking-tighter font-mono mb-1">{value}</div>
         <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.3em] font-black">{label}</div>
      </div>
      {/* BRAND GLOW */}
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#F97316]/5 blur-3xl rounded-full" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-24">
      
      {/* HEADER ESCOLTRAN STYLE */}
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Overview</h1>
        <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">Relatório operacional sincronizado com cluster Escoltran</p>
      </header>

      {/* KPI GRID - USANDO GRID-STATS PARA EVITAR OVERLAP */}
      <div className="grid-stats mb-12">
        <KPICard label="Dataset Leads" value="1.284" icon="group" trend="+12.5%" />
        <KPICard label="Volume Financeiro" value="R$ 452k" icon="payments" trend="+8.2%" />
        <KPICard label="Taxa Conversão" value="18.5%" icon="query_stats" trend="Optimized" />
        <KPICard label="Tickets Ativos" value="42" icon="confirmation_number" trend="-4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        
        {/* GRÁFICO REVENUE (LARANJA) */}
        <div className="lg:col-span-8 bg-[#1A1A1A] border border-white/5 rounded-3xl p-10 flex flex-col shadow-xl">
           <div className="flex items-center justify-between mb-16">
              <h3 className="text-lg font-bold text-white tracking-tight uppercase italic">Evolução de Receita</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                 <span className="text-[11px] font-mono font-black text-[#6B7280] uppercase tracking-widest">Dataset: R$</span>
              </div>
           </div>
           
           <div className="flex-1 flex items-end justify-between px-4 relative min-h-[300px] mb-8">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8">
                 {[...Array(6)].map((_, i) => <div key={i} className="w-full border-t border-white/[0.04]" />)}
              </div>
              
              {[
                { m: 'JAN', v: 45 }, { m: 'FEV', v: 65 }, { m: 'MAR', v: 55 }, 
                { m: 'ABR', v: 85 }, { m: 'MAI', v: 75 }, { m: 'JUN', v: 100 }
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-6 flex-1 group">
                   <div className="w-4 bg-[#F97316] rounded-t-lg shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] group-hover:bg-[#FB923C] cursor-pointer" style={{ height: `${b.v}%` }} />
                   <span className="text-[11px] font-mono font-black text-[#404040] group-hover:text-[#F2F2F2] transition-colors">{b.m}</span>
                </div>
              ))}
           </div>
        </div>

        {/* FEED DE ATIVIDADES DE MARCA */}
        <div className="lg:col-span-4 bg-[#1A1A1A] border border-white/5 rounded-3xl p-10 shadow-xl">
           <h3 className="text-lg font-bold text-white tracking-tight uppercase italic mb-10">Histórico Recente</h3>
           <div className="space-y-10 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/[0.06] border-dashed border-l" />
              
              {[
                { user: "R. Mendes", action: "moveu lead", target: "Logística Express", time: "10m", icon: "person" },
                { user: "Sistema", action: "processou disparo", target: "Dataset Novos", time: "2h", icon: "campaign" },
                { user: "P. Santos", action: "finalizou deal", target: "Tech Brasil", time: "5h", icon: "check_circle" },
                { user: "AI Node", action: "identificou hot lead", target: "Alpha Log", time: "8h", icon: "auto_awesome" },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative z-10 group">
                   <div className="w-10 h-10 rounded-full border border-[#F97316]/20 bg-[#1A1A1A] flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-[13px] text-[#A3A3A3] leading-snug">
                         <span className="font-bold text-white">{item.user}</span> {item.action} <span className="text-[#F97316] font-bold">{item.target}</span>
                      </p>
                      <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">{item.time} ago</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* FAB LARANJA ESCOLTRAN */}
      <button className="fixed bottom-12 right-12 w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-full shadow-[0_15px_30px_rgba(249,115,22,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-[60] group">
         <span className="material-symbols-outlined text-[32px] font-black group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>

    </div>
  )
}
