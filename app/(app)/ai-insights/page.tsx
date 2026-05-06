"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function AiInsightsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState("Geral (Global)")
  
  const { data: metrics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
  })

  const handleExport = () => {
    if (!metrics) return
    const dataStr = JSON.stringify(metrics, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `escoltran-insights-${new Date().toISOString()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast({
      title: "DADOS EXPORTADOS",
      description: "O dataset de insights foi compilado e baixado com sucesso."
    })
  }

  interface Opportunity {
    id: string
    name: string
    contact: string
    score: number
    status: string
    color: string
  }

  const topOpportunities: Opportunity[] = metrics?.recentDeals?.map((d: any) => ({
    id: d.id,
    name: d.titulo,
    contact: d.contact?.nome || "Sem Nome",
    score: d.prioridade === "ALTA" ? 85 : d.prioridade === "MEDIA" ? 60 : 30,
    status: d.status === "OPEN" ? "Acompanhamento Ativo" : "Finalizado",
    color: d.prioridade === "ALTA" ? "#EF4444" : d.prioridade === "MEDIA" ? "#F97316" : "#3B82F6"
  })) || []

  const monthlyTrend: any[] = []
  const stageConversion: any[] = []
  const timePerStage: any[] = []
  const roiSource: any[] = []
  const lostReasons: any[] = []

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32 space-y-8 animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div className="space-y-3">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-transparent border border-[#F97316]/20 flex items-center justify-center shadow-lg shadow-[#F97316]/10">
                 <span className="material-symbols-outlined text-[#F97316] text-[32px]">hub</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Dashboard de IA</h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-px w-12 md:w-24 bg-gradient-to-r from-[#F97316] to-transparent" />
              <p className="text-[#6B7280] text-[9px] md:text-[11px] font-mono font-black tracking-[0.4em] uppercase italic">Insights inteligentes em tempo real</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#0D0D0D]/50 p-2 rounded-2xl border border-white/5">
           <div className="flex items-center gap-2 flex-1">
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <div className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-xl h-12 px-6 flex items-center justify-between gap-4 cursor-pointer hover:border-[#F97316]/40 transition-all group">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{filter}</span>
                       <span className="material-symbols-outlined text-[18px] text-[#404040] group-hover:text-[#F97316] transition-colors">expand_more</span>
                    </div>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="bg-[#0D0D0D] border-white/5 text-white">
                    {["Geral (Global)", "Este Mês", "Trimestre", "Ano Fiscal"].map(f => (
                       <DropdownMenuItem 
                         key={f} 
                         onClick={() => setFilter(f)}
                         className="text-[10px] font-black uppercase tracking-widest focus:bg-primary/10 focus:text-primary cursor-pointer"
                       >
                          {f}
                       </DropdownMenuItem>
                    ))}
                 </DropdownMenuContent>
              </DropdownMenu>

              <button 
                onClick={() => refetch()}
                disabled={isRefetching}
                className="h-12 w-12 bg-[#1A1A1A] border border-white/5 rounded-xl flex items-center justify-center text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/5 transition-all disabled:opacity-50"
              >
                 <span className={cn(
                   "material-symbols-outlined text-[20px]",
                   isRefetching && "animate-spin"
                 )}>sync</span>
              </button>
           </div>

           <button 
             onClick={handleExport}
             className="h-12 px-6 bg-[#1A1A1A] border border-white/5 rounded-xl flex items-center justify-center gap-3 text-white hover:border-[#F97316]/30 hover:text-[#F97316] transition-all group"
           >
              <span className="material-symbols-outlined text-[20px]">export_notes</span>
              <span className="text-[11px] font-black uppercase tracking-widest">Exportar</span>
           </button>
        </div>
      </header>

      {/* KPIS ESCOLTRAN STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
         {[
           { label: "Total de Negócios", value: metrics?.deals?.total || 0, sub: `${metrics?.deals?.total || 0} em aberto`, icon: "radar", color: "#F97316", trend: "+0%" },
           { label: "Taxa de Conversão", value: `${metrics?.conversion?.rate || 0}%`, sub: `${metrics?.conversion?.won || 0} ganhos`, icon: "show_chart", color: "#3B82F6", trend: "+0%" },
           { label: "Valor Total Ganho", value: `R$ ${(metrics?.revenue?.total || 0).toLocaleString('pt-BR')}`, sub: `Média: R$ ${(metrics?.revenue?.total || 0).toLocaleString('pt-BR')}`, icon: "attach_money", color: "#22C55E", trend: "+0%" },
           { label: "Negócios em Risco", value: "0", sub: "Requerem atenção", icon: "warning", color: "#EF4444", trend: "Normal" }
         ].map((stat, i) => (
            <div key={i} className="bg-[#0D0D0D] border border-white/[0.04] rounded-[28px] p-6 md:p-8 shadow-2xl relative group hover:border-[#F97316]/20 transition-all overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <span className="material-symbols-outlined text-[80px]">{stat.icon}</span>
               </div>
               <div className="flex items-center justify-between mb-6">
                  <span className="text-[9px] md:text-[10px] font-black text-[#404040] uppercase tracking-[0.3em] font-mono italic">{stat.label}</span>
                  <div 
                    className="h-8 md:h-10 w-8 md:w-10 rounded-xl flex items-center justify-center border transition-all"
                    style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20` }}
                  >
                     <span className="material-symbols-outlined text-[18px] md:text-[20px]" style={{ color: stat.color }}>{stat.icon}</span>
                  </div>
               </div>
               <div className="flex items-end justify-between">
                  <div className="space-y-1">
                     <div className="text-2xl md:text-3xl font-black text-white tracking-tighter italic">{stat.value}</div>
                     <div className="text-[9px] md:text-[10px] font-mono text-[#404040] font-black uppercase tracking-widest">{stat.sub}</div>
                  </div>
                  <div 
                    className="flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg border text-[9px] md:text-[10px] font-black"
                    style={{ 
                      backgroundColor: stat.trend.includes("+") ? "#22C55E10" : "#1A1A1A",
                      borderColor: stat.trend.includes("+") ? "#22C55E20" : "transparent",
                      color: stat.trend.includes("+") ? "#22C55E" : "#404040"
                    }}
                  >
                     {stat.trend.includes("+") && <span className="material-symbols-outlined text-[12px] md:text-[14px]">north_east</span>}
                     {stat.trend}
                  </div>
               </div>
            </div>
         ))}
      </div>

      <Tabs defaultValue="insights" className="space-y-8 relative z-10">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="bg-[#0D0D0D] p-1.5 rounded-[20px] w-fit border border-white/[0.04] shadow-xl">
            <TabsList className="bg-transparent h-12 gap-2 flex-nowrap">
              <TabsTrigger value="metricas" className="text-[10px] md:text-[11px] uppercase font-black px-6 md:px-8 h-full rounded-xl data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F97316] transition-all tracking-widest border border-transparent data-[state=active]:border-[#F97316]/20 whitespace-nowrap">Métricas Precisas</TabsTrigger>
              <TabsTrigger value="insights" className="text-[10px] md:text-[11px] uppercase font-black px-6 md:px-8 h-full rounded-xl data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F97316] transition-all tracking-widest border border-transparent data-[state=active]:border-[#F97316]/20 whitespace-nowrap">Insights com IA</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="metricas" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0D0D0D] border border-white/[0.04] rounded-[32px] p-10 shadow-2xl">
                 <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-black text-white tracking-tighter uppercase italic">Tendência Mensal</h3>
                      <p className="text-[10px] font-mono text-[#404040] font-black uppercase tracking-[0.3em] mt-2 italic">// NEGÓCIOS_CRIADOS_VS_GANHOS</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#404040]">
                       <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    </div>
                 </div>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                          <XAxis dataKey="name" stroke="#262626" fontSize={10} tickLine={false} axisLine={false} fontStyle="italic" fontWeight="bold" />
                          <YAxis stroke="#262626" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#262626', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                             itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                          <Line type="monotone" dataKey="criados" stroke="#F97316" strokeWidth={4} dot={{ fill: '#F97316', strokeWidth: 2, r: 5 }} />
                          <Line type="monotone" dataKey="ganhos" stroke="#22C55E" strokeWidth={4} dot={{ fill: '#22C55E', strokeWidth: 2, r: 5 }} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-[#0D0D0D] border border-white/[0.04] rounded-[32px] p-10 shadow-2xl">
                 <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-black text-white tracking-tighter uppercase italic">Conversão por Estágio</h3>
                      <p className="text-[10px] font-mono text-[#404040] font-black uppercase tracking-[0.3em] mt-2 italic">// FUNIL_EFICIENCY_ANALYSIS</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#404040]">
                       <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                    </div>
                 </div>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stageConversion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                          <XAxis dataKey="name" stroke="#262626" fontSize={9} tickLine={false} axisLine={false} fontStyle="italic" fontWeight="bold" />
                          <YAxis stroke="#262626" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: '#1A1A1A' }} contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#262626', borderRadius: '16px' }} />
                          <Bar dataKey="value" fill="#F97316" radius={[8, 8, 0, 0]} maxBarSize={50} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-10 animate-in fade-in zoom-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LEAD SCORE SECTION */}
              <div className="bg-[#0D0D0D] border border-white/[0.04] rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                    <span className="material-symbols-outlined text-[120px]">bolt</span>
                 </div>
                 <div className="flex items-center gap-6 mb-12">
                    <div className="h-12 w-12 rounded-2xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                       <span className="material-symbols-outlined text-[24px]">bolt</span>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Lead Score - Top Oportunidades</h3>
                       <p className="text-[10px] font-mono text-[#404040] font-black uppercase tracking-[0.3em] mt-2 italic">Negócios com maior probabilidade de fechamento</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {topOpportunities.map((op) => (
                       <div key={op.id} className="group flex items-center justify-between p-6 bg-[#111111]/40 border border-white/[0.03] rounded-[24px] hover:bg-[#1A1A1A]/60 hover:border-[#F97316]/20 transition-all cursor-pointer">
                          <div className="flex items-center gap-6">
                             <div className="relative">
                                <div className="h-16 w-16 rounded-full border-2 border-white/[0.03] flex items-center justify-center bg-[#0A0A0A] shadow-inner">
                                   <span className="text-[18px] font-black text-white italic">{op.score}</span>
                                </div>
                                <div 
                                  className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0A] shadow-lg"
                                  style={{ backgroundColor: op.color }}
                                />
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                   <h4 className="text-[14px] font-black text-white uppercase italic tracking-tight group-hover:text-[#F97316] transition-colors">{op.name}</h4>
                                   <span className="material-symbols-outlined text-[14px] text-[#404040] group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </div>
                                <p className="text-[11px] font-mono font-bold text-[#6B7280] uppercase tracking-wide">{op.contact}</p>
                                <div className="flex items-center gap-2 mt-3 bg-[#0A0A0A]/50 px-3 py-1.5 rounded-lg w-fit">
                                   <span className="material-symbols-outlined text-[12px] text-[#F97316]">lightbulb</span>
                                   <span className="text-[9px] font-black text-[#404040] uppercase tracking-widest">{op.status}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* RISK ALERTS SECTION */}
              <div className="bg-[#0D0D0D] border border-white/[0.04] rounded-[40px] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
                 <div className="absolute top-0 left-0 p-10 opacity-[0.02]">
                    <span className="material-symbols-outlined text-[100px]">warning</span>
                 </div>
                 
                 <div className="absolute top-10 left-10 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                       <span className="material-symbols-outlined text-[24px]">warning</span>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Alertas de Risco</h3>
                       <p className="text-[10px] font-mono text-[#404040] font-black uppercase tracking-[0.3em] mt-2 italic">Negócios que precisam de atenção urgente</p>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
                    <div className="h-32 w-32 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center relative">
                       <div className="absolute inset-0 bg-emerald-500/10 blur-[30px] rounded-full animate-pulse" />
                       <span className="material-symbols-outlined text-emerald-500 text-[64px] relative z-10">trending_up</span>
                    </div>
                    <div className="text-center space-y-2">
                       <h4 className="text-[18px] font-black text-emerald-500 uppercase italic tracking-tighter">Tudo sob controle!</h4>
                       <p className="text-[11px] font-mono font-black text-[#404040] uppercase tracking-[0.4em] italic leading-relaxed">
                         Nenhum negócio em situação de risco <br /> detectado no momento.
                       </p>
                    </div>
                 </div>
              </div>

           </div>

           {/* SMART SUMMARY BOTTOM */}
           <div className="bg-[#0D0D0D] border border-white/[0.04] rounded-[40px] p-10 shadow-2xl space-y-12">
              <div className="flex items-center gap-6">
                 <div className="h-12 w-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                 </div>
                 <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Resumo Inteligente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { title: "Performance", icon: "equalizer", desc: `Sua taxa de conversão de ${metrics?.conversion?.rate || 0}% é baseada em dados reais do sistema.`, color: "#3B82F6" },
                   { title: "Próxima Ação", icon: "lightbulb", desc: "Acompanhe as oportunidades recentes para aumentar sua receita.", color: "#F97316" },
                   { title: "Foco", icon: "target", desc: "Verifique o widget de UTM Analytics no Dashboard para focar nos melhores canais.", color: "#A855F7" }
                 ].map((card, i) => (
                    <div key={i} className="bg-[#111111]/40 border border-white/[0.04] p-8 rounded-[32px] space-y-6 group hover:border-[#F97316]/20 transition-all">
                       <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-[22px]" style={{ color: card.color }}>{card.icon}</span>
                          <span className="text-[13px] font-black text-white uppercase italic tracking-widest">{card.title}</span>
                       </div>
                       <p className="text-[11px] font-bold text-[#6B7280] leading-relaxed tracking-tight group-hover:text-[#A3A3A3] transition-colors">
                          {card.desc}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
