"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatCurrency, cn } from "@/lib/utils"
import { useTodayActivities } from "@/hooks/useTodayActivities"
import { format } from "date-fns"

function KPICard({ 
  label, value, icon, subtext, trend, color = "#F97316" 
}: { 
  label: string; value: string | number; icon: string; subtext?: string; trend?: string; color?: string 
}) {
  return (
    <div className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/[0.04] rounded-[24px] p-6 flex flex-col justify-between group hover:bg-[#0A0A0A]/80 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl font-black text-white tracking-tighter">{value}</h3>
          {(subtext || trend) && (
            <p className="text-[10px] font-mono font-black flex items-center gap-1.5 mt-2">
              <span className={cn(trend?.startsWith('+') ? "text-emerald-500" : "text-[#404040]")}>{trend}</span>
              <span className="text-[#404040] uppercase">{subtext}</span>
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0A0A0A]/40 border border-white/[0.04] rounded-[24px] p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[12px] font-black text-white uppercase tracking-widest italic">{title}</h3>
        <span className="material-symbols-outlined text-[18px] text-[#404040]">{icon}</span>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  const { data: todayActivities = [], isLoading: isActivitiesLoading } = useTodayActivities()

  if (!mounted) return null

  const TYPE_ICONS: Record<string, string> = {
    CALL: 'call',
    MEETING: 'groups',
    TASK: 'task_alt',
    NOTE: 'description',
    WHATSAPP: 'chat',
    EMAIL: 'mail',
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-1000">
      
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Dashboard</h1>
        <p className="text-[#404040] text-[11px] font-mono font-black uppercase tracking-widest">Visão geral do seu CRM</p>
      </header>

      {/* 4 TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Total de Contatos" 
          value={metrics?.contacts?.total || 0} 
          icon="person" 
          trend={metrics?.contacts?.trend} 
          subtext="vs mês anterior"
        />
        <KPICard 
          label="Deals Abertos" 
          value={metrics?.deals?.total || 0} 
          icon="adjust"
          subtext={`R$ ${metrics?.deals?.value?.toLocaleString('pt-BR')} em pipeline`}
          color="#3B82F6"
        />
        <KPICard 
          label="Taxa de Conversão" 
          value={`${metrics?.conversion?.rate || 0}%`} 
          icon="show_chart"
          subtext={`${metrics?.conversion?.won || 0} ganhos / ${metrics?.conversion?.lost || 0} perdidos`}
          color="#3B82F6"
        />
        <KPICard 
          label="Receita Fechada" 
          value={formatCurrency(metrics?.revenue?.total || 0)} 
          icon="payments" 
          trend={metrics?.revenue?.trend} 
          subtext="vs mês anterior"
          color="#22C55E"
        />
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1: ATIVIDADES */}
        <SectionCard title="Atividades de Hoje" icon="calendar_today">
          {isActivitiesLoading ? (
            <div className="h-full flex items-center justify-center opacity-20">
              <span className="material-symbols-outlined animate-spin">sync</span>
            </div>
          ) : todayActivities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
              <span className="material-symbols-outlined text-[48px]">calendar_month</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma atividade para hoje</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayActivities.map((act: any, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl hover:bg-white/[0.05] transition-all">
                  <span className="material-symbols-outlined text-[16px] text-[#F97316]">
                    {TYPE_ICONS[act.tipo] || 'event'}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[12px] font-bold text-white truncate">{act.titulo}</p>
                    <p className="text-[9px] font-mono text-[#404040] uppercase">{act.contact?.nome || 'Lead s/ nome'}</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-white/40">
                    {act.dueAt ? format(new Date(act.dueAt), "HH:mm") : '--:--'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* COL 2: DEALS RECENTES */}
        <SectionCard title="Deals Recentes" icon="shutter_speed">
           {metrics?.recentDeals?.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
               <span className="material-symbols-outlined text-[48px]">shopping_bag</span>
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhum negócio recente</p>
             </div>
           ) : (
             <div className="space-y-2">
                {metrics?.recentDeals?.map((deal: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.03] rounded-2xl transition-all">
                    <div className="overflow-hidden">
                      <p className="text-[12px] font-bold text-white truncate">{deal.titulo}</p>
                      <p className="text-[9px] font-mono text-[#404040] uppercase">{deal.contact?.nome}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-black text-[#3B82F6]">{formatCurrency(deal.valor)}</p>
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono font-black uppercase">media</span>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </SectionCard>

        {/* COL 3: PERFORMANCE UTM */}
        <SectionCard title="Performance UTM" icon="trending_up">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[#404040] uppercase tracking-widest flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[12px]">radar</span> Leads Rastreados
                </p>
                <p className="text-xl font-black text-white italic">{metrics?.utmPerformance?.leadsRastreados}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[#404040] uppercase tracking-widest flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[12px]">hub</span> Deals Atribuídos
                </p>
                <p className="text-xl font-black text-white italic">{metrics?.utmPerformance?.dealsAtribuidos}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[#404040] uppercase tracking-widest flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[12px]">query_stats</span> Conversão
                </p>
                <p className="text-xl font-black text-white italic">{metrics?.utmPerformance?.conversao}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
                <p className="text-[8px] font-black text-[#404040] uppercase tracking-widest flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[12px]">monetization_on</span> Receita
                </p>
                <p className="text-xl font-black text-white italic">R$ {Math.round((metrics?.utmPerformance?.receita || 0) / 1000)}k</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[9px] font-black text-[#404040] uppercase tracking-widest">Top Campanhas</p>
              <div className="space-y-3">
                {metrics?.utmPerformance?.topCampanhas?.map((camp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#404040] group-hover:text-white transition-colors">{i+1}</span>
                      <p className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors uppercase">{camp.nome}</p>
                    </div>
                    <span className="text-[10px] font-mono font-black text-[#3B82F6]">{formatCurrency(camp.valor)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.05] hover:text-white transition-all flex items-center justify-center gap-3 group">
               Ver Analytics Completo
               <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </SectionCard>

      </div>
    </div>
  )
}
