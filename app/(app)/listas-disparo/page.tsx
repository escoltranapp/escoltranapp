"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

function KPICard({
  label, value, icon, trend, color = "#ffc880"
}: {
  label: string; value: string | number; icon: string; trend?: string; color?: string
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-6 hover:bg-surface-container-high transition-all group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        {trend && (
           <div className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10">
              {trend}
           </div>
        )}
      </div>
      <div className="space-y-1">
         <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
         <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</div>
      </div>
    </div>
  )
}

interface Lista {
  id: string; nome: string; status: string; totalLeads: number; enviados: number; falhos: number; createdAt: string;
}

const statusLabel: Record<string, string> = {
  ATIVA: "Ativa", PAUSADA: "Pausada", EM_PROCESSAMENTO: "Disparando",
  CONCLUIDA: "Concluída", CANCELADA: "Cancelada", RASCUNHO: "Rascunho",
}

export default function ListasDisparoPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ nome: "", descricao: "", numeros: "" })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: listas = [], isLoading } = useQuery<Lista[]>({
    queryKey: ["listas-disparo"],
    queryFn: async () => {
      const res = await fetch("/api/listas-disparo")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const totalEnviados = listas.reduce((sum, l) => sum + l.enviados, 0)
  const totalLeads = listas.reduce((sum, l) => sum + l.totalLeads, 0)
  const taxaSucesso = totalLeads > 0 ? ((totalEnviados / totalLeads) * 100).toFixed(1) : "0"
  const emProgresso = listas.filter((l) => l.status === "EM_PROCESSAMENTO").length

  const createLista = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório")
      const numeros = form.numeros.split(/[\n,;]+/).map(n => n.trim()).filter(n => /^\+?[0-9\s\-()]{7,}$/.test(n))
      const res = await fetch("/api/listas-disparo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numeros }),
      })
      if (!res.ok) throw new Error("Falha ao criar lista")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lista criada com sucesso!" })
      setShowNew(false)
      setForm({ nome: "", descricao: "", numeros: "" })
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
  })

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* HEADER ESCOLTRAN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-white tracking-tight">Disparo em Massa</h1>
          <p className="text-slate-500 text-[14px] mt-1">Orquestração de campanhas e automação de fluxos massivos</p>
        </div>
        
        <button
          onClick={() => setShowNew(true)}
          className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-amber-500/10 text-[12px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">send</span>
          <span>Nova Campanha</span>
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <KPICard label="Campanhas" value={listas.length} icon="campaign" trend="Active Node" color="#ffc880" />
         <KPICard label="Em Execução" value={emProgresso} icon="bolt" trend="Live Process" color="#f5a623" />
         <KPICard label="Leads Atingidos" value={totalLeads} icon="group" trend="Volume" color="#adc6ff" />
         <KPICard label="Taxa Eficiência" value={`${taxaSucesso}%`} icon="query_stats" trend="Optimized" color="#7ae982" />
      </div>

      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
         <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">Campaign Overview Dataset</div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-surface-container-low/50">
                     <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Campanha</th>
                     <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Status</th>
                     <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Execution Pulse</th>
                     <th className="px-6 py-4 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Dataset</th>
                     <th className="px-6 py-4 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">Operação</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     [...Array(3)].map((_, i) => <tr key={i} className="h-20 animate-pulse border-b border-white/5 opacity-50"><td colSpan={5} className="px-6 bg-surface-container-high/20" /></tr>)
                  ) : listas.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-32 text-center opacity-20">
                           <span className="material-symbols-outlined text-[64px]">outbox</span>
                           <div className="font-mono text-[11px] uppercase tracking-widest mt-4">Nenhuma campanha orquestrada</div>
                        </td>
                     </tr>
                  ) : (
                     listas.map((lista) => {
                       const progress = lista.totalLeads > 0 ? ((lista.enviados + lista.falhos) / lista.totalLeads) * 100 : 0
                       return (
                         <tr key={lista.id} className="hover:bg-white/[0.01] transition-colors group">
                           <td className="px-6 py-6 border-b border-white/[0.03]">
                             <div className="font-bold text-white text-[15px]">{lista.nome}</div>
                             <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Cluster: {lista.id.slice(0, 8)}</div>
                           </td>
                           <td className="px-6 py-6 border-b border-white/[0.03]">
                             <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest",
                                lista.status === 'EM_PROCESSAMENTO' ? "bg-amber-500 text-black" : "bg-surface-container-high text-slate-500")}>
                                {statusLabel[lista.status] || lista.status}
                             </div>
                           </td>
                           <td className="px-6 py-6 border-b border-white/[0.03] w-64">
                              <div className="flex flex-col gap-2">
                                 <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
                                    <span>{progress.toFixed(0)}%</span>
                                    <span>{lista.enviados} Logs</span>
                                 </div>
                                 <div className="h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,166,35,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6 border-b border-white/[0.03] text-center">
                              <span className="font-mono text-[13px] font-bold text-slate-400">{lista.totalLeads}</span>
                           </td>
                           <td className="px-6 py-6 border-b border-white/[0.03] text-right">
                              <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                 <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                   <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                 </button>
                                 <button onClick={() => setConfirmDelete(lista.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                   <span className="material-symbols-outlined text-[20px]">delete</span>
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
      </div>
    </div>
  )
}
