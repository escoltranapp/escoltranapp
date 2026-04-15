"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckSquare, Phone, Calendar, FileText, MessageCircle, Mail, Plus, Search, Check, Clock, CheckCircle2, AlertTriangle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// ─── Metric Card High-Fidelity ───────────────────────────────────────
function MetricActivityCard({
  title,
  value,
  icon: Icon,
  delay = "0s",
  color = "gold"
}: {
  title: string
  value: number
  icon: React.ElementType
  delay?: string
  color?: string
}) {
  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay, padding: '20px' }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label" style={{ opacity: 0.3 }}>{title}</span>
          <span className="metric-value font-mono" style={{ fontSize: '1.5rem' }}>{value.toString().padStart(2, '0')}</span>
        </div>
        <div className="metric-icon-wrap" style={{ width: '40px', height: '40px', color: color === 'gold' ? '#c9a227' : color }}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
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
  CALL: { icon: Phone, label: "Ligação", color: "#60a5fa" },
  MEETING: { icon: Calendar, label: "Reunião", color: "#c9a227" },
  TASK: { icon: CheckSquare, label: "Tarefa", color: "#fbbf24" },
  NOTE: { icon: FileText, label: "Nota", color: "#94a3b8" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "#4ade80" },
  EMAIL: { icon: Mail, label: "Email", color: "#f87171" },
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

  const toggleDone = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "OPEN" | "DONE" }) => {
      await fetch(`/api/activities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    },
    onSuccess: () => { toast({ title: "Status Atualizado" }); queryClient.invalidateQueries({ queryKey: ["activities"] }) },
  })

  const validatedActivities = Array.isArray(activities) ? activities : []
  const filtered = validatedActivities.filter(a => a.titulo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-aether space-y-12 pb-12">
      
      {/* Prime Header */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Célula de Atividades Ativa
          </div>
          <div>
            <h1 className="page-title">
              Monitor de <span>Produtividade</span> ⏱️
            </h1>
            <div className="page-subtitle">
              Sincronização Neural <span className="sep" /> 
              Pendentes: <span className="status font-black">{validatedActivities.filter(a => a.status === "OPEN").length}</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={20} strokeWidth={3} />
          Registrar Atividade
        </button>
      </header>

      {/* KPI Cluster */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {Object.entries(typeConfig).map(([type, config], i) => (
          <MetricActivityCard key={type} title={config.label} value={validatedActivities.filter(a => a.tipo === type).length} icon={config.icon} delay={`${0.1 + i * 0.05}s`} color={config.color} />
        ))}
      </div>

      {/* Table Section */}
      <div className="aether-table-wrap animate-aether">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex gap-4 p-1 bg-black/40 rounded-2xl border border-white/5">
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
           
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <Input placeholder="Filtrar base..." className="aether-input pl-12 h-12 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
        </div>

        <table className="aether-table w-full">
          <thead>
            <tr className="aether-table-header">
              <th>Atividade</th>
              <th className="hidden sm:table-cell">Protocolo</th>
              <th className="hidden md:table-cell">Integração</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-24 text-white/10 font-black uppercase tracking-widest text-xs">Nenhuma atividade registrada no ciclo</td></tr>
            ) : filtered.map((act) => {
              const cfg = typeConfig[act.tipo]
              const Icon = cfg.icon
              return (
                <tr key={act.id} className="group">
                  <td>
                    <div className="flex flex-col">
                      <span className={cn("font-black text-[14px] uppercase tracking-tight transition-all", act.status === 'DONE' ? "text-white/20 line-through" : "group-hover:text-gold")}>{act.titulo}</span>
                      <span className="text-[10px] uppercase font-black text-white/20 tracking-tight">{act.descricao || "Sem Detalhes"}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                     <span className="text-[9px] font-black uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full bg-white/[0.02] flex items-center gap-2 w-fit" style={{ color: cfg.color }}>
                       <Icon size={10} /> {cfg.label}
                     </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/30 truncate">
                         {act.contact?.nome?.[0] || '—'}
                       </div>
                       <span className="text-[11px] font-bold text-white/40 uppercase tracking-tight">{act.contact?.nome || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={act.status === "DONE" ? "ativa" : "novo"} className="text-[9px] uppercase font-black px-3">{act.status === "DONE" ? "Finalizada" : "Aberta"}</Badge>
                  </td>
                  <td className="text-right">
                    <button 
                      className={cn("h-10 w-10 flex items-center justify-center rounded-2xl border transition-all", 
                        act.status === 'OPEN' ? "border-white/5 bg-white/5 text-white/20 hover:text-gold hover:border-gold/30" : "border-gold/20 bg-gold/5 text-gold"
                      )}
                      onClick={() => toggleDone.mutate({ id: act.id, status: act.status === "OPEN" ? "DONE" : "OPEN" })}
                    >
                      <Check size={16} strokeWidth={3} />
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
