"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KanbanBoard, type Stage } from "@/components/pipeline/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, RefreshCw, Kanban, DollarSign, AlertTriangle, Search, User, Calendar as CalendarIcon, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

function SkeletonBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shrink-0 w-72 h-96 rounded-xl bg-card border border-border animate-pulse" />
      ))}
    </div>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  
  // States Modal Deal
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

  // States Modal Stage
  const [showNewStage, setShowNewStage] = useState(false)
  const [stageForm, setStageForm] = useState({
    name: "",
    color: "#F97316",
  })

  // States Contact Search
  const [openContactSearch, setOpenContactSearch] = useState(false)
  const [contactSearch, setContactSearch] = useState("")

  const predefineColors = [
    { name: "Laranja", value: "#F97316" },
    { name: "Azul", value: "#3B82F6" },
    { name: "Verde", value: "#22C55E" },
    { name: "Vermelho", value: "#EF4444" },
    { name: "Roxo", value: "#8B5CF6" },
    { name: "Amarelo", value: "#F59E0B" },
    { name: "Cinza", value: "#6B7280" },
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
      setStageForm({ name: "", color: "#F97316" })
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
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Pipeline Comercial
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Gestão de Oportunidades • Visão Kanban
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="main">
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">{data?.pipelineName || "Pipeline Principal"}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" className="h-9" onClick={() => setShowNewStage(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Coluna
          </Button>

          <Button className="escoltran-gradient-bg text-white h-9" onClick={() => {
            setDealForm(p => ({ ...p, stageId: "" }))
            setShowNewDeal(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <Kanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-tight">{isLoading ? "—" : totalDeals}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total de Cards</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold leading-tight">{isLoading ? "—" : formatCurrency(totalValue)}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`w-10 h-10 rounded-full ${overdueDeals > 0 ? "bg-red-500/10" : "bg-muted/10"} flex items-center justify-center`}>
              <AlertTriangle className={`h-5 w-5 ${overdueDeals > 0 ? "text-red-400" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className={`text-xl font-bold leading-tight ${overdueDeals > 0 ? "text-red-400" : ""}`}>
                {isLoading ? "—" : overdueDeals}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cards +30 dias</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <SkeletonBoard />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p>Erro ao carregar pipeline. Verifique a conexão com o banco.</p>
            <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        ) : stages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Kanban className="h-8 w-8 opacity-30" />
            <p className="font-medium">Nenhum estágio encontrado</p>
            <Button variant="outline" size="sm" onClick={() => setShowNewStage(true)}>Criar primeira coluna</Button>
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full escoltran-gradient-bg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Novo Deal
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova oportunidade ao pipeline gerenciado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="titulo">Título do Deal *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Proposta para Empresa X"
                autoFocus
                value={dealForm.titulo}
                onChange={(e) => setDealForm((p) => ({ ...p, titulo: e.target.value }))}
                className={!dealForm.titulo.trim() && createDeal.isError ? "border-red-500" : ""}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">R$</span>
                <Input
                  id="valor"
                  type="text"
                  placeholder="0,00"
                  className="pl-9"
                  value={dealForm.valorEstimado}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "")
                    if (val) {
                      val = (parseInt(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                    setDealForm((p) => ({ ...p, valorEstimado: val }))
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <div className="flex gap-2">
                {["ALTA", "MEDIA", "BAIXA"].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={dealForm.prioridade === p ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-9 bg-opacity-10 text-[10px] uppercase font-bold"
                    onClick={() => setDealForm(prev => ({ ...prev, prioridade: p as any }))}
                  >
                    {p === "ALTA" && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />}
                    {p === "MEDIA" && <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />}
                    {p === "BAIXA" && <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />}
                    {p.replace("MEDIA", "MÉDIA")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Estágio *</Label>
              <Select
                value={dealForm.stageId}
                onValueChange={(v) => setDealForm((p) => ({ ...p, stageId: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Data Prevista</Label>
              <div className="relative">
                <Input
                  type="date"
                  className="pl-9 h-9"
                  value={dealForm.dataPrevista}
                  onChange={(e) => setDealForm(p => ({ ...p, dataPrevista: e.target.value }))}
                />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Contato Vinculado</Label>
              <Popover open={openContactSearch} onOpenChange={setOpenContactSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-9 text-muted-foreground font-normal"
                  >
                    {selectedContact ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="h-4 w-4" />
                        {selectedContact.nome} {selectedContact.sobrenome}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Buscar contato...
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Busque por nome, email ou empresa..." 
                      onValueChange={setContactSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
                      <CommandGroup>
                        {contactsData?.contacts?.map((contact: any) => (
                          <CommandItem
                            key={contact.id}
                            value={contact.id}
                            onSelect={() => {
                              setDealForm(p => ({ ...p, contactId: contact.id }))
                              setOpenContactSearch(false)
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {contact.nome[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{contact.nome} {contact.sobrenome}</span>
                                <span className="text-[10px] text-muted-foreground">{contact.email || contact.empresa || "Sem info"}</span>
                              </div>
                            </div>
                            {dealForm.contactId === contact.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Observações adicionais sobre este negócio..."
                className="resize-none h-20"
                value={dealForm.descricao}
                onChange={(e) => setDealForm((p) => ({ ...p, descricao: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowNewDeal(false)}>
              Cancelar
            </Button>
            <Button
              className="escoltran-gradient-bg text-white px-8"
              onClick={() => createDeal.mutate()}
              disabled={createDeal.isPending || !dealForm.titulo.trim() || !dealForm.stageId}
            >
              {createDeal.isPending ? "Criando..." : "+ Criar Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Coluna */}
      <Dialog open={showNewStage} onOpenChange={setShowNewStage}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Kanban className="h-4 w-4 text-primary" />
              </div>
              Nova Coluna
            </DialogTitle>
            <DialogDescription>
              Adicione um novo estágio para o seu fluxo de vendas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="stage-name">Nome da Coluna *</Label>
              <Input
                id="stage-name"
                placeholder="Ex: Follow Up, Reunião Agendada..."
                autoFocus
                value={stageForm.name}
                onChange={(e) => setStageForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <div className="flex flex-wrap gap-2">
                {predefineColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      stageForm.color === color.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setStageForm(p => ({ ...p, color: color.value }))}
                    title={color.name}
                  />
                ))}
                <div className="relative w-8 h-8 rounded-full border-2 border-transparent overflow-hidden group">
                  <Input 
                    type="color" 
                    className="absolute -inset-2 w-12 h-12 cursor-pointer p-0 border-none bg-transparent"
                    value={stageForm.color}
                    onChange={(e) => setStageForm(p => ({ ...p, color: e.target.value }))}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 group-hover:opacity-100 mix-blend-difference">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setShowNewStage(false)}>
              Cancelar
            </Button>
            <Button
              className="escoltran-gradient-bg text-white"
              onClick={() => createStage.mutate()}
              disabled={createStage.isPending || !stageForm.name.trim()}
            >
              {createStage.isPending ? "Criando..." : "+ Criar Coluna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
