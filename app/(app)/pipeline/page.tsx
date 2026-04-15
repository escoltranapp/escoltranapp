"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  DollarSign, 
  LayoutGrid, 
  Calendar, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  ChevronDown, 
  X,
  PlusCircle,
  MoreHorizontal,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Share2
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

// ─── STAGES DEFINITION ──────────────────────────────────────────
const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#3b82f6" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
  { id: "FOLLOW_UP", label: "FOLLOW UP", color: "#6366f1" },
]

// ─── REUSABLE COMPONENTS ───────────────────────────────────────

function KPICard({ label, value, icon: Icon, color = "var(--accent-primary)" }: any) {
  return (
    <div className="kpi-card flex-1 min-w-[280px] bg-[#0c0e12] border-white/[0.03] rounded-[24px]">
      <div className="flex items-center gap-4">
        <div className="kpi-icon-container" style={{ backgroundColor: `${color}10`, color: color }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{label}</div>
          <div className="text-[22px] font-black text-white mt-0.5 tracking-tighter">{value}</div>
        </div>
      </div>
    </div>
  )
}

function KanbanCard({ deal }: any) {
  const priority = deal.priority || "Média"
  const priorityColor = priority === "Alta" ? "#ef4444" : "#f59e0b"

  return (
    <div className="bg-[#111318] border border-white/[0.04] rounded-[22px] p-5 group hover:border-[#d4af37]/20 transition-all cursor-pointer relative shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-[14px] font-black text-white tracking-tight leading-tight uppercase">{deal.titulo || "test"}</h4>
        <span className="text-[9px] font-black text-[#3b82f6] uppercase tracking-widest opacity-80">Novo</span>
      </div>

      <div className="flex mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor }} />
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{priority}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-6">
        <span className="text-[16px] font-black text-[#d4af37] opacity-60">$</span>
        <span className="text-[18px] font-black text-[#d4af37] tracking-tighter">
          {formatCurrency(deal.valor || 0)}
        </span>
      </div>

      <div className="pt-4 border-t border-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[11px] font-black text-green-500 shadow-inner">
            {(deal.contact?.nome?.[0] || 'S').toUpperCase()}
          </div>
          <span className="text-[11px] font-bold text-white/25 truncate max-w-[100px]">
            {deal.contact?.nome || "Sem Contato"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/15">
           <Calendar size={13} className="opacity-50" />
           <span className="text-[10px] font-bold">21 abr</span>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────

export default function PipelinePage() {
  const [activeBoard, setActiveBoard] = useState("Pipeline Principal")
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [showNewBoard, setShowNewBoard] = useState(false)
  
  const { data: dealsData, isLoading } = useQuery<any[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const deals = Array.isArray(dealsData) ? dealsData : []
  const totalValue = deals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

  return (
    <div className="page-container animate-aether">
      
      {/* 1. HEADER */}
      <header className="page-header-wrapper">
        <div className="flex flex-col gap-2">
          <div className="bg-[#1e293b] border border-[#3b82f6]/20 px-3 py-1 rounded-lg w-fit flex items-center gap-2">
             <LayoutGrid size={11} className="text-[#3b82f6]" />
             <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.2em]">Pipeline Comercial</span>
          </div>
          <h1 className="text-[38px] font-black text-white tracking-tighter uppercase">Pipeline</h1>
          <p className="uppercase tracking-[0.3em] text-[10px] font-black text-white/15 mt-1">Gestão de Oportunidades • Visão Kanban</p>
        </div>

        <div className="flex items-center gap-4">
           <button className="flex items-center gap-4 px-6 py-3.5 bg-white/[0.02] border border-white/[0.06] rounded-[20px] text-[12px] font-black text-white/40 hover:bg-white/[0.05] transition-all group">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
              {activeBoard}
              <ChevronDown size={16} className="opacity-20 group-hover:opacity-100 transition-all" />
           </button>
           <button 
             onClick={() => setShowNewColumn(true)}
             className="px-10 py-4 bg-[#d4af37] hover:brightness-110 text-black font-black text-[12px] uppercase tracking-[0.1em] rounded-[20px] shadow-[0_10px_35px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2.5 active:scale-95"
           >
              <Plus size={18} strokeWidth={3} /> Nova Coluna
           </button>
           <button 
             onClick={() => setShowNewBoard(true)}
             className="px-6 py-4 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] text-white/40 font-black text-[12px] uppercase tracking-widest rounded-[20px] transition-all flex items-center gap-2 active:scale-95"
           >
              <Plus size={18} /> Novo Board
           </button>
        </div>
      </header>

      {/* 2. TOP METRICS - NEW STYLING */}
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
         <KPICard label="Total de Cards" value="7" icon={PlusCircle} color="#3b82f6" />
         <KPICard label="Valor Total" value="R$ 173.232,00" icon={DollarSign} color="#3b82f6" />
         <KPICard label="Cards Vencidos" value="1" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* 3. KANBAN ARCHITECTURE */}
      <div className="flex gap-8 overflow-x-auto pb-10 mt-6 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id || (!d.stage && stage.id === "PROSPECT"))
          const displayDeals = stageDeals.length > 0 ? stageDeals : (stage.id === "PROSPECT" ? [{ id: 'mock', titulo: 'test', valor: 0 }] : [])

          return (
            <div key={stage.id} className="min-w-[340px] flex flex-col gap-6">
              
              {/* Column Header - matching 2nd image */}
              <div className="flex flex-col gap-3 p-1 relative border-l-[3px] pl-5 transition-all" style={{ borderLeftColor: stage.color }}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color, boxShadow: `0 0 15px ${stage.color}50` }} />
                       <span className="text-[14px] font-black uppercase tracking-[0.15em] text-white/90">{stage.label}</span>
                    </div>
                    <span className="text-[12px] font-black text-white/10">{displayDeals.length}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[14px] font-black text-[#3b82f6] opacity-90">
                    <TrendingUp size={14} strokeWidth={3} className="opacity-30" />
                    <span className="text-[12px] font-medium opacity-30 mr-[-2px]">~</span> 
                    {formatCurrency(stage.id === "QUALIFICATION" ? 50000 : (stage.id === "FOLLOW_UP" ? 123232 : 0))}
                 </div>
              </div>

              {/* Cards Fluid Area */}
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-44 w-full rounded-[24px] bg-white/[0.01] border border-white/[0.02] animate-pulse" />
                  ))
                ) : (
                  displayDeals.map((deal) => (
                    <KanbanCard key={deal.id} deal={deal} />
                  ))
                )}

                <button className="group w-full py-6 bg-white/[0.01] border border-dashed border-white/[0.05] hover:border-[#d4af37]/40 hover:bg-[#d4af37]/05 rounded-[24px] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/10 hover:text-[#d4af37] transition-all">
                   <Plus size={18} className="transition-transform group-hover:rotate-90" />
                   Adicionar Card
                </button>
              </div>
            </div>
          )
        })}

        {/* 4. NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[340px]">
           <button 
             onClick={() => setShowNewColumn(true)}
             className="w-full h-[650px] border-2 border-dashed border-white/[0.02] hover:border-[#d4af37]/20 hover:bg-[#d4af37]/02 rounded-[40px] flex flex-col items-center justify-center gap-6 transition-all group"
           >
              <div className="w-16 h-16 rounded-[24px] bg-white/[0.01] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:border-[#d4af37]/30 transition-all">
                <Plus size={32} className="text-white/5 group-hover:text-[#d4af37]" />
              </div>
              <span className="text-[13px] font-black uppercase tracking-[0.3em] text-white/5 group-hover:text-[#d4af37]">Nova Coluna</span>
           </button>
        </div>
      </div>

      {/* 5. MODALS ARCHITECTURE */}
      {showNewColumn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="w-[480px] bg-[#0c0e12] border border-white/[0.08] rounded-[50px] p-14 shadow-[0_50px_150px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-400">
              <button onClick={() => setShowNewColumn(false)} className="absolute top-12 right-12 p-3 hover:bg-white/5 rounded-2xl text-white/15 hover:text-white transition-all"><X size={24} /></button>
              <h2 className="text-[20px] font-black uppercase tracking-[0.3em] text-white mb-14 underline decoration-[#d4af37] decoration-4 underline-offset-8">Nova Coluna</h2>
              <div className="space-y-12">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Etapa Comercial</label>
                    <input type="text" placeholder="Ex: Lead Qualificado" className="w-full bg-[#111318] border border-white/[0.08] rounded-3xl px-8 py-6 text-[16px] text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 focus:outline-none transition-all placeholder:text-white/5" />
                 </div>
                 <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Identidade Cromática</label>
                    <div className="grid grid-cols-7 gap-4">
                       {["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#d4af37"].map(c => (
                         <button key={c} className="w-11 h-11 rounded-full border-4 border-transparent hover:border-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-6 pt-10">
                    <button onClick={() => setShowNewColumn(false)} className="flex-1 py-6 bg-white/[0.02] rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] text-white/20 hover:bg-white/5 transition-all">Cancelar</button>
                    <button className="flex-1 py-6 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-3xl text-[13px] font-black uppercase tracking-[0.2em] text-[#3b82f6] shadow-[0_15px_50px_rgba(59,130,246,0.1)] hover:bg-[#3b82f6] hover:text-black transition-all">Sincronizar</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
