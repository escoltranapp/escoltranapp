"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Kanban, DollarSign, AlertTriangle, Search, User, Calendar as CalendarIcon, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// ─── Metric Card Component ──────────────────────────────────────────
function MetricCard({
  title,
  value,
  icon: Icon,
  format = "number",
  delay = "0s",
}: {
  title: string
  value: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
}) {
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  return (
    <div className="aether-card metric-card animate-aether" style={{ animationDelay: delay }}>
      <div className="metric-top">
        <div className="metric-label-group">
          <span className="metric-label">{title}</span>
          <span className="metric-value">{formatted}</span>
        </div>
        <div className="metric-icon-wrap">
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="metric-footer">
        <span className="text-white/20 italic tracking-widest text-[9px] uppercase">Monitorando Fluxo</span>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [dealForm, setDealForm] = useState({
    titulo: "",
    valorEstimado: "",
    prioridade: "MEDIA",
    origem: "",
    stageId: "",
    contactId: "",
    dataPrevista: "",
    descricao: "",
  })

  const [showNewStage, setShowNewStage] = useState(false)
  const [stageForm, setStageForm] = useState({
    name: "",
    color: "#c9a227",
  })

  const [openContactSearch, setOpenContactSearch] = useState(false)
  const [contactSearch, setContactSearch] = useState("")

  const predefineColors = [
    { name: "Gold", value: "#c9a227" },
    { name: "Deep Navy", value: "#1a2a44" },
    { name: "Verde", value: "#22C55E" },
    { name: "Vermelho", value: "#EF4444" },
    { name: "Roxo", value: "#8B5CF6" },
  ]

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const res = await fetch("/api/pipeline/stages")
      if (!res.ok) throw new Error("Falha ao carregar pipeline")
      return res.json() as Promise<{ stages: Stage[]; pipelineId: string; pipelineName: string }>
    },
    staleTime: 10_000,
  })

  const { data: contactsData } = useQuery({
    queryKey: ["contacts-search", contactSearch],
    queryFn: async () => {
      if (!contactSearch && !openContactSearch) return { contacts: [] }
      const res = await fetch(`/api/contacts?search=${contactSearch}&limit=5`)
      if (!res.ok) return { contacts: [] }
      return res.json()
    },
    enabled: openContactSearch,
  })

  const createDeal = useMutation({
    mutationFn: async () => {
      if (!dealForm.titulo.trim()) throw new Error("Título obrigatório")
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dealForm,
          pipelineId: data?.pipelineId,
          stageId: dealForm.stageId || data?.stages[0]?.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar deal")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Deal criado com sucesso!" })
      setShowNewDeal(false)
      setDealForm({ titulo: "", valorEstimado: "", prioridade: "MEDIA", origem: "", stageId: "", contactId: "", dataPrevista: "", descricao: "" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const createStage = useMutation({
    mutationFn: async () => {
      if (!stageForm.name.trim()) throw new Error("Nome obrigatório")
      const res = await fetch("/api/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...stageForm,
          pipelineId: data?.pipelineId,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Falha ao criar coluna")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Coluna criada com sucesso!" })
      setShowNewStage(false)
      setStageForm({ name: "", color: "#c9a227" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      })
      if (!res.ok) throw new Error("Falha ao mover deal")
      return res.json()
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao mover deal" })
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] })
    },
  })

  const stages: Stage[] = data?.stages || []
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.filter((d) => d.status === "OPEN").length, 0)
  const totalValue = stages.reduce(
    (sum, s) => sum + s.deals.filter((d) => d.status === "OPEN").reduce((sv, d) => sv + (d.valorEstimado || 0), 0),
    0
  )

  const overdueDeals = stages.reduce(
    (sum, s) =>
      sum +
      s.deals.filter((d) => {
        if (d.status !== "OPEN") return false
        if (!d.dataPrevista) {
          const age = Date.now() - new Date(d.createdAt).getTime()
          return age > 30 * 24 * 3600 * 1000
        }
        return new Date(d.dataPrevista).getTime() < Date.now()
      }).length,
    0
  )

  const handleAddDeal = (stageId: string) => {
    setDealForm(p => ({ ...p, stageId }))
    setShowNewDeal(true)
  }

  const selectedContact = contactsData?.contacts?.find((c: any) => c.id === dealForm.contactId)

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Pipeline Comercial Ativo
          </div>
          <div>
            <h1 className="page-title">
              Pipeline <span>Visão Kanban</span>
            </h1>
            <div className="page-subtitle">
              Gestão de Oportunidades <span className="sep" /> 
              Filtro: <span className="status">{data?.pipelineName || "Todos"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Select defaultValue="main">
            <SelectTrigger className="aether-btn-secondary w-40 h-10 border-white/5 lowercase text-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-overlay border-border-strong">
              <SelectItem value="main">Pipeline Principal</SelectItem>
            </SelectContent>
          </Select>
          <button className="aether-btn-primary" onClick={() => setShowNewDeal(true)}>
            <Plus size={18} strokeWidth={3} />
            Novo Deal
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total de Cards" value={totalDeals} icon={Kanban} delay="0.1s" />
        <MetricCard title="Valor Total" value={totalValue} icon={DollarSign} format="currency" delay="0.2s" />
        <MetricCard title="Overdue (+30d)" value={overdueDeals} icon={AlertTriangle} delay="0.3s" />
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 min-h-[600px] overflow-hidden">
        {isLoading ? (
          <div className="flex gap-4 h-full">
            {[...Array(4)].map((_, i) => <div key={i} className="w-72 h-full bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <AlertTriangle className="text-red-500 mb-4" size={40} />
            <p className="text-sm font-mono uppercase tracking-widest text-white/40">Erro na sincronização do Pipeline</p>
            <Button variant="ghost" className="mt-4" onClick={() => refetch()}>Tentar reconectar</Button>
          </div>
        ) : (
          <KanbanBoard
            stages={stages}
            onDealMove={(dealId, _from, toStageId) =>
              moveDeal.mutate({ dealId, stageId: toStageId })
            }
            onAddDeal={handleAddDeal}
            onAddStage={() => setShowNewStage(true)}
          />
        )}
      </div>

      {/* Modal Novo Deal */}
      <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
        <DialogContent className="sm:max-w-[550px] bg-surface-overlay border-border-strong p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Inserir Nova Oportunidade</DialogTitle>
            <DialogDescription className="text-xs font-medium text-white/30 uppercase mt-1 tracking-widest">Protocolo de Registro de Venda</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="aether-label">Título da Oportunidade</label>
                <Input className="aether-input" placeholder="Ex: Contrato de Manutenção..." value={dealForm.titulo} onChange={(e) => setDealForm(p => ({ ...p, titulo: e.target.value }))} />
              </div>
              <div>
                <label className="aether-label">Valor Estimado</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold text-xs">R$</div>
                   <Input 
                    className="aether-input pl-10" 
                    placeholder="0,00" 
                    value={dealForm.valorEstimado} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "")
                      if (val) val = (parseInt(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                      setDealForm(p => ({ ...p, valorEstimado: val }))
                    }} 
                   />
                </div>
              </div>
              <div>
                <label className="aether-label">Estágio Inicial</label>
                <Select value={dealForm.stageId} onValueChange={(v) => setDealForm(p => ({ ...p, stageId: v }))}>
                  <SelectTrigger className="aether-input"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-surface-overlay border-border-strong">
                    {stages.map(s => <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="aether-label">Contato Vinculado</label>
                <Popover open={openContactSearch} onOpenChange={setOpenContactSearch}>
                  <PopoverTrigger asChild>
                    <button className="aether-input w-full text-left flex items-center justify-between text-white/50">
                      {selectedContact ? `${selectedContact.nome} ${selectedContact.sobrenome || ""}` : "Buscar na base..."}
                      <Search size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[480px] p-0 bg-surface-overlay border-border-strong">
                    <Command>
                      <CommandInput placeholder="Filtrar base..." onValueChange={setContactSearch} />
                      <CommandList>
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {contactsData?.contacts?.map((contact: any) => (
                            <CommandItem key={contact.id} onSelect={() => { setDealForm(p => ({ ...p, contactId: contact.id })); setOpenContactSearch(false) }}>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs">{contact.nome} {contact.sobrenome}</span>
                                <span className="text-[10px] text-white/30">{contact.email || contact.empresa}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
             <button className="aether-btn-secondary" onClick={() => setShowNewDeal(false)}>Abortar</button>
             <button className="aether-btn-primary" onClick={() => createDeal.mutate()}>Propagar Deal</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
