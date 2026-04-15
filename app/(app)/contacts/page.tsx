"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { getInitials, cn, formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
        <span className="text-white/20 italic tracking-widest text-[9px] uppercase">Registros em Nuvem</span>
      </div>
    </div>
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

const CANAL_OPCOES = ["Google Ads", "Facebook", "Instagram", "LinkedIn", "WhatsApp", "Indicação"]
const ETAPAS_FUNIL = ["Lead", "Qualificado", "Reunião", "Proposta", "Cliente", "Inativo"]

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

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v); setPage(1)
    clearTimeout((window as any).searchTimer)
    ;(window as any).searchTimer = setTimeout(() => setDebouncedSearch(v), 300)
  }, [])

  const statusFilter = activeTab === "all" ? "" : activeTab

  const { data, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["contacts", debouncedSearch, statusFilter, page],
    queryFn: async () => {
      const p = new URLSearchParams({ search: debouncedSearch, page: String(page), limit: String(pageSize), ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/contacts?${p}`)
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 15_000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    onSuccess: () => { toast({ title: "Registro removido." }); setDeleteId(null); queryClient.invalidateQueries({ queryKey: ["contacts"] }) },
  })

  const contacts = data?.contacts || []
  const total = data?.total || 0
  const counts = data?.counts || { all: 0, leads: 0, clientes: 0, inativos: 0 }

  return (
    <div className="animate-aether space-y-10 pb-10">
      
      {/* Header Section */}
      <header className="page-header flex-row items-end justify-between">
        <div className="space-y-4">
          <div className="header-badge">
            <span className="dot" />
            Gestão de Relacionamento
          </div>
          <div>
            <h1 className="page-title">
              Base de <span>Contatos</span>
            </h1>
            <div className="page-subtitle">
              Sincronização em Nuvem <span className="sep" /> 
              Total de Entidades: <span className="status">{counts.all}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="aether-btn-secondary" onClick={() => router.push("/lead-search")}>Prospectar Leads</button>
           <button className="aether-btn-primary" onClick={() => setShowNew(true)}>
             <Plus size={18} strokeWidth={3} />
             Inserir Registro
           </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Base Total" value={counts.all} icon={Users} delay="0.1s" />
        <MetricCard title="Leads Ativos" value={counts.leads} icon={TrendingUp} delay="0.2s" />
        <MetricCard title="Clientes" value={counts.clientes} icon={UserCheck} delay="0.3s" />
        <MetricCard title="Inativos" value={counts.inativos} icon={UserX} delay="0.4s" />
      </div>

      {/* Listing Area */}
      <div className="aether-table-wrap">
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1) }}>
            <TabsList className="bg-black/30 border border-white/5 h-10">
              <TabsTrigger value="all" className="text-[10px] font-black uppercase px-6">Todos</TabsTrigger>
              <TabsTrigger value="lead" className="text-[10px] font-black uppercase px-6">Leads</TabsTrigger>
              <TabsTrigger value="cliente" className="text-[10px] font-black uppercase px-6">Clientes</TabsTrigger>
              <TabsTrigger value="inativo" className="text-[10px] font-black uppercase px-6">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <Input placeholder="Filtrar base..." className="aether-input pl-10 h-10 text-xs" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
            <button className="aether-btn-secondary h-10 px-4"><Download size={16} /></button>
          </div>
        </div>

        <table className="aether-table w-full border-collapse">
          <thead className="aether-table-header">
            <tr>
              <th>Entidade</th>
              <th className="hidden md:table-cell">Corporativo</th>
              <th className="hidden sm:table-cell">Origem</th>
              <th>Status</th>
              <th className="hidden lg:table-cell text-center">Protocolos</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <tr key={i} className="h-20 animate-pulse bg-white/5 border-b border-white/5"><td colSpan={6} /></tr>)
            ) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-white/20 font-mono text-xs uppercase tracking-widest">Nenhum registro encontrado</td></tr>
            ) : contacts.map((contact) => (
              <tr key={contact.id} className="group">
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white/5 group-hover:border-gold transition-all">
                      <AvatarFallback className="text-[10px] font-black bg-white/5 text-gold">{getInitials(contact.nome)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px]">{contact.nome} {contact.sobrenome}</span>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">{contact.email || "Sem email"}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  {contact.empresa ? (
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black flex items-center gap-1.5"><Building2 size={10} className="text-gold" /> {contact.empresa}</span>
                      <span className="text-[10px] text-white/30 italic">{contact.cargo || "—"}</span>
                    </div>
                  ) : "—"}
                </td>
                <td className="hidden sm:table-cell">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded text-white/40">{contact.canalOrigem || "Direto"}</span>
                </td>
                <td>
                  <Badge variant={contact.status === "cliente" ? "ativa" : contact.status === "inativo" ? "inativa" : "novo"} className="text-[9px] uppercase font-black">{contact.status}</Badge>
                </td>
                <td className="hidden lg:table-cell text-center">
                  <span className="text-[11px] font-mono font-bold text-gold opacity-40">{(contact._count?.deals || 0).toString().padStart(2, '0')}</span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center hover:text-gold"><Eye size={14} /></button>
                    <button className="aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center hover:text-gold"><Pencil size={14} /></button>
                    <button className="aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center hover:text-red-500" onClick={() => setDeleteId(contact.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Table Aether style */}
        {total > 0 && (
          <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">
              Paginação: <span className="text-gold">{Math.min((page - 1) * pageSize + 1, total)}—{Math.min(page * pageSize, total)}</span> de {total}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center"><ChevronLeft size={16} /></button>
              <button disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)} className="aether-btn-secondary h-8 w-8 p-0 flex items-center justify-center"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-[480px] bg-surface-overlay border-border-strong p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Registro de Nova Entidade</DialogTitle>
            <DialogDescription className="text-xs font-medium text-white/30 uppercase mt-1 tracking-widest">Protocolo CRM Intelligence</DialogDescription>
          </div>
          <div className="p-8 space-y-4">
             {/* Simplicity for now, just header styling example */}
             <div className="text-center py-10">
               <Users size={32} className="mx-auto text-gold/20 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Interface de cadastro em processamento</p>
               <button className="aether-btn-primary mx-auto mt-6" onClick={() => setShowNew(false)}>Fechar Protocolo</button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
