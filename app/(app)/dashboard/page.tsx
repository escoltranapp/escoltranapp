"use client"

import { useQuery } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"

function KPICard({ 
  label, value, icon, trend, color = "#ffc880" 
}: { 
  label: string; value: string | number; icon: string; trend?: string; color?: string 
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold font-mono", trend.startsWith('+') ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10")}>
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
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
    <div className="animate-in fade-in duration-700 relative pb-20">
      
      {/* OVERVIEW HEADER */}
      <header className="mb-10">
        <h1 className="text-[32px] font-bold text-white tracking-tight">Overview</h1>
        <p className="text-slate-500 text-[14px] mt-1">Resumo geral da operação comercial</p>
      </header>

      {/* KPI GRID (4 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <KPICard label="Total Leads" value="1,284" icon="person_search" trend="+12.5%" color="#ffc880" />
        <KPICard label="Negotiating Volume" value="R$ 452.000" icon="payments" trend="+8.2%" color="#adc6ff" />
        <KPICard label="Conversion Rate" value="18.5%" icon="query_stats" trend="2.4% vs last mo" color="#7ae982" />
        <KPICard label="Open Tickets" value="42" icon="confirmation_number" trend="-4%" color="#ffb4ab" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* EVOLUÇÃO DE RECEITA (LEFT) */}
        <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-2xl p-8">
           <div className="flex items-center justify-between mb-12">
              <h3 className="text-[15px] font-bold text-white tracking-tight">Evolução de receita nos últimos 6 meses</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Revenue in R$</span>
              </div>
           </div>
           
           <div className="h-[280px] flex items-end justify-between px-4 relative mb-6">
              {/* GRID LINES */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-white/[0.03]" />)}
              </div>
              
              {/* BARS */}
              {[
                { m: 'JAN', v: 40 }, { m: 'FEB', v: 60 }, { m: 'MAR', v: 50 }, 
                { m: 'APR', v: 80 }, { m: 'MAY', v: 70 }, { m: 'JUN', v: 95 }
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                   <div className="w-3 bg-amber-500 rounded-t-full shadow-[0_0_20px_rgba(245,166,35,0.2)] transition-all hover:brightness-125" style={{ height: `${b.v}%` }} />
                   <span className="text-[10px] font-mono font-black text-slate-600 tracking-tighter">{b.m}</span>
                </div>
              ))}
           </div>
        </div>

        {/* ATIVIDADES RECENTES (RIGHT) */}
        <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-2xl p-8">
           <h3 className="text-[15px] font-bold text-white tracking-tight mb-8">Atividades recentes</h3>
           <div className="space-y-8 relative">
              {/* VERTICAL LINE EFFECT */}
              <div className="absolute left-[17px] top-2 bottom-2 w-[1px] bg-white/[0.05]" />
              
              {[
                { user: "Ricardo Mendes", action: "atualizou o status de", target: "Logística Express S.A.", sub: "para Proposta.", time: "HÁ 10 MINUTOS", icon: "person" },
                { user: "Carla Dias", action: "enviou uma campanha de e-mail para", target: "Novos Leads Regionais.", time: "HÁ 2 HORAS", icon: "person_4" },
                { user: "Pedro Santos", action: "concluiu a tarefa", target: "Reunião de Follow-up Tech Hub.", time: "HÁ 5 HORAS", icon: "person_2" },
                { user: "Sistema AI", action: "identificou um lead com alta propensão de fechamento:", target: "Construtora Alpha.", time: "HÁ 8 HORAS", icon: "auto_awesome", ai: true },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative z-10 group">
                   <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center transition-all", 
                      item.ai ? "bg-amber-500 border-amber-500 text-black" : "bg-surface-container-high border-white/10 text-slate-400 group-hover:text-white")}>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-[12px] leading-relaxed text-slate-400">
                         <span className="font-bold text-white">{item.user}</span> {item.action} <span className={cn("font-bold", item.ai ? "text-amber-500" : "text-amber-500/80")}>{item.target}</span> {item.sub}
                      </p>
                      <p className="text-[9px] font-mono font-black text-slate-600 tracking-widest">{item.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* OPORTUNIDADES POR ETAPA (BOTTOM LEFT) */}
         <div className="lg:col-span-5 bg-surface-container border border-white/5 rounded-2xl p-8">
            <h3 className="text-[15px] font-bold text-white tracking-tight mb-8">Oportunidades por etapa do funil</h3>
            <div className="space-y-6">
               {[
                 { stage: "Prospecção", value: 120, total: 150 },
                 { stage: "Qualificação", value: 84, total: 150 },
                 { stage: "Proposta", value: 32, total: 150 },
                 { stage: "Fechamento", value: 12, total: 150 }
               ].map((stage, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                       <span className="font-mono uppercase tracking-widest">{stage.stage}</span>
                       <span className="text-white font-mono">{stage.value}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${(stage.value / stage.total) * 100}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* TOP OPORTUNIDADES (BOTTOM RIGHT) */}
         <div className="lg:col-span-7 bg-surface-container border border-white/5 rounded-2xl p-8">
            <h3 className="text-[15px] font-bold text-white tracking-tight mb-8">Top 5 oportunidades abertas</h3>
            <div className="space-y-6">
               {[
                 { client: "Logística Express S.A.", id: "02914-X", value: "R$ 125k" },
                 { client: "Tech Hub Brasil", id: "02882-B", value: "R$ 84k" },
                 { client: "Fazenda Santa Rita", id: "02711-K", value: "R$ 52k" },
                 { client: "Distribuidora Norte", id: "02654-Z", value: "R$ 48k" },
                 { client: "Global Mining Corp", id: "02550-Y", value: "R$ 42k" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 group cursor-pointer">
                    <div className="space-y-1">
                       <div className="text-[14px] font-bold text-white group-hover:text-amber-500 transition-colors">{item.client}</div>
                       <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">ID: {item.id}</div>
                    </div>
                    <div className="text-[14px] font-mono font-bold text-slate-400 group-hover:text-white transition-colors">{item.value}</div>
                 </div>
               ))}
            </div>
         </div>
         
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button className="fixed bottom-12 right-12 w-16 h-16 bg-amber-500 rounded-full shadow-[0_15px_30px_rgba(245,166,35,0.3)] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all z-[60]">
         <span className="material-symbols-outlined text-[32px] font-bold">add</span>
      </button>

    </div>
  )
}
