"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"

function KPICard({ 
  label, value, icon, color = "#ffc880" 
}: { 
  label: string; value: string | number; icon: string; color?: string 
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-xl p-6 hover:bg-surface-container-high transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
        <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">REAL-TIME</span>
      </div>
      <div className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">{label}</div>
      <div className="text-3xl font-bold text-white tracking-tight font-mono">{value}</div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  const { data: stats } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Controle</h1>
          <p className="text-slate-400 text-sm mt-1">Performance Analítica • <span className="font-mono text-[11px] text-amber-500 uppercase font-bold tracking-widest ml-1">Monitoramento Global</span></p>
        </div>
        
        <button 
          className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[13px]"
          onClick={() => router.push("/contacts")}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Registro</span>
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KPICard label="Base Contatos" value={stats?.totalContacts || "0"} icon="groups" color="#adc6ff" />
        <KPICard label="Negócios Abertos" value={stats?.openDeals || "0"} icon="bolt" color="#ffc880" />
        <KPICard label="Pipeline Total" value={stats?.pipelineValue ? formatCurrency(stats.pipelineValue) : 'R$ 0'} icon="payments" color="#7ae982" />
        <KPICard label="Taxa Conversão" value={`${(stats?.conversionRate || 0).toFixed(1)}%`} icon="monitoring" color="#f5a623" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRÁFICO (REMODELADO) */}
        <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-xl p-8">
          <div className="mb-10 flex items-center justify-between">
             <div>
                <h3 className="text-sm font-semibold text-white">Fluxo de Engajamento</h3>
                <p className="text-xs text-slate-500 mt-1">Status de aquisição por cluster temporal</p>
             </div>
             <div className="flex bg-surface-container-lowest p-1 rounded-lg gap-1 border border-white/5">
                {["7D", "30D", "90D"].map(f => (
                  <button
                    key={f}
                    className={cn("h-8 px-4 rounded-md text-[10px] uppercase font-bold transition-all",
                      f === "30D" ? "bg-amber-500/10 text-amber-500" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="h-[300px] flex items-end justify-between gap-4 px-2">
             {[40, 55, 35, 70, 90, 60, 95, 100, 80, 85, 50, 65].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <div className="w-full bg-amber-500/10 rounded-t-md transition-all group-hover:bg-amber-500/30 cursor-pointer border-t border-amber-500/20" style={{ height: `${h}%` }} />
                   {h > 90 && <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-500">MAX</div>}
                </div>
             ))}
          </div>
        </div>

        {/* RECENT ACTIVITY MONITOR */}
        <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
             <h3 className="text-sm font-semibold text-white">Atividade Neural</h3>
             <span className="material-symbols-outlined text-amber-500 text-[20px] animate-pulse">sensors</span>
          </div>

          <div className="p-6 space-y-4 flex-1">
             {[
               { user: "H. Bariani", action: "Proposta Enviada", icon: "outgoing_mail", color: "#adc6ff" },
               { user: "AI System", action: "Lead Score: 9.8", icon: "auto_awesome", color: "#7ae982" },
               { user: "Financeiro", action: "Boleto Gerado", icon: "receipt_long", color: "#ffc880" },
               { user: "Marketing", action: "Disparo OK", icon: "send", color: "#f5a623" },
             ].map((act, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container-high transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                     <span className="material-symbols-outlined text-[20px]" style={{ color: act.color }}>{act.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[12px] font-bold text-slate-200 uppercase truncate tracking-tight">{act.action}</p>
                     <p className="text-[10px] font-mono text-slate-500 uppercase font-bold mt-1">{act.user}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
