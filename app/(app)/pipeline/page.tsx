"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  LayoutGrid,
  BarChart3,
  AlertCircle,
  MoreHorizontal,
  PlusCircle,
  X,
  Kanban
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function CRMMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#2563eb"
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconColor?: string
}) {
  return (
    <div className="crm-metric-card animate-aether">
      <div className="crm-metric-icon-box" style={{ color: iconColor }}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-white/30">{title}</h4>
        <div className="text-[28px] font-black tracking-tight text-white">{value}</div>
        {subtitle && <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{subtitle}</p>}
      </div>
    </div>
  )
}

interface Deal {
  id: string; titulo: string; valor: number; stage: string; prioridade: string; status: string;
  createdAt: string;
  contact?: { nome: string };
}

const STAGES = [
  { id: "PROSPECT", label: "NOVO LEAD", color: "#3b82f6" },
  { id: "QUALIFICATION", label: "QUALIFICAÇÃO", color: "#a855f7" },
  { id: "MEETING", label: "REUNIÃO MARCADA", color: "#f59e0b" },
  { id: "PROPOSAL", label: "PROPOSTA", color: "#10b981" },
  { id: "NEGOTIATION", label: "NEGOCIAÇÃO", color: "#ef4444" },
  { id: "FOLLOW_UP", label: "FOLLOW UP", color: "#ec4899" }
]

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [showAddBoard, setShowAddBoard] = useState(false)

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const validatedDeals = Array.isArray(deals) ? deals : []
  const totalValue = validatedDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

  return (
    <div className="animate-aether space-y-10 pb-12">
      
      {/* CRM Global Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
              <Kanban size={20} />
           </div>
           <div>
              <h1 className="crm-header-title">Pipeline</h1>
              <p className="crm-header-subtitle">Gestão de Oportunidades e Visão Kanban</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="h-11 px-6 border border-white/5 bg-white/[0.03] text-white/40 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 transition-all cursor-pointer hover:bg-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" /> Pipeline Principal
           </div>
           <button className="h-11 px-6 border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-all rounded-xl flex items-center gap-2" onClick={() => setShowAddBoard(true)}>
             <Plus size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Novo Board</span>
           </button>
           <button className="btn-glow-blue ml-2" onClick={() => setShowAddColumn(true)}>
              <Plus size={18} strokeWidth={3} /> Nova Coluna
           </button>
        </div>
      </header>

      {/* Kanban Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CRMMetricCard title="Total de Cards" value={validatedDeals.length} subtitle="Em todos os estágios" icon={LayoutGrid} iconColor="#3b82f6" />
        <CRMMetricCard title="Valor Total" value={formatCurrency(totalValue)} subtitle="Volume Negociado" icon={DollarSign} iconColor="#10b981" />
        <CRMMetricCard title="Cards Vencidos" value="1" subtitle="Atenção Necessária" icon={AlertCircle} iconColor="#ef4444" />
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-8 overflow-x-auto pb-10 min-h-[600px] -mx-8 px-8 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = validatedDeals.filter(d => (d.stage || 'PROSPECT') === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="kanban-col flex flex-col gap-6">
              <div className="h-[60px] bg-white/[0.02] border border-white/5 rounded-2xl px-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: stage.color, boxShadow: `0 0 10px ${stage.color}60` }} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{stage.label}</span>
                </div>
                <span className="text-[10px] font-black text-white/10">{stageDeals.length}</span>
              </div>
              
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 pl-2">
                 <TrendingUp size={10} style={{ color: stage.color }} /> {formatCurrency(stageTotal)}
              </div>

              {/* Cards List */}
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)
                ) : (
                  stageDeals.map((deal) => (
                    <div key={deal.id} className="kanban-card group">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[13px] font-black uppercase tracking-tight text-white/80 group-hover:text-blue-400 transition-colors truncate max-w-[160px]">{deal.titulo}</h4>
                          <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black tracking-widest">NOVO</Badge>
                       </div>
                       
                       <div className="flex items-center gap-2 mt-2">
                          <div className={cn("w-2 h-2 rounded-full", deal.prioridade === 'ALTA' ? "bg-red-500" : "bg-amber-500")} />
                          <span className={cn("text-[8px] font-black uppercase tracking-widest", deal.prioridade === 'ALTA' ? "text-red-400" : "text-amber-400")}>Prioridade {deal.prioridade || 'Média'}</span>
                       </div>

                       <div className="text-[16px] font-black text-white/90 mt-4">— {formatCurrency(deal.valor)}</div>

                       <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/[0.03]">
                          <div className="flex items-center gap-2 overflow-hidden">
                             <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[9px] font-black border border-white/10">{deal.contact?.nome?.[0] || 'S'}</div>
                             <span className="text-[9px] font-bold text-white/20 uppercase truncate">{deal.contact?.nome || 'Sem Contato'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/15">
                             <Calendar size={10} />
                             <span className="text-[9px] font-bold">21 abr</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
                
                {/* Add Card Placeholder */}
                <button className="w-full py-5 border-2 border-dashed border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white/20 transition-all">
                  <PlusCircle size={14} /> Adicionar Card
                </button>
              </div>
            </div>
          )
        })}

        {/* New Column Placeholder */}
        <div className="min-w-[320px] h-fit p-10 flex flex-col border-2 border-dashed border-white/5 rounded-3xl items-center justify-center gap-6 group hover:border-white/10 transition-all cursor-pointer" onClick={() => setShowAddColumn(true)}>
           <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5 group-hover:text-white/20 transition-colors">
              <Plus size={24} strokeWidth={3} />
           </div>
           <span className="text-[12px] font-black uppercase tracking-widest text-white/5 group-hover:text-white/20">Nova Coluna</span>
        </div>
      </div>

      {/* Modals from References */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="aether-dialog-content sm:max-w-[420px] border-none shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[1.25rem] font-black uppercase tracking-widest text-white/80">Nova Coluna</h2>
            <DialogClose className="text-white/20 hover:text-white transition-colors"><X size={20} /></DialogClose>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Nome da Coluna</label>
              <Input placeholder="Ex: Em Negociação" className="crm-search-input pl-6" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Cor Identificadora</label>
              <div className="flex flex-wrap gap-4">
                 {["#3b82f6", "#60a5fa", "#a855f7", "#f59e0b", "#ef4444", "#ec4899", "#10b981"].map(c => (
                   <button key={c} className="w-10 h-10 rounded-full border-2 border-white/5 hover:border-white/40 transition-all shadow-inner" style={{ backgroundColor: c }} />
                 ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
               <button className="flex-1 h-14 border border-white/5 bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40" onClick={() => setShowAddColumn(false)}>Cancelar</button>
               <button className="flex-1 btn-glow-blue h-14 rounded-2xl">Criar Coluna</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
