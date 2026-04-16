"use client"

import { useQuery } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"

function KPICard({ 
  label, value, icon, trend, color = "#ffc880" 
}: { 
  label: string; value: string | number; icon: string; trend?: string; color?: string 
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-7 hover:bg-surface-container-high transition-all group relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className={cn(
             "px-3 py-1 rounded-full text-[11px] font-black font-mono tracking-tighter", 
             trend.startsWith('+') ? "text-green-400 bg-green-400/10" : "text-amber-500 bg-amber-500/10"
           )}>
              {trend}
           </div>
        )}
      </div>
      <div>
         <div className="text-3xl font-black text-white tracking-tighter font-mono mb-1">{value}</div>
         <div className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.25em] font-black">{label}</div>
      </div>
      {/* GLOW EFFECT */}
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
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
      
      {/* OVERVIEW HEADER */}
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter">Overview</h1>
        <p className="text-slate-500 text-[15px] mt-2 font-medium">Relatório analítico de performance e engajamento neural</p>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <KPICard label="Total Leads" value="1.284" icon="person_search" trend="+12.5%" color="#ffc880" />
        <KPICard label="Volume Volume" value="R$ 452k" icon="payments" trend="+8.2%" color="#adc6ff" />
        <KPICard label="Conv. Rate" value="18.5%" icon="query_stats" trend="Optimized" color="#7ae982" />
        <KPICard label="Active Tickets" value="42" icon="confirmation_number" trend="-4%" color="#ffb4ab" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        
        {/* REVENUE EVOLUTION (LEFT) */}
        <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-3xl p-10 flex flex-col">
           <div className="flex items-center justify-between mb-16">
              <h3 className="text-lg font-bold text-white tracking-tight">Evolução de Receita</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
                    <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-widest">Revenue in R$</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 flex items-end justify-between px-4 relative min-h-[300px] mb-8">
              {/* GRID LINES BACKGROUND */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8">
                 {[...Array(6)].map((_, i) => <div key={i} className="w-full border-t border-white/[0.04]" />)}
              </div>
              
              {/* ACCENT BARS */}
              {[
                { m: 'JAN', v: 45 }, { m: 'FEV', v: 65 }, { m: 'MAR', v: 55 }, 
                { m: 'ABR', v: 85 }, { m: 'MAI', v: 75 }, { m: 'JUN', v: 100 }
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-6 flex-1 group">
                   <div className="w-4 bg-amber-500 rounded-t-full shadow-[0_5px_20px_rgba(245,166,35,0.15)] transition-all duration-500 group-hover:bg-white group-hover:w-5 group-hover:shadow-[0_0_30px_rgba(245,166,35,0.3)] cursor-pointer" style={{ height: `${b.v}%` }} />
                   <span className="text-[11px] font-mono font-black text-slate-600 tracking-tighter group-hover:text-slate-300 transition-colors">{b.m}</span>
                </div>
              ))}
           </div>
        </div>

        {/* ATIVIDADES RECENTES (RIGHT) */}
        <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-3xl p-10">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
              <span className="material-symbols-outlined text-slate-600">more_horiz</span>
           </div>
           <div className="space-y-9 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/[0.06] border-dashed border-l" />
              
              {[
                { user: "Ricardo Mendes", action: "atualizou o lead", target: "Logística Express", time: "10m ago", icon: "person" },
                { user: "Carla Dias", action: "enviou campanha", target: "Novos Leads", time: "2h ago", icon: "send" },
                { user: "Pedro Santos", action: "concluiu tarefa", target: "Follow-up", time: "5h ago", icon: "task_alt" },
                { user: "AI System", action: "identificou hot lead", target: "Alpha Log", time: "8h ago", icon: "auto_awesome", ai: true },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative z-10 group">
                   <div className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xl", 
                      item.ai ? "bg-amber-500 border-amber-500 text-black shadow-amber-500/20" : "bg-surface-lowest border-white/10 text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/30"
                   )}>
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                   </div>
                   <div className="flex-1 space-y-1.5">
                      <p className="text-[13px] leading-snug text-slate-400">
                         <span className="font-bold text-white group-hover:text-amber-500 transition-colors">{item.user}</span> {item.action} <span className="font-bold text-slate-200">{item.target}</span>
                      </p>
                      <p className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">{item.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* FUNNEL STAGES (BOTTOM LEFT) */}
         <div className="lg:col-span-5 bg-surface-container border border-white/5 rounded-3xl p-10">
            <h3 className="text-lg font-bold text-white tracking-tight mb-10">Pipeline de Conversão</h3>
            <div className="space-y-9">
               {[
                 { stage: "Prospecção", value: 120, total: 150 },
                 { stage: "Qualificação", value: 84, total: 150 },
                 { stage: "Proposta", value: 32, total: 150 },
                 { stage: "Fechamento", value: 12, total: 150 }
               ].map((stage, i) => (
                 <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end text-[12px] font-bold">
                       <span className="font-mono uppercase tracking-[0.2em] text-slate-500">{stage.stage}</span>
                       <span className="text-white font-mono text-[14px]">{stage.value}</span>
                    </div>
                    <div className="h-2.5 bg-surface-lowest rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,166,35,0.4)] transition-all duration-1000" style={{ width: `${(stage.value / stage.total) * 100}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* TOP DEALS (BOTTOM RIGHT) */}
         <div className="lg:col-span-7 bg-surface-container border border-white/5 rounded-3xl p-10">
            <h3 className="text-lg font-bold text-white tracking-tight mb-10">Top 5 Oportunidades</h3>
            <div className="space-y-3">
               {[
                 { client: "Logística Express S.A.", id: "02914-X", val: "R$ 125.000" },
                 { client: "Tech Hub Brasil", id: "02882-B", val: "R$ 84.500" },
                 { client: "Fazenda Santa Rita", id: "02711-K", val: "R$ 52.000" },
                 { client: "Distribuidora Norte", id: "02654-Z", val: "R$ 48.200" },
                 { client: "Global Mining Corp", id: "02550-Y", val: "R$ 42.000" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-surface-lowest/40 border border-white/5 hover:border-amber-500/20 hover:bg-surface-container-high/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                       </div>
                       <div className="space-y-1">
                          <div className="text-[14px] font-bold text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{item.client}</div>
                          <div className="text-[10px] font-mono text-slate-600 font-black uppercase tracking-widest">Dataset ID: {item.id}</div>
                       </div>
                    </div>
                    <div className="text-[15px] font-mono font-black text-slate-400 group-hover:text-white transition-colors">{item.val}</div>
                 </div>
               ))}
            </div>
         </div>
         
      </div>

      {/* PREMIUM FAB */}
      <button className="fixed bottom-12 right-12 w-16 h-16 bg-amber-500 rounded-full shadow-[0_20px_40px_rgba(245,166,35,0.4)] flex items-center justify-center text-black hover:scale-110 hover:shadow-amber-500/60 transition-all z-[60] group">
         <span className="material-symbols-outlined text-[32px] font-bold group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>

    </div>
  )
}
