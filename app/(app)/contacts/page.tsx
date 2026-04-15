"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Plus,
  Download,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Pencil,
  Trash2,
  Eye,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { formatDate, getInitials, cn, formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"

function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  format = "number",
  delay = "0ms",
  color = "accent"
}: {
  title: string
  value: number
  growth: number
  icon: React.ElementType
  format?: "number" | "currency" | "percent"
  delay?: string
  color?: string
}) {
  const isPositive = growth >= 0
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString("pt-BR")

  const colorClasses: Record<string, string> = {
    accent: "text-accent bg-accent/10 border-accent/20",
    success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  }

  return (
    <Card 
      className="bg-[#111114] border-white/5 rounded-[22px] p-6 group animate-entrance relative overflow-hidden text-left"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-4 items-center">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", colorClasses[color] || colorClasses.accent)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-0.5">{title}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{formatted}</h3>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Icon className="h-16 w-16 text-white rotate-12" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span className={cn("text-[10px] font-bold text-white/20 uppercase tracking-widest italic")}>Status Base</span>
      </div>
    </Card>
  )
}

// ─── Types ─────────────────────────────────────────────────────────
interface Contact {
  id: string
  nome: string
  sobrenome?: string | null
  email?: string | null
  telefone?: string | null
  empresa?: string | null
  cargo?: string | null
  status: string
  etapaFunil: string
  canalOrigem?: string | null
  tags: string[]
  lgpdConsent: boolean
  createdAt: string
  _count?: { deals: number; activities: number }
}

interface ContactsResponse {
  contacts: Contact[]
  total: number
  page: number
  limit: number
  counts: { all: number; leads: number; clientes: number; inativos: number }
}

const CANAL_OPCOES = [
  "Google Ads", "Facebook", "Instagram", "LinkedIn", "Orgânico",
  "Indicação", "Email Marketing", "WhatsApp", "Evento", "Outro",
]

const ETAPAS_FUNIL = ["Lead", "Qualificado", "Reunião", "Proposta", "Cliente", "Inativo"]

// ─── Skeleton row ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─── New Contact Modal ──────────────────────────────────────────────
function NewContactModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    nome: "", sobrenome: "", email: "", telefone: "",
    empresa: "", cargo: "", canalOrigem: "", status: "lead",
    etapaFunil: "Lead", lgpdConsent: false, tags: "",
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Nome é obrigatório")
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao criar contato")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Contato criado com sucesso!" })
      onSuccess()
      onOpenChange(false)
      setForm({
        nome: "", sobrenome: "", email: "", telefone: "",
        empresa: "", cargo: "", canalOrigem: "", status: "lead",
        etapaFunil: "Lead", lgpdConsent: false, tags: "",
      })
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: err.message })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-surface-overlay border-border-strong animate-entrance">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-text-primary">Novo Contato</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Nome*</Label>
              <Input placeholder="João" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Sobrenome</Label>
              <Input placeholder="Silva" value={form.sobrenome} onChange={(e) => setForm((p) => ({ ...p, sobrenome: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Email Profissional*</Label>
              <Input type="email" placeholder="joao@empresa.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Wpp / Telefone*</Label>
              <Input placeholder="(11) 99999-0000" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Empresa Vinculada*</Label>
              <Input placeholder="Empresa LTDA" value={form.empresa} onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Cargo Atual</Label>
              <Input placeholder="Diretor Comercial" value={form.cargo} onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Canal de Origem*</Label>
              <Select value={form.canalOrigem} onValueChange={(v) => setForm((p) => ({ ...p, canalOrigem: v }))}>
                <SelectTrigger className="bg-surface-elevated border-border-default"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="bg-surface-overlay border-border-strong">
                  {CANAL_OPCOES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Estágio Inicial</Label>
              <Select value={form.etapaFunil} onValueChange={(v) => setForm((p) => ({ ...p, etapaFunil: v }))}>
                <SelectTrigger className="bg-surface-elevated border-border-default"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface-overlay border-border-strong">
                  {ETAPAS_FUNIL.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-accent/5 p-3 rounded-lg border border-accent/10">
            <input
              type="checkbox"
              id="lgpd"
              checked={form.lgpdConsent}
              onChange={(e) => setForm((p) => ({ ...p, lgpdConsent: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <Label htmlFor="lgpd" className="cursor-pointer text-xs font-bold text-accent uppercase tracking-tighter">
              Confirmo consentimento para processamento de dados (LGPD)
            </Label>
          </div>
        </div>
        <DialogFooter className="border-t border-border-subtle pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.nome.trim()}
          >
            {mutation.isPending ? "Propagando..." : "Finalizar Cadastro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Funil stage stepper ────────────────────────────────────────────
function FunilStepper({ contact, onUpdate }: { contact: Contact; onUpdate: () => void }) {
  const mutation = useMutation({
    mutationFn: async (etapaFunil: string) => {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etapaFunil, status: etapaFunil === "Inativo" ? "inativo" : etapaFunil === "Cliente" ? "cliente" : "lead" }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar estágio")
      return res.json()
    },
    onSuccess: () => { toast({ title: "Estágio atualizado!" }); onUpdate() },
    onError: () => toast({ variant: "destructive", title: "Erro ao atualizar estágio" }),
  })

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {ETAPAS_FUNIL.map((e) => (
        <button
          key={e}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(e)}
          className={cn(
            "text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase transition-all",
            contact.etapaFunil === e
              ? "bg-accent text-accent-foreground shadow-[0_0_10px_rgba(224,176,80,0.3)]"
              : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-border-subtle"
          )}
        >
          {e}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────
export default function ContactsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [page, setPage] = useState(1)
  const [showNew, setShowNew] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const pageSize = 15

  // Debounce search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      setPage(1)
      clearTimeout((window as any).searchTimer)
      ;(window as any).searchTimer = setTimeout(() => {
        setDebouncedSearch(value)
      }, 300)
    },
    []
  )

  const statusFilter = activeTab === "all" ? "" : activeTab

  const { data, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["contacts", debouncedSearch, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: String(page),
        limit: String(pageSize),
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/contacts?${params}`)
      if (!res.ok) throw new Error("Falha ao carregar contatos")
      return res.json()
    },
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao deletar")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Contato removido" })
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
    onError: () => toast({ variant: "destructive", title: "Erro ao remover contato" }),
  })

  const contacts = data?.contacts || []
  const total = data?.total || 0
  const counts = data?.counts || { all: 0, leads: 0, clientes: 0, inativos: 0 }

  // Export CSV
  const handleExport = () => {
    const headers = ["Nome", "Email", "Telefone", "Empresa", "Cargo", "Status", "Canal", "Criado em"]
    const rows = contacts.map((c) => [
      `${c.nome}${c.sobrenome ? " " + c.sobrenome : ""}`,
      c.email || "",
      c.telefone || "",
      c.empresa || "",
      c.cargo || "",
      c.status,
      c.canalOrigem || "",
      formatDate(c.createdAt),
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contatos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-12 px-2 sm:px-6 lg:px-10 flex flex-col h-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-entrance">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent text-[10px] font-bold py-1 px-3 rounded-full flex items-center w-fit gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            GESTÃO DE RELACIONAMENTO
          </Badge>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-3">
              Contatos <span className="text-accent/60 text-base font-medium tracking-normal">({counts.all} registros)</span>
            </h1>
            <p className="text-sm font-medium text-white/40 mt-3 flex items-center gap-2">
              BASE DE ENTIDADES ESCOLTRAN <span className="h-1 w-1 rounded-full bg-white/20" /> CRM INTELIGENTE <span className="h-1 w-1 rounded-full bg-white/20" /> STATUS: <span className="text-accent/60">SINCRONIZADO</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-12 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5" onClick={() => router.push("/lead-search")}>
            <Search className="h-4 w-4 mr-2" />
            Prospectar
          </Button>

          <Button 
            className="bg-accent hover:bg-accent/90 text-black h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/10 group transition-all"
            onClick={() => setShowNew(true)}
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Base Total"
          value={counts.all}
          growth={0}
          icon={Users}
          color="accent"
          delay="100ms"
        />
        <MetricCard
          title="Leads Ativos"
          value={counts.leads}
          growth={0}
          icon={TrendingUp}
          color="info"
          delay="200ms"
        />
        <MetricCard
          title="Clientes"
          value={counts.clientes}
          growth={0}
          icon={UserCheck}
          color="success"
          delay="300ms"
        />
        <MetricCard
          title="Inativos"
          value={counts.inativos}
          growth={0}
          icon={UserX}
          color="warning"
          delay="400ms"
        />
      </div>

      {/* Table Section */}
      <Card className="bg-surface border-border-subtle overflow-hidden">
        <CardHeader className="pb-4 space-y-4 bg-white/[0.01] border-b border-border-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1) }}>
              <TabsList className="bg-black/40 border border-border-subtle">
                <TabsTrigger value="all" className="text-[10px] uppercase font-bold tracking-tighter">Todos</TabsTrigger>
                <TabsTrigger value="lead" className="text-[10px] uppercase font-bold tracking-tighter">Leads</TabsTrigger>
                <TabsTrigger value="cliente" className="text-[10px] uppercase font-bold tracking-tighter">Clientes</TabsTrigger>
                <TabsTrigger value="inativo" className="text-[10px] uppercase font-bold tracking-tighter">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  placeholder="Filtrar base..."
                  className="pl-9 h-10"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button variant="secondary" onClick={handleExport} disabled={contacts.length === 0} className="h-10 px-4">
                <Download className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Entidade</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Corporativo</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Canal</TableHead>
                <TableHead className="text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Fase</TableHead>
                <TableHead className="hidden lg:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Pipeline Funil</TableHead>
                <TableHead className="hidden lg:table-cell text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted text-center">Deals</TableHead>
                <TableHead className="text-right text-[11px] font-black font-mono uppercase tracking-[0.1em] text-text-muted">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4 text-text-muted opacity-30">
                      <Users className="h-12 w-12" />
                      <p className="text-sm font-mono uppercase tracking-widest">Nenhum registro encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => {
                  const fullName = `${contact.nome}${contact.sobrenome ? " " + contact.sobrenome : ""}`
                  const statusVariant = contact.status === "cliente" ? "ativa" : contact.status === "inativo" ? "inativa" : "novo"
                  
                  return (
                    <TableRow key={contact.id} className="border-border-subtle hover:bg-white/[0.01] transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border-subtle group-hover:border-accent/40 transition-all">
                            <AvatarFallback className="text-[10px] font-black bg-surface-elevated text-text-muted">
                              {getInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-text-primary truncate">{fullName}</p>
                            <p className="text-[10px] font-mono text-text-muted opacity-60 truncate">{contact.email || contact.telefone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.empresa ? (
                          <div className="max-w-[150px]">
                            <p className="text-[12px] font-black font-sans flex items-center gap-1.5 truncate">
                              <Building2 className="h-3 w-3 text-accent opacity-50" />
                              {contact.empresa}
                            </p>
                            <p className="text-[10px] font-display italic text-text-muted opacity-80 mt-0.5 truncate">{contact.cargo || "—"}</p>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {contact.canalOrigem ? (
                          <Badge variant="secondary" className="bg-white/5 border-white/5 opacity-80">
                            {contact.canalOrigem}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant}>{contact.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <FunilStepper
                          contact={contact}
                          onUpdate={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <span className={cn(
                          "text-[10px] font-mono font-black",
                          (contact._count?.deals || 0) > 0 ? "text-accent" : "text-text-muted opacity-40"
                        )}>
                          {(contact._count?.deals || 0).toString().padStart(2, '0')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-danger/60 hover:text-danger"
                            onClick={() => setDeleteId(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Section */}
          {total > 0 && (
            <div className="flex items-center justify-between p-6 bg-white/[0.01] border-t border-border-subtle">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-widest">
                Exibindo <span className="text-text-primary px-1">{Math.min((page - 1) * pageSize + 1, total)}—{Math.min(page * pageSize, total)}</span> de <span className="text-text-primary px-1">{total}</span>
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setPage((p) => p + 1)} 
                  disabled={page * pageSize >= total}
                  className="h-8 px-3"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals and dialogs */}
      <NewContactModal
        open={showNew}
        onOpenChange={setShowNew}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-surface-overlay border-border-strong">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Expurgar Registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-sans italic opacity-80">
              Esta ação é irreversível. O contato e todos os deals vinculados serão deletados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border-default">Abortar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-white hover:bg-danger/80"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
