"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckSquare, Phone, Calendar, FileText, MessageCircle, Mail, Plus, Search, Check, Clock, CheckCircle2, AlertTriangle, Zap, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

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

interface Activity {
  id: string; tipo: "CALL" | "MEETING" | "TASK" | "NOTE" | "WHATSAPP" | "EMAIL"; status: "OPEN" | "DONE";
  titulo: string; descricao?: string | null; dueAt?: string | null; createdAt: string;
  contact?: { nome: string; sobrenome?: string | null } | null;
}

const typeConfig = {
  CALL: { icon: Phone, label: "LIGAÇÃO", color: "#60a5fa" },
  MEETING: { icon: Calendar, label: "REUNIÃO", color: "#c9a227" },
  TASK: { icon: CheckSquare, label: "TAREFA", color: "#fbbf24" },
  NOTE: { icon: FileText, label: "NOTA", color: "#94a3b8" },
  WHATSAPP: { icon: MessageCircle, label: "WHATSAPP", color: "#4ade80" },
  EMAIL: { icon: Mail, label: "EMAIL", color: "#f87171" },
}

export default function ActivitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "OPEN" | "DONE">("all")
  const [showNew, setShowNew] = useState(false)

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["activities", filter],
    queryFn: async () => {
      const p = new URLSearchParams(); if (filter !== "all") p.set("status", filter)
      const res = await fetch(`/api/activities?${p}`)
      return res.json()
    },
    staleTime: 15_000,
  })

  const validatedActivities = Array.isArray(activities) ? activities : []

  const toggleDone = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "OPEN" | "DONE" }) => {
      await fetch(`/api/activities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    },
    onSuccess: () => { toast({ title: "Status Atualizado" }); queryClient.invalidateQueries({ queryKey: ["activities"] }) },
  })

  const filtered = validatedActivities.filter(a => a.titulo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-col lg:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 w-fit">
             <LayoutGrid size={10} className="text-gold" />
             <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Operações de Venda</span>
          </div>
          <div>
            <h1 className="page-title">Monitor de <span>Atividades</span></h1>
            <div className="page-subtitle text-white/20 mt-2 font-bold uppercase tracking-widest text-[10px]">
              Visão Cronológica <span className="mx-2 opacity-10">•</span> 
              Pendentes: <span className="text-gold font-black">{validatedActivities.filter(a => a.status === "OPEN").length}</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary h-12 px-8" onClick={() => setShowNew(true)}>
          <Plus size={20} strokeWidth={3} /> Registrar Atividade
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="metric-row">
        {Object.entries(typeConfig).slice(0, 4).map(([type, config], i) => (
          <MetricHeaderCard key={type} title={config.label} value={validatedActivities.filter(a => a.tipo === type).length.toString().padStart(2, '0')} icon={config.icon} />
        ))}
      </div>

      {/* Table Section */}
      <div className="aether-table-wrap animate-aether bg-white/[0.01]">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/5">
              {(["all", "OPEN", "DONE"] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                  f === filter ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40 hover:bg-white/5")}
                >
                  {f === "all" ? "Geral" : f === "OPEN" ? "Abertas" : "Finalizadas"}
                </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" />
              <Input placeholder="Localizar atividade..." className="aether-input pl-12 h-14 bg-black border-white/5 text-[13px] uppercase tracking-wide font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
        </div>

        <table className="aether-table w-full">
          <thead>
            <tr className="aether-table-header">
              <th className="pl-10">Descrição da Operação</th>
              <th className="hidden sm:table-cell">Natureza</th>
              <th className="hidden md:table-cell">Protocolo Associado</th>
              <th>Status</th>
              <th className="text-right pr-10">Controle</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-32 text-white/10 font-black uppercase tracking-widest text-[11px]">Nenhuma atividade operacional no ciclo</td></tr>
            ) : filtered.map((act) => {
              const cfg = typeConfig[act.tipo]
              const Icon = cfg.icon
              return (
                <tr key={act.id} className="group border-b border-white/[0.01] hover:bg-white/[0.01] transition-colors">
                  <td className="pl-10 py-6">
                    <div className="flex flex-col">
                      <span className={cn("font-black text-[14px] uppercase tracking-tight transition-all", act.status === 'DONE' ? "text-white/15 line-through" : "text-white/90 group-hover:text-gold")}>{act.titulo}</span>
                      <span className="text-[10px] uppercase font-black text-white/15 tracking-widest mt-0.5">{act.descricao || "Sem Detalhes Operacionais"}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                     <span className="text-[9px] font-black uppercase tracking-widest border border-white/5 px-4 py-1.5 rounded-full bg-white/[0.02] flex items-center gap-3 w-fit" style={{ color: cfg.color }}>
                       <Icon size={12} /> {cfg.label}
                     </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-xl bg-black border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20">
                         {act.contact?.nome?.[0] || '—'}
                       </div>
                       <span className="text-[11px] font-black text-white/30 uppercase tracking-tight">{act.contact?.nome || 'Monitoramento Global'}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={act.status === "DONE" ? "ativa" : "novo"} className="text-[9px] uppercase font-black px-4 py-1 tracking-widest">{act.status === "DONE" ? "Sincronizada" : "Pendente"}</Badge>
                  </td>
                  <td className="text-right pr-10">
                    <button 
                      className={cn("h-11 w-11 flex items-center justify-center rounded-2xl border transition-all shadow-inner", 
                        act.status === 'OPEN' ? "border-white/5 bg-white/5 text-white/10 hover:text-gold hover:border-gold/60" : "border-gold/40 bg-gold/10 text-gold shadow-[0_0_15px_rgba(201,162,39,0.2)]"
                      )}
                      onClick={() => toggleDone.mutate({ id: act.id, status: act.status === "OPEN" ? "DONE" : "OPEN" })}
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
