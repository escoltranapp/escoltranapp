"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const monthlyTrend = [
  { name: 'nov.', criados: 0, ganhos: 0, perdidos: 0 },
  { name: 'dez.', criados: 0, ganhos: 0, perdidos: 0 },
  { name: 'jan.', criados: 0, ganhos: 0, perdidos: 0 },
  { name: 'fev.', criados: 0, ganhos: 0, perdidos: 0 },
  { name: 'mar.', criados: 5, ganhos: 0, perdidos: 0 },
  { name: 'abr.', criados: 184, ganhos: 1, perdidos: 0 },
]

const stageConversion = [
  { name: 'Nova Lead', value: 0 },
  { name: 'Reunião Marcada', value: 10 },
  { name: 'Negociação', value: 0 },
  { name: 'Follow up', value: 0 },
]

const timePerStage = [
  { stage: 'Nova Lead', days: 0 },
  { stage: 'Qualificação', days: 0 },
  { stage: 'Reunião Marcada', days: 1.3 },
  { stage: 'Reunião Realizada', days: 0 },
  { stage: 'Negociação', days: 0 },
  { stage: 'Follow up', days: 0 },
]

const roiSource = [
  { source: 'Meta Ads', percent: 1, wins: 1, total: 157, color: '#22C55E' },
  { source: 'Desconhecida', percent: 0, wins: 0, total: 6, color: '#F97316' },
  { source: 'meta_ads', percent: 0, wins: 0, total: 21, color: '#A855F7' },
]

const lostReasons = [
  { name: 'Não é o público-alvo', value: 100, color: '#22C55E' }
]

export default function AiInsightsPage() {
  const [filter, setFilter] = useState("host")

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 pb-24 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#F97316] text-[24px]">psychology</span>
           </div>
           <div>
              <h1 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">Dashboard de IA</h1>
              <p className="text-[#6B7280] text-[11px] font-mono font-bold tracking-widest uppercase mt-1">Insights inteligentes em tempo real</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-[#1A1A1A] border border-white/5 rounded-xl h-10 px-4 flex items-center gap-3 cursor-pointer hover:border-[#F97316]/30 transition-all">
              <span className="text-[11px] font-bold text-white tracking-wide">Host Menos Imposto</span>
              <span className="material-symbols-outlined text-[16px] text-[#6B7280]">expand_more</span>
           </div>
           <button className="h-10 w-10 bg-[#1A1A1A] border border-white/5 rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#F97316] transition-all">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
           </button>
           <button className="h-10 px-5 bg-[#1A1A1A] border border-white/5 rounded-xl flex items-center gap-2 text-white hover:border-[#F97316]/30 hover:text-[#F97316] transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="text-[11px] font-black uppercase tracking-widest">Exportar</span>
           </button>
        </div>
      </header>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-5 shadow-xl group hover:border-[#F97316]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest">Total de Negócios</span>
               <div className="h-8 w-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center group-hover:bg-[#F97316]/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-[#F97316]">radar</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-3xl font-black text-white tracking-tighter">184</div>
                  <div className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider mt-1">182 em aberto</div>
               </div>
               <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  <span className="text-[10px] font-bold">+12%</span>
               </div>
            </div>
         </div>

         <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-5 shadow-xl group hover:border-[#F97316]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest">Taxa de Conversão</span>
               <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">show_chart</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-3xl font-black text-white tracking-tighter">50.0%</div>
                  <div className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider mt-1">1 ganhos</div>
               </div>
               <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  <span className="text-[10px] font-bold">+5%</span>
               </div>
            </div>
         </div>

         <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-5 shadow-xl group hover:border-[#F97316]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest">Valor Total Ganho</span>
               <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">attach_money</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-3xl font-black text-white tracking-tighter">R$ 5.000</div>
                  <div className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider mt-1">Média: R$ 5.000</div>
               </div>
               <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  <span className="text-[10px] font-bold">+18%</span>
               </div>
            </div>
         </div>

         <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-5 shadow-xl group hover:border-[#F97316]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest">Negócios em Risco</span>
               <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-rose-500">warning</span>
               </div>
            </div>
            <div className="flex items-end justify-between">
               <div>
                  <div className="text-3xl font-black text-white tracking-tighter">0</div>
                  <div className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider mt-1">Requerem atenção</div>
               </div>
               <div className="flex items-center gap-1 text-[#6B7280] bg-[#1A1A1A] px-2 py-1 rounded-md">
                  <span className="material-symbols-outlined text-[12px]">horizontal_rule</span>
                  <span className="text-[10px] font-bold">Normal</span>
               </div>
            </div>
         </div>
      </div>

      <Tabs defaultValue="metricas" className="space-y-6">
        <div className="bg-[#1A1A1A] p-1 rounded-xl w-fit border border-[#262626]">
          <TabsList className="bg-transparent h-10 gap-1">
            <TabsTrigger value="metricas" className="text-[10px] uppercase font-black px-6 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all tracking-widest">Métricas Precisas</TabsTrigger>
            <TabsTrigger value="insights" className="text-[10px] uppercase font-black px-6 h-full rounded-lg data-[state=active]:bg-[#F97316] data-[state=active]:text-white transition-all tracking-widest">Insights com IA</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="metricas" className="space-y-6">
           
           {/* GRÁFICOS TOP */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* TENDÊNCIA MENSAL */}
              <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl">
                 <div className="mb-6">
                    <h3 className="text-[14px] font-black text-white tracking-tight">Tendência Mensal</h3>
                    <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest mt-1">Negócios criados vs fechados</p>
                 </div>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                          <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#262626', borderRadius: '12px' }}
                             itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                             labelStyle={{ color: '#A3A3A3', fontSize: '10px', marginBottom: '4px' }}
                          />
                          <Line type="monotone" dataKey="criados" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }} />
                          <Line type="monotone" dataKey="ganhos" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }} />
                          <Line type="monotone" dataKey="perdidos" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F97316]"></span><span className="text-[10px] font-bold text-white uppercase tracking-wider">Criados</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22C55E]"></span><span className="text-[10px] font-bold text-white uppercase tracking-wider">Ganhos</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span><span className="text-[10px] font-bold text-white uppercase tracking-wider">Perdidos</span></div>
                 </div>
              </div>

              {/* CONVERSÃO POR ESTÁGIO */}
              <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl">
                 <div className="mb-6">
                    <h3 className="text-[14px] font-black text-white tracking-tight">Conversão por Estágio</h3>
                    <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest mt-1">Taxa de conversão em cada fase</p>
                 </div>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stageConversion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                          <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                             cursor={{ fill: '#1A1A1A' }}
                             contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#262626', borderRadius: '12px' }}
                             itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={60} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

           </div>

           {/* GRÁFICOS BOTTOM */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* TEMPO MÉDIO */}
              <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[16px] text-[#A3A3A3]">schedule</span>
                    <h3 className="text-[14px] font-black text-white tracking-tight">Tempo Médio por Estágio</h3>
                 </div>
                 <div className="space-y-4">
                    {timePerStage.map((s, i) => (
                       <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-bold text-white">{s.stage}</span>
                             <span className="text-[10px] font-mono text-[#A3A3A3] font-bold">{s.days} dias</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                             <div 
                               className="h-full rounded-full transition-all duration-1000"
                               style={{ 
                                  width: `${s.days > 0 ? (s.days / 2) * 100 : 0}%`,
                                  backgroundColor: s.days > 0 ? '#F97316' : 'transparent'
                               }}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* ROI */}
              <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl">
                 <div className="mb-6">
                    <h3 className="text-[14px] font-black text-white tracking-tight">ROI por Origem</h3>
                    <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest mt-1">Melhores fontes de leads</p>
                 </div>
                 <div className="space-y-5">
                    {roiSource.map((r, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                             <div>
                                <div className="text-[12px] font-bold text-white">{r.source}</div>
                                <div className="text-[9px] font-mono text-[#6B7280] mt-0.5">{r.wins}/{r.total} ganhos</div>
                             </div>
                          </div>
                          <div className="bg-[#1A1A1A] text-white text-[10px] font-black px-2 py-1 rounded-md">
                             {r.percent}%
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* MOTIVOS DE PERDA */}
              <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl p-6 shadow-xl relative">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-rose-500">trending_down</span>
                    <h3 className="text-[14px] font-black text-white tracking-tight">Motivos de Perda</h3>
                 </div>
                 <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={lostReasons}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                          >
                             {lostReasons.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#262626', borderRadius: '12px' }}
                             itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20px] text-center">
                       <div className="text-xl font-black text-emerald-500">100%</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 mt-4 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-white">Não é o público-alvo</span>
                 </div>
              </div>

           </div>
        </TabsContent>

        <TabsContent value="insights">
           <div className="bg-[#0D0D0D] border border-white/[0.03] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-[#0A0A0A]/50">
                 <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[#6B7280]">Neural Analysis Pipeline</span>
                 <div className="flex items-center gap-2 text-[#F97316]/50 text-[10px] font-mono uppercase font-black tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" /> Live Node
                 </div>
              </div>
              <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-[#0A0A0A]/40 opacity-20">
                 <span className="material-symbols-outlined text-[64px] text-[#F97316]">psychology</span>
                 <div className="font-mono text-[11px] uppercase font-black tracking-[0.2em] mt-6 italic">Waiting for Neural Inputs...</div>
              </div>
           </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

