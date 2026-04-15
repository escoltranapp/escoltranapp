"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckSquare, Phone, Calendar, FileText, MessageCircle, Mail, Plus, Search, Check, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// ─── Metric Card Component ──────────────────────────────────────────
function MetricCard({
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
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{value.toString().padStart(2, '0')}</span>
        </div>
        <div className="metric-icon-wrap" style={{ color: color === 'gold' ? '#c9a227' : 'rgba(255,255,255,0.4)' }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

interface Activity {
  id: string
  tipo: "CALL" | "MEETING" | "TASK" | "NOTE" | "WHATSAPP" | "EMAIL"
  status: "OPEN" | "DONE"
  titulo: string
  descricao?: string | null
  dueAt?: string | null
  doneAt?: string | null
  createdAt: string
  contact?: { nome: string; sobrenome?: string | null } | null
  deal?: { titulo: string } | null
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
  const [form, setForm] = useState({ tipo: "TASK", titulo: "", descricao: "", dueAt: "" })

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["activities", filter],
    queryFn: async () => {
      const p = new URLSearchParams(); if (filter !== "all") p.set("status", filter)
      const res = await fetch(`/api/activities?${p}`)
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const toggleDone = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "OPEN" | "DONE" }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    onSuccess: () => { toast({ title: "Atividade atualizada" }); queryClient.invalidateQueries({ queryKey: ["activities"] }) },
  })

  const createActivity = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    onSuccess: () => { toast({ title: "Atividade registrada." }); setShowNew(false); queryClient.invalidateQueries({ queryKey: ["activities"] }) },
  })

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase()
    return !q || a.titulo.toLowerCase().includes(q) || (a.contact ? `${a.contact.nome} ${a.contact.sobrenome || ""}`.toLowerCase().includes(q) : false)
  })

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Célula de Atividades
          </div>
          <div>
            <h1 className="page-title">
              Monitor de <span>Produtividade</span>
            </h1>
            <div className="page-subtitle">
              Sincronização Neurais <span className="sep" /> 
              Pendentes: <span className="status">{activities.filter(a => a.status === "OPEN").length}</span>
            </div>
          </div>
        </div>

        <button className="aether-btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={18} strokeWidth={3} />
          Registrar Atividade
        </button>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(typeConfig).map(([type, config], i) => (
          <MetricCard key={type} title={config.label} value={activities.filter(a => a.tipo === type).length} icon={config.icon} delay={`${0.1 + i * 0.05}s`} color={config.color} />
        ))}
      </div>

      {/* Listing Area */}
      <div className="aether-table-wrap">
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
             {(["all", "OPEN", "DONE"] as const).map(f => (
               <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", filter === f ? "bg-gold text-black" : "text-white/30 hover:text-white hover:bg-white/5")}>
                 {f === "all" ? "Geral" : f === "OPEN" ? "Abertas" : "Finalizadas"}
               </button>
             ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input placeholder="Filtrar fluxo..." className="aether-input pl-10 h-10 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="aether-table w-full border-collapse">
          <thead className="aether-table-header">
            <tr>
              <th>Atividade</th>
              <th className="hidden sm:table-cell">Protocolo</th>
              <th className="hidden md:table-cell">Entidade</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5 border-b border-white/5"><td colSpan={5} /></tr>)
            ) : filtered.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-20 text-white/20 font-mono text-xs uppercase tracking-widest">Nenhuma atividade registrada</td></tr>
            ) : filtered.map((activity) => {
              const cfg = typeConfig[activity.tipo]
              const Icon = cfg.icon
              return (
                <tr key={activity.id} className="group">
                  <td>
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-[13px] uppercase tracking-tight", activity.status === "DONE" && "line-through opacity-30")}>{activity.titulo}</span>
                      <span className="text-[10px] text-white/30 italic truncate max-w-[200px]">{activity.descricao || "Sem detalhes"}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                     <span className="text-[9px] font-black uppercase tracking-widest border border-white/5 px-2 py-1 rounded bg-white/5 flex items-center gap-2 w-fit" style={{ color: cfg.color }}>
                       <Icon size={10} /> {cfg.label}
                     </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="text-[11px] font-bold text-white/60">{activity.contact ? `${activity.contact.nome} ${activity.contact.sobrenome || ""}` : "—"}</span>
                  </td>
                  <td>
                    <Badge variant={activity.status === "DONE" ? "ativa" : "novo"} className="text-[9px] uppercase font-black">{activity.status === "DONE" ? "Finalizada" : "Aberta"}</Badge>
                  </td>
                  <td className="text-right">
                    <button 
                      className={cn("aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center transition-all", activity.status === "OPEN" ? "hover:text-gold" : "opacity-20")}
                      onClick={() => toggleDone.mutate({ id: activity.id, status: activity.status === "OPEN" ? "DONE" : "OPEN" })}
                    >
                      <Check size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-[480px] bg-surface-overlay border-border-strong p-0 overflow-hidden">
           <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Registro de Atividade</DialogTitle>
            <DialogDescription className="text-xs font-medium text-white/30 uppercase mt-1 tracking-widest">Alocação de Recurso Temporal</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
             <div className="space-y-4">
               <div>
                 <label className="aether-label">Tipo de Atividade</label>
                 <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                   <SelectTrigger className="aether-input"><SelectValue /></SelectTrigger>
                   <SelectContent className="bg-surface-overlay border-border-strong">
                     {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-[10px] font-black uppercase">{v.label}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <label className="aether-label">Assunto</label>
                 <Input className="aether-input" placeholder="O que precisa ser feito?" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
               </div>
               <div>
                 <label className="aether-label">Deadline</label>
                 <Input className="aether-input" type="datetime-local" value={form.dueAt} onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))} />
               </div>
             </div>
          </div>
          <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
             <button className="aether-btn-secondary" onClick={() => setShowNew(false)}>Abortar</button>
             <button className="aether-btn-primary" onClick={() => createActivity.mutate()}>Alocar Atividade</button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
