"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Send, Plus, Play, Pause, Users, CheckCircle, XCircle, Activity, TrendingUp, Sparkles, LayoutGrid, Rocket, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, subtext, icon: Icon, trend, color = "var(--accent-primary)"
}: {
  label: string; value: string | number; subtext: string; icon: React.ElementType; trend?: string; color?: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-label-row">
        <span className="kpi-label">{label}</span>
        {trend && (
           <span className={cn("kpi-trend", trend.includes('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
              {trend}
           </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtext">{subtext}</div>
    </div>
  )
}

interface Lista {
  id: string; nome: string; status: string; totalLeads: number; enviados: number; falhos: number; createdAt: string;
}

const emptyForm = { nome: "", descricao: "", numeros: "" }

const statusLabel: Record<string, string> = {
  ATIVA: "Ativa", PAUSADA: "Pausada", EM_PROCESSAMENTO: "Disparando",
  CONCLUIDA: "Concluída", CANCELADA: "Cancelada", RASCUNHO: "Rascunho",
}

export default function ListasDisparoPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: listas = [], isLoading } = useQuery<Lista[]>({
    queryKey: ["listas-disparo"],
    queryFn: async () => {
      const res = await fetch("/api/listas-disparo")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
    refetchInterval: 10_000,
  })

  const totalEnviados = listas.reduce((sum, l) => sum + l.enviados, 0)
  const totalLeads = listas.reduce((sum, l) => sum + l.totalLeads, 0)
  const taxaSucesso = totalLeads > 0 ? ((totalEnviados / totalLeads) * 100).toFixed(1) : "0"
  const emProgresso = listas.filter((l) => l.status === "EM_PROCESSAMENTO").length

  const createLista = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório")
      const numeros = form.numeros
        .split(/[\n,;]+/)
        .map(n => n.trim())
        .filter(n => /^\+?[0-9\s\-()]{7,}$/.test(n))
      const res = await fetch("/api/listas-disparo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, descricao: form.descricao, numeros }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar lista")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lista criada com sucesso!" })
      setShowNew(false)
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/listas-disparo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao atualizar lista")
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listas-disparo"] }),
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  const deleteLista = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listas-disparo/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao excluir")
      }
    },
    onSuccess: () => {
      toast({ title: "Lista excluída." })
      setConfirmDelete(null)
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: (err: Error) => toast({ variant: "destructive", title: err.message }),
  })

  const getNextStatus = (status: string) => {
    if (status === "EM_PROCESSAMENTO") return "PAUSADA"
    if (status === "PAUSADA" || status === "ATIVA" || status === "RASCUNHO") return "EM_PROCESSAMENTO"
    return null
  }

  const phoneCount = form.numeros
    .split(/[\n,;]+/)
    .map(n => n.trim())
    .filter(n => /^\+?[0-9\s\-()]{7,}$/.test(n)).length

  return (
    <div className="page-container animate-aether">

      {/* HEADER */}
      <header className="page-header-wrapper">
        <div>
          <div className="breadcrumb-pill">
            <Send size={12} /> PROTOCOLOS DE COMUNICAÇÃO
          </div>
          <h1 className="page-title-h1">Disparo em Massa</h1>
          <p className="page-subtitle">Orquestração de campanhas massivas e automação de fluxos de saída</p>
        </div>
        <button className="btn-cta-primary flex items-center gap-2" onClick={() => setShowNew(true)}>
           <Plus size={18} /> Nova Lista
        </button>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid">
         <KPICard label="Campanhas" value={listas.length} subtext="Dataset de disparos ativos" icon={Send} color="#d4af37" />
         <KPICard label="Disparando" value={emProgresso} subtext="Execuções em tempo real" icon={Activity} color="#10b981" />
         <KPICard label="Total Leads" value={totalLeads} subtext="Contatos atingidos no cluster" icon={Users} color="#f59e0b" />
         <KPICard label="Taxa Flow" value={`${taxaSucesso}%`} subtext="Eficiência de entrega global" icon={TrendingUp} color="#a855f7" />
      </div>

      {/* TABELA */}
      <div className="enterprise-table-wrapper">
         <div className="table-header-label">Campaign Overview</div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Campanha</th>
                  <th>Fase</th>
                  <th>Execution Pulse</th>
                  <th className="text-center">Volumetria</th>
                  <th className="text-right">Ações</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="h-16 animate-pulse bg-white/5"><td colSpan={5} /></tr>)
               ) : listas.length === 0 ? (
                  <tr>
                     <td colSpan={5}>
                        <div className="empty-state-container">
                           <Rocket className="empty-state-icon" style={{ opacity: 0.1 }} />
                           <div className="empty-state-title">Nenhuma campanha orquestrada</div>
                           <div className="empty-state-sub">Crie sua primeira lista de disparos para iniciar a operação</div>
                           <button className="btn-cta-primary mt-6 bg-white/10 hover:bg-white/20 text-white" onClick={() => setShowNew(true)}>Criar primeira lista</button>
                        </div>
                     </td>
                  </tr>
               ) : (
                  listas.map((lista) => {
                    const progress = lista.totalLeads > 0 ? ((lista.enviados + lista.falhos) / lista.totalLeads) * 100 : 0
                    const nextStatus = getNextStatus(lista.status)
                    const isRunning = lista.status === "EM_PROCESSAMENTO"
                    return (
                      <tr key={lista.id} className="enterprise-table-row">
                        <td>
                          <div className="font-bold text-white/90">{lista.nome}</div>
                          <div className="text-[10px] text-white/20 uppercase font-black mt-1">ID: {lista.id.slice(0, 8)}</div>
                        </td>
                        <td>
                          <div className={cn("status-badge",
                             lista.status === 'CONCLUIDA' ? "bg-green-500/10 text-green-500 border border-green-500/20"
                             : lista.status === 'EM_PROCESSAMENTO' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                             : lista.status === 'CANCELADA' ? "bg-red-500/10 text-red-400 border border-red-500/20"
                             : "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20")}>
                             <span className={cn("dot",
                               lista.status === 'CONCLUIDA' ? "bg-green-500"
                               : lista.status === 'EM_PROCESSAMENTO' ? "bg-blue-400 animate-pulse"
                               : lista.status === 'CANCELADA' ? "bg-red-400"
                               : "bg-[#d4af37]")} />
                             {statusLabel[lista.status] || lista.status}
                          </div>
                        </td>
                        <td className="w-48">
                           <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase">
                                 <span>{progress.toFixed(0)}%</span>
                                 <span>{lista.enviados} / {lista.totalLeads}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#d4af37] transition-all" style={{ width: `${progress}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="text-center font-mono text-[12px] text-white/40">{lista.totalLeads}</td>
                        <td className="text-right">
                           <div className="flex justify-end gap-2">
                              {nextStatus && lista.status !== "CONCLUIDA" && lista.status !== "CANCELADA" && (
                                <button
                                  onClick={() => changeStatus.mutate({ id: lista.id, status: nextStatus })}
                                  disabled={changeStatus.isPending}
                                  title={isRunning ? "Pausar" : "Iniciar"}
                                  className="p-2 text-white/30 hover:text-[#d4af37] transition-colors disabled:opacity-40"
                                >
                                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmDelete(lista.id)}
                                className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    )
                  })
               )}
            </tbody>
         </table>
      </div>

      {/* MODAL NOVA LISTA */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-white">Nova Lista de Disparo</h2>
              <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nome da campanha *</label>
                <input
                  placeholder="Ex: Campanha Julho 2025"
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Descrição</label>
                <input
                  placeholder="Objetivo da campanha..."
                  value={form.descricao}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Números de telefone
                  {phoneCount > 0 && <span className="ml-2 text-[#d4af37]">({phoneCount} válidos)</span>}
                </label>
                <textarea
                  placeholder={"Cole os números aqui (um por linha ou separados por vírgula):\n11999999999\n21988888888"}
                  value={form.numeros}
                  onChange={e => setForm(p => ({ ...p, numeros: e.target.value }))}
                  rows={5}
                  className="w-full bg-[#0a0c10] border border-white/5 rounded-lg p-3 text-[13px] text-white resize-none focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowNew(false)} className="h-10 px-6 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button
                onClick={() => createLista.mutate()}
                disabled={createLista.isPending || !form.nome.trim()}
                className="h-10 px-6 btn-cta-primary text-[11px] font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createLista.isPending ? "Criando..." : "Criar Lista"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-white">Confirmar Exclusão</h2>
            <p className="text-white/40 text-[13px]">Esta ação é irreversível. A lista e todos os dados de envio serão removidos permanentemente.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="h-10 px-6 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold uppercase text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button
                onClick={() => deleteLista.mutate(confirmDelete)}
                disabled={deleteLista.isPending}
                className="h-10 px-6 bg-red-500/20 border border-red-500/30 rounded-lg text-[11px] font-bold uppercase text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-40"
              >
                {deleteLista.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
