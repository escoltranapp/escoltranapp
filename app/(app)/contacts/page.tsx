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
import { Textarea } from "@/components/ui/textarea"
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
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

// ─── Status config ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  cliente: { label: "Cliente", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  prospect: { label: "Prospect", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
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
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${50 + i * 10}%` }} />
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
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Contato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input placeholder="João" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Sobrenome</Label>
              <Input placeholder="Silva" value={form.sobrenome} onChange={(e) => setForm((p) => ({ ...p, sobrenome: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" placeholder="joao@empresa.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone *</Label>
              <Input placeholder="(11) 99999-0000" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Empresa *</Label>
              <Input placeholder="Empresa LTDA" value={form.empresa} onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input placeholder="Diretor Comercial" value={form.cargo} onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Canal de Origem *</Label>
              <Select value={form.canalOrigem} onValueChange={(v) => setForm((p) => ({ ...p, canalOrigem: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {CANAL_OPCOES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estágio no Funil</Label>
              <Select value={form.etapaFunil} onValueChange={(v) => setForm((p) => ({ ...p, etapaFunil: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETAPAS_FUNIL.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tags (separadas por vírgula)</Label>
            <Input placeholder="b2b, premium, indicação" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lgpd"
              checked={form.lgpdConsent}
              onChange={(e) => setForm((p) => ({ ...p, lgpdConsent: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="lgpd" className="cursor-pointer text-sm font-normal">
              Consentimento LGPD confirmado
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="escoltran-gradient-bg text-white"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.nome.trim()}
          >
            {mutation.isPending ? "Criando..." : "Criar Contato"}
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
          onClick={() => mutation.mutate(e)}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
            contact.etapaFunil === e
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
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
      clearTimeout((window as unknown as { searchTimer?: ReturnType<typeof setTimeout> }).searchTimer)
      ;(window as unknown as { searchTimer?: ReturnType<typeof setTimeout> }).searchTimer = setTimeout(() => {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
          <p className="text-muted-foreground text-sm">{counts.all} contatos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/lead-search")}>
            <Search className="h-4 w-4 mr-2" />
            Prospectar
          </Button>
          <Button className="escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.all, icon: Users, color: "text-primary" },
          { label: "Leads", value: counts.leads, icon: TrendingUp, color: "text-blue-400" },
          { label: "Clientes", value: counts.clientes, icon: UserCheck, color: "text-green-400" },
          { label: "Inativos", value: counts.inativos, icon: UserX, color: "text-muted-foreground" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-7 w-7 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 space-y-3">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1) }}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">Todos ({counts.all})</TabsTrigger>
              <TabsTrigger value="lead" className="text-xs">Leads ({counts.leads})</TabsTrigger>
              <TabsTrigger value="cliente" className="text-xs">Clientes ({counts.clientes})</TabsTrigger>
              <TabsTrigger value="inativo" className="text-xs">Inativos ({counts.inativos})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa, email..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={contacts.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">Empresa / Cargo</TableHead>
                <TableHead className="hidden sm:table-cell">Canal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Funil</TableHead>
                <TableHead className="hidden lg:table-cell">Deals</TableHead>
                <TableHead className="hidden md:table-cell">Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8 opacity-30" />
                      <p className="text-sm">
                        {debouncedSearch
                          ? `Nenhum contato encontrado para "${debouncedSearch}"`
                          : "Nenhum contato cadastrado ainda"}
                      </p>
                      {!debouncedSearch && (
                        <Button size="sm" className="mt-2 escoltran-gradient-bg text-white" onClick={() => setShowNew(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar primeiro contato
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => {
                  const fullName = `${contact.nome}${contact.sobrenome ? " " + contact.sobrenome : ""}`
                  const sc = statusConfig[contact.status] || statusConfig.lead
                  return (
                    <TableRow key={contact.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{fullName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {contact.email && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.telefone && !contact.email && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <Phone className="h-3 w-3" />
                                  {contact.telefone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.empresa ? (
                          <div>
                            <p className="text-xs font-medium flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contact.empresa}
                            </p>
                            {contact.cargo && (
                              <p className="text-xs text-muted-foreground">{contact.cargo}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {contact.canalOrigem ? (
                          <Badge variant="outline" className="text-xs">{contact.canalOrigem}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${sc.className}`}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <FunilStepper
                          contact={contact}
                          onUpdate={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-center">
                        {contact._count?.deals || 0}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(contact.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver contato">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-400"
                            title="Excluir"
                            onClick={() => setDeleteId(contact.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= total}>
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New contact modal */}
      <NewContactModal
        open={showNew}
        onOpenChange={setShowNew}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O contato e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
