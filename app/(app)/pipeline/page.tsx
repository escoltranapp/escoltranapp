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
  Zap,
  ShieldCheck,
  MousePointer2
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
    <div className="bg-[#0f1216]/80 backdrop-blur-md border border-white/[0.05] rounded-[28px] p-6 flex-1 min-w-[260px] relative overflow-hidden group hover:border-[#d4af37]/20 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
         <Icon size={64} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/[0.05]" style={{ color: color }}>
          <Icon size={22} />
        </div>
        <div>
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</div>
          <div className="text-[24px] font-black text-white mt-0.5 tracking-tighter">{value}</div>
        </div>
      </div>
    </div>
  )
}

function KanbanCard({ deal }: any) {
  const priority = deal.priority || "Média"
  const priorityColor = priority === "Alta" ? "#ef4444" : "#f59e0b"

  return (
    <div className="bg-[#12151a] border border-white/[0.06] rounded-[26px] p-6 group hover:border-[#d4af37]/30 transition-all cursor-pointer relative shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:shadow-[#d4af37]/05">
      <div className="flex items-start justify-between mb-5">
        <h4 className="text-[13px] font-black text-white/90 tracking-tight leading-tight uppercase group-hover:text-white">{deal.titulo || "test"}</h4>
        <div className="flex bg-[#3b82f6]/10 px-2 py-0.5 rounded-lg border border-[#3b82f6]/10">
           <span className="text-[8px] font-black text-[#3b82f6] uppercase tracking-widest">Novo</span>
        </div>
      </div>

      <div className="flex mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor, boxShadow: `0 0 8px ${priorityColor}` }} />
           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{priority}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-7">
        <span className="text-[16px] font-black text-[#d4af37] opacity-40">$</span>
        <span className="text-[20px] font-black text-[#d4af37] tracking-tighter">
          {formatCurrency(deal.valor || 0)}
        </span>
      </div>

      <div className="pt-5 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] flex items-center justify-center text-[12px] font-black text-white/40 shadow-inner">
            {(deal.contact?.nome?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex flex-col">
             <span className="text-[11px] font-black text-white/40 truncate max-w-[100px] uppercase tracking-wider">
               {deal.contact?.nome || "Sem Contato"}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/10">
           <Clock size={14} />
           <span className="text-[10px] font-black italic">21 AB</span>
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
    <div className="modern-noir-bg min-h-screen">
      <div className="modern-noir-atmos" />
      <div className="modern-noir-grid" />
      
      <div className="page-container relative z-10 animate-aether">
        
        {/* 1. HEADER */}
        <header className="page-header-wrapper mb-12">
          <div className="flex flex-col gap-3">
            <div className="bg-[#d4af37]/05 border border-[#d4af37]/20 px-4 py-1.5 rounded-full w-fit flex items-center gap-3">
               <Zap size={12} className="text-[#d4af37]" />
               <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.25em]">Workflow Comercial</span>
            </div>
            <h1 className="text-[48px] font-black text-white tracking-tighter uppercase leading-[0.9]">Pipeline</h1>
            <p className="uppercase tracking-[0.4em] text-[11px] font-black text-white/10 mt-2">Visão Estratégica de Conversão</p>
          </div>

          <div className="flex items-center gap-5">
             <button className="flex items-center gap-4 px-7 py-4 bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-[24px] text-[12px] font-black text-white/40 hover:text-white transition-all group">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                {activeBoard}
                <ChevronDown size={18} className="opacity-20 group-hover:opacity-100 transition-all" />
             </button>
             <button 
               onClick={() => setShowNewColumn(true)}
               className="px-12 py-4.5 bg-[#d4af37] hover:brightness-110 text-black font-black text-[12px] uppercase tracking-[0.15em] rounded-[24px] shadow-[0_15px_45px_rgba(212,175,55,0.3)] transition-all flex items-center gap-3 active:scale-95 border-t border-white/20"
             >
                <Plus size={20} strokeWidth={4} /> Nova Coluna
             </button>
             <button 
               onClick={() => setShowNewBoard(true)}
               className="px-7 py-4.5 bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.07] text-white/30 font-black text-[12px] uppercase tracking-widest rounded-[24px] transition-all flex items-center gap-3 active:scale-95"
             >
                <PlusCircle size={20} /> Novo Board
             </button>
          </div>
        </header>

        {/* 2. TOP METRICS - SQUAT DESIGN */}
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
           <KPICard label="Dataset Size" value="7" icon={ShieldCheck} color="#3b82f6" />
           <KPICard label="Equity Volume" value="R$ 173.232,00" icon={DollarSign} color="#d4af37" />
           <KPICard label="Escalation Required" value="1" icon={AlertCircle} color="#ef4444" />
        </div>

        {/* 3. KANBAN ARCHITECTURE */}
        <div className="flex gap-10 overflow-x-auto pb-20 mt-4 scrollbar-hide">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id || (!d.stage && stage.id === "PROSPECT"))
            const displayDeals = stageDeals.length > 0 ? stageDeals : (stage.id === "PROSPECT" ? [{ id: 'mock', titulo: 'test', valor: 0 }] : [])

            return (
              <div key={stage.id} className="min-w-[360px] flex flex-col gap-8">
                
                {/* Column Header */}
                <div className="flex flex-col gap-4 p-2 relative border-l-4 pl-6 transition-all" style={{ borderLeftColor: stage.color }}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-3 h-3 rounded-full" style={{ background: stage.color, boxShadow: `0 0 20px ${stage.color}60` }} />
                         <span className="text-[16px] font-black uppercase tracking-[0.2em] text-white/90">{stage.label}</span>
                      </div>
                      <span className="text-[12px] font-black text-white/10 bg-white/[0.05] px-3 py-1 rounded-xl">{displayDeals.length}</span>
                   </div>
                   <div className="flex items-center gap-3 text-[16px] font-black text-[#3b82f6]">
                      <TrendingUp size={16} strokeWidth={4} className="opacity-20" />
                      <span className="text-[14px] font-medium opacity-20 mr-[-2px]">≈</span> 
                      {formatCurrency(stage.id === "QUALIFICATION" ? 50000 : (stage.id === "FOLLOW_UP" ? 123232 : 0))}
                   </div>
                </div>

                {/* Cards fluid area */}
                <div className="flex flex-col gap-6">
                  {isLoading ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="h-52 w-full rounded-[32px] bg-white/[0.01] border border-white/[0.03] animate-pulse" />
                    ))
                  ) : (
                    displayDeals.map((deal) => (
                      <KanbanCard key={deal.id} deal={deal} />
                    ))
                  )}

                  <button className="group w-full py-8 bg-white/[0.01] border-2 border-dashed border-white/[0.04] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/05 rounded-[32px] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-white/5 hover:text-[#d4af37] transition-all">
                     <Plus size={22} className="transition-transform group-hover:rotate-90" />
                     Adicionar Registro
                  </button>
                </div>
              </div>
            )
          })}

          {/* New Column Placeholder */}
          <div className="min-w-[360px]">
             <button 
               onClick={() => setShowNewColumn(true)}
               className="w-full h-[700px] border-2 border-dashed border-white/[0.02] hover:border-[#d4af37]/20 hover:bg-[#d4af37]/02 rounded-[48px] flex flex-col items-center justify-center gap-8 transition-all group"
             >
                <div className="w-20 h-20 rounded-[32px] bg-white/[0.01] border border-white/[0.06] flex items-center justify-center group-hover:scale-110 group-hover:border-[#d4af37]/30 group-hover:bg-[#d4af37]/05 transition-all">
                  <Plus size={40} className="text-white/5 group-hover:text-[#d4af37]" />
                </div>
                <span className="text-[14px] font-black uppercase tracking-[0.4em] text-white/5 group-hover:text-[#d4af37]">Nova Coluna</span>
             </button>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {showNewColumn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050608]/95 backdrop-blur-3xl animate-in fade-in duration-600">
           <div className="w-[520px] bg-[#0c0e12] border border-white/[0.1] rounded-[60px] p-16 shadow-[0_50px_200px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setShowNewColumn(false)} className="absolute top-14 right-14 p-4 hover:bg-white/5 rounded-3xl text-white/10 hover:text-white transition-all"><X size={28} /></button>
              <h2 className="text-[24px] font-black uppercase tracking-[0.4em] text-white mb-16">Nova Coluna</h2>
              <div className="space-y-14">
                 <div className="space-y-6">
                    <label className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em] ml-3">Nome da Etapa</label>
                    <input type="text" placeholder="Ex: Lead Qualificado" className="w-full bg-[#111318] border border-white/[0.1] rounded-[32px] px-10 py-7 text-[18px] text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 focus:outline-none transition-all placeholder:text-white/5" />
                 </div>
                 <div className="space-y-8">
                    <label className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em] ml-3">Cor da Marcação</label>
                    <div className="grid grid-cols-7 gap-5">
                       {["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#d4af37"].map(c => (
                         <button key={c} className="w-12 h-12 rounded-full border-4 border-transparent hover:border-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-8 pt-6">
                    <button onClick={() => setShowNewColumn(false)} className="flex-1 py-7 bg-white/[0.02] rounded-[32px] text-[13px] font-black uppercase tracking-[0.3em] text-white/20 hover:bg-white/5 transition-all">Descartar</button>
                    <button className="flex-1 py-7 bg-[#d4af37] rounded-[32px] text-[14px] font-black uppercase tracking-[0.3em] text-black shadow-[0_20px_60px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all border-t border-white/20">Criar Etapa</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
