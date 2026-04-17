"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// ─── Types ───────────────────────────────────────────────────────────────────
interface ListaDisparo {
  id: string
  nome: string
  descricao: string | null
  status: "RASCUNHO" | "ATIVA" | "EM_PROCESSAMENTO" | "CONCLUIDA" | "CANCELADA" | "PAUSADA"
  totalLeads: number
  enviados: number
  falhos: number
  pendentes: number
  createdAt: string
}

const STATUS_LABELS: Record<ListaDisparo["status"], string> = {
  RASCUNHO: "Rascunho",
  ATIVA: "Ativa",
  EM_PROCESSAMENTO: "Disparando",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
  PAUSADA: "Pausada",
}

const STATUS_STYLES: Record<ListaDisparo["status"], string> = {
  RASCUNHO: "bg-[#262626] text-[#6B7280] border-white/5",
  ATIVA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EM_PROCESSAMENTO: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
  CONCLUIDA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELADA: "bg-red-500/10 text-red-400 border-red-500/20",
  PAUSADA: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

// ─── Create Campaign Dialog ───────────────────────────────────────────────────
function CreateCampaignDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast()
  const [nome, setNome] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [telefones, setTelefones] = useState("")
  const [intervalo, setIntervalo] = useState(15)
  const [horarioComercial, setHorarioComercial] = useState(false)
  const [horaInicio, setHoraInicio] = useState("08:00")
  const [horaFim, setHoraFim] = useState("18:00")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" })
      return
    }
    if (!mensagem.trim()) {
      toast({ title: "Mensagem obrigatória", variant: "destructive" })
      return
    }

    const phoneList = telefones
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length >= 8)

    if (phoneList.length === 0) {
      toast({ title: "Adicione pelo menos um telefone válido", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/listas-disparo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefones: phoneList,
          configEnvio: {
            mensagem: mensagem.trim(),
            intervalo_segundos: intervalo,
            horario_comercial: horarioComercial,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            dias_semana: ["seg", "ter", "qua", "qui", "sex"],
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erro ao criar campanha")
      }

      toast({ title: "Campanha criada com sucesso!" })
      onCreated()
      onClose()
    } catch (e: unknown) {
      toast({
        title: "Erro",
        description: e instanceof Error ? e.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-widest text-white">Nova Campanha</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
              Nome da Campanha *
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Campanha Abril 2025"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors"
            />
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
              Mensagem WhatsApp *
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Olá {nome}, temos uma oferta especial para você..."
              rows={4}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors resize-none"
            />
            <p className="text-[9px] text-[#404040] mt-1 font-mono">Use {"{nome}"} para personalizar com o nome do lead</p>
          </div>

          {/* Telefones */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
              Telefones (um por linha) *
            </label>
            <textarea
              value={telefones}
              onChange={(e) => setTelefones(e.target.value)}
              placeholder={"(62) 99999-0001\n(11) 98888-0002\n5562999990003"}
              rows={5}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors resize-none font-mono"
            />
            <p className="text-[9px] text-[#404040] mt-1 font-mono">
              {telefones.split("\n").filter((t) => t.trim().length >= 8).length} telefone(s) válido(s)
            </p>
          </div>

          {/* Intervalo */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
              Intervalo entre envios (segundos)
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors"
            />
          </div>

          {/* Horário Comercial */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white">Horário Comercial</p>
              <p className="text-[9px] text-[#6B7280] font-mono mt-0.5">Enviar apenas em horário definido</p>
            </div>
            <button
              onClick={() => setHorarioComercial(!horarioComercial)}
              className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                horarioComercial ? "bg-[#F97316]" : "bg-[#262626]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
                  horarioComercial ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>

          {horarioComercial && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
                  Hora início
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-1.5">
                  Hora fim
                </label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F97316] transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#F97316] text-white hover:bg-[#EA6C10] disabled:opacity-50 transition-all"
          >
            {loading ? "Criando..." : "Criar Campanha"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListasDisparoPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: listas = [], isLoading } = useQuery<ListaDisparo[]>({
    queryKey: ["listas-disparo"],
    queryFn: async () => {
      const res = await fetch("/api/listas-disparo")
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: (query) => {
      const data = query.state.data as ListaDisparo[] | undefined
      return data?.some((l) => l.status === "EM_PROCESSAMENTO") ? 5000 : false
    },
  })

  const disparar = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listas-disparo/${id}/disparar`, { method: "POST" })
      
      let body
      try {
        body = await res.json()
      } catch (e) {
        throw new Error(`Falha no servidor (${res.status}). Verifique os logs do Easypanel.`)
      }

      if (!res.ok) throw new Error(body.error || "Erro ao disparar")
      return body
    },
    onSuccess: (data) => {
      toast({ title: `Disparo iniciado — ${data.totalLeads} leads enviados ao N8n` })
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao disparar", description: e.message, variant: "destructive" })
    },
  })

  const cancelar = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listas-disparo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADA" }),
      })
      if (!res.ok) throw new Error("Erro ao cancelar")
    },
    onSuccess: () => {
      toast({ title: "Campanha cancelada" })
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: () => toast({ title: "Erro ao cancelar", variant: "destructive" }),
  })

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listas-disparo/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir")
    },
    onSuccess: () => {
      toast({ title: "Campanha excluída" })
      queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })
    },
    onError: () => toast({ title: "Erro ao excluir", variant: "destructive" }),
  })

  return (
    <>
      <Toaster />
      {showCreate && (
        <CreateCampaignDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ["listas-disparo"] })}
        />
      )}

      <div className="animate-in fade-in duration-700 pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
              Disparo em Massa
            </h1>
            <p className="text-[#6B7280] text-[15px] mt-2 font-bold tracking-tight">
              Automação de campanhas via WhatsApp com N8n
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 text-[12px] uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[20px] font-black">send</span>
            <span>Nova Campanha</span>
          </button>
        </header>

        {/* Stats */}
        {listas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total de Campanhas", value: listas.length, icon: "campaign" },
              {
                label: "Em Disparo",
                value: listas.filter((l) => l.status === "EM_PROCESSAMENTO").length,
                icon: "rocket_launch",
                highlight: true,
              },
              {
                label: "Mensagens Enviadas",
                value: listas.reduce((s, l) => s + l.enviados, 0),
                icon: "check_circle",
              },
              {
                label: "Leads no Total",
                value: listas.reduce((s, l) => s + l.totalLeads, 0),
                icon: "group",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "bg-[#1A1A1A] border rounded-2xl p-5",
                  stat.highlight ? "border-[#F97316]/20" : "border-white/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#404040]">{stat.label}</p>
                  <span
                    className={cn(
                      "material-symbols-outlined text-[18px]",
                      stat.highlight ? "text-[#F97316]" : "text-[#404040]"
                    )}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0A]">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">
                  Campanha
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">
                  Progresso
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-[#404040] border-b border-[#262626] font-mono">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-[#F97316]/20 border-t-[#F97316] rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && listas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-[#262626] block mb-3">
                      campaign
                    </span>
                    <p className="text-[#404040] text-sm font-black uppercase tracking-widest">
                      Nenhuma campanha criada
                    </p>
                    <p className="text-[#262626] text-[10px] font-mono mt-1">
                      Clique em &quot;Nova Campanha&quot; para começar
                    </p>
                  </td>
                </tr>
              )}

              {listas.map((lista) => {
                const progress =
                  lista.totalLeads > 0
                    ? Math.round(((lista.enviados + lista.falhos) / lista.totalLeads) * 100)
                    : 0
                const isProcessing = lista.status === "EM_PROCESSAMENTO"
                const canDisparar = lista.status === "RASCUNHO" || lista.status === "ATIVA"
                const canCancel = lista.status === "EM_PROCESSAMENTO" || lista.status === "PAUSADA"

                return (
                  <tr
                    key={lista.id}
                    className="hover:bg-[#F97316]/5 transition-all group border-b border-[#262626]/50"
                  >
                    <td className="px-6 py-5">
                      <div className="font-black text-white text-[14px] tracking-tight uppercase italic">
                        {lista.nome}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-[#404040] font-mono uppercase tracking-widest">
                          {lista.totalLeads} leads
                        </span>
                        {lista.enviados > 0 && (
                          <span className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest">
                            {lista.enviados} enviados
                          </span>
                        )}
                        {lista.falhos > 0 && (
                          <span className="text-[9px] text-red-500 font-mono uppercase tracking-widest">
                            {lista.falhos} falhos
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          STATUS_STYLES[lista.status]
                        )}
                      >
                        {isProcessing && (
                          <span className="inline-block w-1.5 h-1.5 bg-[#F97316] rounded-full mr-1.5 animate-pulse" />
                        )}
                        {STATUS_LABELS[lista.status]}
                      </span>
                    </td>

                    <td className="px-6 py-5 w-56">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[9px] font-mono font-black text-[#404040]">
                          <span>{progress}%</span>
                          <span>
                            {lista.enviados + lista.falhos}/{lista.totalLeads}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-white/5">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000",
                              lista.status === "CONCLUIDA"
                                ? "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                                : "bg-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1">
                        {canDisparar && (
                          <button
                            onClick={() => disparar.mutate(lista.id)}
                            disabled={disparar.isPending}
                            title="Disparar campanha"
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#404040] hover:text-[#F97316] hover:bg-[#F97316]/10 transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => cancelar.mutate(lista.id)}
                            disabled={cancelar.isPending}
                            title="Cancelar disparo"
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#404040] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                          </button>
                        )}

                        {!isProcessing && (
                          <button
                            onClick={() => {
                              if (confirm(`Excluir "${lista.nome}"?`)) excluir.mutate(lista.id)
                            }}
                            disabled={excluir.isPending}
                            title="Excluir campanha"
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#404040] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* N8n Integration note */}
        <p className="text-[9px] text-[#262626] font-mono mt-4 text-center uppercase tracking-widest">
          Disparos processados via N8n + UazAPI · Callback: /api/disparos/callback
        </p>
      </div>
    </>
  )
}
