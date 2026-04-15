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
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricHeaderCard({
  title,
  value,
  icon: Icon,
  color = "gold"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className="aether-card metric-card-refined animate-aether">
      <div className="icon-wrap">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <span className="label text-white/20">{title}</span>
        <span className="value">{value}</span>
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
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 w-fit">
             <LayoutGrid size={10} className="text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Pipeline Comercial</span>
          </div>
          <h1 className="page-title text-white">Pipeline</h1>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] mt-1">Gestão de Oportunidades • Visão Kanban</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 h-12">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Pipeline Principal</span>
           </div>
           <button 
             className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-3"
             onClick={() => setShowAddColumn(true)}
           >
             <Plus size={16} strokeWidth={3} /> Nova Coluna
           </button>
           <button 
            className="h-12 px-6 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-white/80 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-3"
            onClick={() => setShowAddBoard(true)}
           >
             <Plus size={16} /> Novo Board
           </button>
        </div>
      </header>

      {/* Kanban Metrics */}
      <div className="metric-row">
        <MetricHeaderCard title="Total de Cards" value={validatedDeals.length} icon={LayoutGrid} />
        <MetricHeaderCard title="Valor Total" value={formatCurrency(totalValue)} icon={DollarSign} />
        <MetricHeaderCard title="Cards Vencidos" value="1" icon={AlertCircle} color="#ef4444" />
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-6 overflow-x-auto pb-10 min-h-[600px] -mx-8 px-8 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageDeals = validatedDeals.filter(d => (d.stage || 'PROSPECT') === stage.id)
          const stageTotal = stageDeals.reduce((acc, d) => acc + (Number(d.valor) || 0), 0)

          return (
            <div key={stage.id} className="kanban-col">
              <div className="kanban-header">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: stage.color, boxShadow: `0 0 10px ${stage.color}60` }} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{stage.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10 text-white/40">{stageDeals.length}</Badge>
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
                          <h4 className="text-[13px] font-black uppercase tracking-tight text-white/80 group-hover:text-gold transition-colors truncate max-w-[160px]">{deal.titulo}</h4>
                          <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black tracking-widest">NOVO</Badge>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", deal.prioridade === 'ALTA' ? "bg-red-500" : "bg-amber-500")} />
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", deal.prioridade === 'ALTA' ? "text-red-400" : "text-amber-400")}>Prioridade {deal.prioridade || 'Média'}</span>
                       </div>

                       <div className="card-value">— {formatCurrency(deal.valor)}</div>

                       <div className="card-footer">
                          <div className="flex items-center gap-2 overflow-hidden">
                             <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[9px] font-black border border-white/10">{deal.contact?.nome?.[0] || 'S'}</div>
                             <span className="text-[9px] font-bold text-white/20 uppercase truncate">{deal.contact?.nome || 'Sem Contato'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/15">
                             <Calendar size={10} />
                             <span className="text-[9px] font-bold">21 de abr</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
                
                {/* Add Card Placeholder */}
                <button className="w-full py-4 border-2 border-dashed border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-all">
                  <Plus size={14} /> Adicionar Card
                </button>
              </div>
            </div>
          )
        })}

        {/* New Column Placeholder */}
        <div className="min-w-[320px] flex flex-col border-2 border-dashed border-white/5 rounded-3xl items-center justify-center gap-6 group hover:border-white/10 transition-all cursor-pointer" onClick={() => setShowAddColumn(true)}>
           <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white/40 transition-colors">
              <Plus size={24} strokeWidth={3} />
           </div>
           <span className="text-[12px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40">Nova Coluna</span>
        </div>
      </div>

      {/* --- Modals From Prints --- */}
      
      {/* New Column Modal */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="aether-dialog-content sm:max-w-[420px] border-none">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[1.25rem] font-black uppercase tracking-widest">Nova Coluna</h2>
            <DialogClose className="text-white/20 hover:text-white transition-colors">
              <X size={20} />
            </DialogClose>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome da Coluna</label>
              <Input placeholder="Ex: Em Negociação" className="aether-input h-14 bg-black/40 border-white/5 text-[14px]" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cor</label>
              <div className="flex flex-wrap gap-4">
                 {["#3b82f6", "#60a5fa", "#a855f7", "#f59e0b", "#ef4444", "#ec4899", "#10b981"].map(c => (
                   <button key={c} className="w-10 h-10 rounded-full border-2 border-white/5 hover:border-white/40 transition-all" style={{ backgroundColor: c }} />
                 ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button className="flex-1 aether-btn-secondary h-14 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all" onClick={() => setShowAddColumn(false)}>Cancelar</button>
               <button className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]">Criar Coluna</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Board Modal */}
      <Dialog open={showAddBoard} onOpenChange={setShowAddBoard}>
        <DialogContent className="aether-dialog-content sm:max-w-[420px] border-none">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[1.25rem] font-black uppercase tracking-widest">Novo Board</h2>
            <DialogClose className="text-white/20 hover:text-white transition-colors">
              <X size={20} />
            </DialogClose>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome do Board</label>
              <Input placeholder="Ex: Marketing, Parcerias..." className="aether-input h-14 bg-black/40 border-white/5 text-[14px]" />
            </div>

            <p className="text-[11px] text-white/20 italic font-bold">O novo board começará vazio. Adicione colunas depois.</p>

            <div className="flex gap-4 pt-4">
               <button className="flex-1 aether-btn-secondary h-14 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all" onClick={() => setShowAddBoard(false)}>Cancelar</button>
               <button className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]">Criar Board</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
