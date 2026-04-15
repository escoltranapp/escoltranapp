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
  TrendingUp
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

// ─── STAGES DEFINITION ──────────────────────────────────────────
const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#d4af37" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
  { id: "FOLLOW_UP", label: "FOLLOW UP", color: "#6366f1" },
]

// ─── REUSABLE COMPONENTS ───────────────────────────────────────

function KPICard({ label, value, icon: Icon, color = "var(--accent-primary)" }: any) {
  return (
    <div className="kpi-card flex-1 min-w-[280px]">
      <div className="flex items-center gap-4">
        <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="text-[20px] font-extrabold text-white mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  )
}

function KanbanCard({ deal }: any) {
  const priority = deal.priority || "Média"
  const priorityColor = priority === "Alta" ? "#ef4444" : "#f59e0b"

  return (
    <div className="kpi-card p-4 group border-white/[0.04] hover:border-[#d4af37]/30 transition-all cursor-pointer bg-[#14181f]">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[12px] font-bold text-white/90 leading-tight group-hover:text-white transition-colors">{deal.titulo || "Sem Título"}</h4>
        <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[8px] font-black text-[#d4af37] uppercase tracking-tighter shadow-[0_0_10px_rgba(212,175,55,0.1)]">Novo</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor }} />
           <span className="text-[9px] font-bold text-white/40 uppercase">{priority}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[14px] font-extrabold text-[#d4af37]/90 mb-5">
        <TrendingUp size={14} className="opacity-40" />
        {formatCurrency(deal.valor || 0)}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#d4af37] flex items-center justify-center text-[10px] font-black text-black">
            {(deal.contact?.nome?.[0] || 'S').toUpperCase()}
          </div>
          <span className="text-[10px] font-bold text-white/30 truncate max-w-[80px]">
            {deal.contact?.nome || "Sem Contato"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/20">
          <Clock size={12} />
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
      
      {/* 1. HEADER SECTION */}
      <header className="page-header-wrapper">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-1 rounded-md flex items-center gap-2">
                <Sparkles size={10} className="text-[#d4af37]" />
                <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest">Pipeline Comercial</span>
             </div>
          </div>
          <h1 className="page-title-h1">Pipeline</h1>
          <p className="page-subtitle uppercase tracking-[0.1em] text-[10px] font-bold opacity-40">Gestão de Oportunidades • Visão Kanban</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[11px] font-bold text-white/50 hover:bg-white/[0.06] transition-all">
              <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
              {activeBoard}
              <ChevronDown size={14} />
           </button>
           <button 
             onClick={() => setShowNewColumn(true)}
             className="px-6 py-2.5 bg-[#d4af37] hover:brightness-125 text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2"
           >
              <Plus size={16} /> Nova Coluna
           </button>
           <button 
             onClick={() => setShowNewBoard(true)}
             className="px-5 py-2.5 bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.05] text-white/60 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
           >
              <Plus size={16} /> Novo Board
           </button>
        </div>
      </header>

      {/* 2. TOP METRICS SECTION */}
      <div className="flex gap-4 overflow-x-auto pb-2">
         <KPICard label="Total de Cards" value={deals.length} icon={LayoutGrid} color="#d4af37" />
         <KPICard label="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} color="#d4af37" />
         <KPICard label="Cards Vencidos" value="1" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* 3. KANBAN ARCHITECTURE */}
      <div className="flex gap-6 overflow-x-auto pb-10 mt-4 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id || (!d.stage && stage.id === "PROSPECT"))
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="min-w-[310px] flex flex-col gap-5">
              
              {/* Column Header */}
              <div className="flex flex-col gap-2 p-1 relative">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                       <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ background: stage.color }} />
                       <span className="text-[12px] font-black uppercase tracking-[0.12em] text-white/90">{stage.label}</span>
                    </div>
                    <span className="text-[11px] font-black text-white/20">{stageDeals.length}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#d4af37] opacity-90">
                    <TrendingUp size={12} className="opacity-50" />
                    {formatCurrency(stageTotal)}
                 </div>
                 <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />
              </div>

              {/* Cards Fluid Area */}
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-36 w-full rounded-2xl bg-white/[0.02] border border-white/[0.03] animate-pulse" />
                  ))
                ) : (
                  stageDeals.map((deal) => (
                    <KanbanCard key={deal.id} deal={deal} />
                  ))
                )}

                {/* Addition Placeholder in column */}
                <button className="group w-full py-4 border border-dashed border-white/[0.05] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/05 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-[#d4af37] transition-all">
                   <Plus size={14} className="transition-transform group-hover:rotate-90" />
                   Adicionar Card
                </button>
              </div>
            </div>
          )
        })}

        {/* 4. NEW COLUMN PLACEHOLDER */}
        <div className="min-w-[310px]">
           <button 
             onClick={() => setShowNewColumn(true)}
             className="w-full h-[600px] border-2 border-dashed border-white/[0.03] hover:border-[#d4af37]/20 hover:bg-[#d4af37]/02 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group"
           >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:border-[#d4af37]/30 transition-all">
                <Plus size={24} className="text-white/10 group-hover:text-[#d4af37]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/10 group-hover:text-[#d4af37]">Nova Coluna</span>
           </button>
        </div>
      </div>

      {/* 5. MODALS ARCHITECTURE (UI ONLY) */}
      
      {/* Nova Coluna Modal */}
      {showNewColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-[440px] bg-[#0f1216] border border-white/[0.1] rounded-[32px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative">
              <button onClick={() => setShowNewColumn(false)} className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-xl text-white/20 transition-all"><X size={20} /></button>
              <h2 className="text-[16px] font-black uppercase tracking-[0.2em] text-white mb-10">Nova Coluna</h2>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30">Identificação da Etapa</label>
                    <input type="text" placeholder="Ex: Lead Qualificado" className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-4 text-[14px] text-white focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-white/10" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30">Código Cromático</label>
                    <div className="flex flex-wrap gap-4">
                       {["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#d4af37"].map(c => (
                         <button key={c} className="w-9 h-9 rounded-full border-4 border-transparent hover:border-white/20 hover:scale-110 transition-all" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowNewColumn(false)} className="flex-1 py-4 bg-white/[0.03] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.06] transition-all">Cancelar</button>
                    <button className="flex-1 py-4 bg-[#d4af37] rounded-2xl text-[11px] font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all">Criar Coluna</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Novo Board Modal */}
      {showNewBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-[440px] bg-[#0f1216] border border-white/[0.1] rounded-[32px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative">
              <button onClick={() => setShowNewBoard(false)} className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-xl text-white/20 transition-all"><X size={20} /></button>
              <h2 className="text-[16px] font-black uppercase tracking-[0.2em] text-white mb-10">Novo Board</h2>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/30">Nome do Board</label>
                    <input type="text" placeholder="Ex: Marketing, Parcerias..." className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-6 py-4 text-[14px] text-white focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-white/10" />
                    <p className="text-[10px] text-white/20 font-medium">O novo board começará vazio. Adicione colunas depois.</p>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowNewBoard(false)} className="flex-1 py-4 bg-white/[0.03] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/[0.06] transition-all">Cancelar</button>
                    <button className="flex-1 py-4 bg-[#d4af37] rounded-2xl text-[11px] font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all">Criar Board</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
