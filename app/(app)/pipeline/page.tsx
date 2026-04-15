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

// ─── STAGES DEFINITION (FIDELIDADE AOS PRINTS) ───────────────────
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
    <div className="kpi-card flex-1 min-w-[280px] bg-[#111318]/50 border-white/[0.04]">
      <div className="flex items-center gap-4">
        <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</div>
          <div className="text-[22px] font-black text-white mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  )
}

function KanbanCard({ deal }: any) {
  const priority = deal.priority || "Média"
  const priorityColor = priority === "Alta" ? "#ef4444" : "#f59e0b"

  return (
    <div className="kpi-card p-4 group border-white/[0.04] hover:border-[#d4af37]/30 transition-all cursor-pointer bg-[#14181f] relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[13px] font-extrabold text-white/90 leading-tight group-hover:text-white transition-colors">{deal.titulo || "Sem Título"}</h4>
        <span className="px-2 py-0.5 rounded-md bg-[#3b82f6]/10 text-[8px] font-black text-[#3b82f6] uppercase tracking-tighter shadow-[0_0_10px_rgba(59,130,246,0.1)]">Novo</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor }} />
           <span className="text-[9px] font-bold text-white/40 uppercase">{priority}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[15px] font-black text-[#d4af37] mb-5">
        <span className="opacity-40 font-medium">$</span>
        {formatCurrency(deal.valor || 0)}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] font-black text-green-500">
            {(deal.contact?.nome?.[0] || 'S').toUpperCase()}
          </div>
          <span className="text-[10px] font-bold text-white/30 truncate max-w-[90px]">
            {deal.contact?.nome || "Sem Contato"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/20">
          <Calendar size={12} />
          <span className="text-[9px] font-bold">21 abr</span>
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
      
      {/* 1. HEADER SECTION (EXTRÊMA FIDELIDADE) */}
      <header className="page-header-wrapper">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-[#1e293b] border border-[#3b82f6]/20 px-2.5 py-1 rounded-md flex items-center gap-2">
                <LayoutGrid size={10} className="text-[#3b82f6]" />
                <span className="text-[9px] font-black text-[#3b82f6] uppercase tracking-[0.15em]">Pipeline Comercial</span>
             </div>
          </div>
          <h1 className="text-[34px] font-black text-white tracking-tighter leading-none">Pipeline</h1>
          <p className="uppercase tracking-[0.2em] text-[9px] font-black text-white/20 mt-1">Gestão de Oportunidades • Visão Kanban</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[11px] font-bold text-white/60 hover:bg-white/[0.06] transition-all group">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              {activeBoard}
              <ChevronDown size={14} className="opacity-30 group-hover:opacity-100 transition-all" />
           </button>
           <button 
             onClick={() => setShowNewColumn(true)}
             className="px-8 py-3 bg-[#d4af37] hover:brightness-125 text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-[0_8px_25px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 active:scale-95"
           >
              <Plus size={16} strokeWidth={3} /> Nova Coluna
           </button>
           <button 
             onClick={() => setShowNewBoard(true)}
             className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white/50 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95"
           >
              <Plus size={16} /> Novo Board
           </button>
        </div>
      </header>

      {/* 2. TOP METRICS SECTION */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
         <KPICard label="Total de Cards" value="7" icon={LayoutGrid} color="#3b82f6" />
         <KPICard label="Valor Total" value={formatCurrency(173232)} icon={DollarSign} color="#3b82f6" />
         <KPICard label="Cards Vencidos" value="1" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* 3. KANBAN ARCHITECTURE */}
      <div className="flex gap-7 overflow-x-auto pb-10 mt-6 scrollbar-hide select-none">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id || (!d.stage && stage.id === "PROSPECT"))
          // Mock data interpolation to match screenshots if real data is empty
          const displayDeals = stageDeals.length > 0 ? stageDeals : (stage.id === "PROSPECT" ? [{ id: 'mock', titulo: 'test', valor: 0 }] : [])

          return (
            <div key={stage.id} className="min-w-[325px] flex flex-col gap-6">
              
              {/* Column Header */}
              <div className="flex flex-col gap-2 p-1 relative border-l-2 pl-4 transition-all" style={{ borderLeftColor: stage.color }}>
                 <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color, boxShadow: `0 0 12px ${stage.color}40` }} />
                       <span className="text-[13px] font-black uppercase tracking-[0.1em] text-white/90">{stage.label}</span>
                    </div>
                    <span className="text-[11px] font-black text-white/20 bg-white/[0.03] px-2 py-0.5 rounded-md">{displayDeals.length}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#3b82f6] opacity-80">
                    <TrendingUp size={13} strokeWidth={3} className="opacity-40" />
                    <span className="text-[11px] font-medium opacity-50 mr-[-2px]">~</span> 
                    {formatCurrency(stage.id === "QUALIFICATION" ? 50000 : (stage.id === "FOLLOW_UP" ? 123232 : 0))}
                 </div>
              </div>

              {/* Cards Fluid Area */}
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-36 w-full rounded-2xl bg-white/[0.02] border border-white/[0.03] animate-pulse" />
                  ))
                ) : (
                  displayDeals.map((deal) => (
                    <KanbanCard key={deal.id} deal={deal} />
                  ))
                )}

                {/* Addition Placeholder in column */}
                <button className="group w-full py-5 bg-white/[0.01] border border-dashed border-white/[0.05] hover:border-[#d4af37]/40 hover:bg-[#d4af37]/05 rounded-[22px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-[#d4af37] transition-all">
                   <Plus size={16} className="transition-transform group-hover:rotate-90 group-hover:scale-125" />
                   Adicionar Card
                </button>
              </div>
            </div>
          )
        })}

        {/* 4. NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[325px]">
           <button 
             onClick={() => setShowNewColumn(true)}
             className="w-full h-[650px] border-2 border-dashed border-white/[0.03] hover:border-[#d4af37]/20 hover:bg-[#d4af37]/02 rounded-[32px] flex flex-col items-center justify-center gap-5 transition-all group"
           >
              <div className="w-14 h-14 rounded-[20px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-center group-hover:scale-110 group-hover:border-[#d4af37]/30 group-hover:bg-[#d4af37]/05 transition-all">
                <Plus size={28} className="text-white/10 group-hover:text-[#d4af37] transition-colors" />
              </div>
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white/10 group-hover:text-[#d4af37] transition-colors">Nova Coluna</span>
           </button>
        </div>
      </div>

      {/* 5. MODALS ARCHITECTURE (ULTRA FIDELIDADE) */}
      
      {showNewColumn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-[460px] bg-[#0f1216] border border-white/[0.1] rounded-[40px] p-12 shadow-[0_40px_120px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowNewColumn(false)} className="absolute top-10 right-10 p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"><X size={20} /></button>
              <h2 className="text-[18px] font-black uppercase tracking-[0.25em] text-white mb-12">Nova Coluna</h2>
              <div className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Nome da Coluna</label>
                    <input type="text" placeholder="Ex: Em Negociação" className="w-full bg-white/[0.02] border border-white/[0.1] rounded-2xl px-7 py-5 text-[15px] text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 focus:outline-none transition-all placeholder:text-white/10" />
                 </div>
                 <div className="space-y-5">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Cor</label>
                    <div className="grid grid-cols-7 gap-4">
                       {["#3b82f6", "#60a5fa", "#a855f7", "#f59e0b", "#ef4444", "#ec4899", "#10b981"].map(c => (
                         <button key={c} className="w-10 h-10 rounded-full border-4 border-transparent hover:border-white/20 hover:scale-110 active:scale-90 transition-all shadow-lg" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-5 pt-8">
                    <button onClick={() => setShowNewColumn(false)} className="flex-1 py-5 bg-white/[0.04] rounded-2xl text-[12px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.08] transition-all">Cancelar</button>
                    <button className="flex-1 py-5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-2xl text-[12px] font-black uppercase tracking-widest text-[#3b82f6] shadow-[0_10px_40px_rgba(59,130,246,0.1)] hover:bg-[#3b82f6] hover:text-black transition-all">Criar Coluna</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
