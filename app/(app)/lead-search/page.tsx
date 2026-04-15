"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  MapPin,
  Building2,
  Phone,
  Globe,
  Plus,
  Download,
  Users,
  CalendarDays,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  ChevronDown,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface GoogleLead {
  nome: string
  telefone?: string
  endereco?: string
  cidade?: string
  uf?: string
  nicho?: string
  site?: string
}

interface CnpjLead {
  cnpj: string
  nome: string
  telefone?: string
  cnae?: string
  cidade?: string
  uf?: string
  situacao?: string
  email?: string
}

interface StoredLead {
  id: string
  nome: string
  telefone?: string | null
  cidade?: string | null
  uf?: string | null
  nicho?: string | null
  site?: string | null
  status: string
  createdAt: string
}

interface StoredCnpjLead {
  id: string
  cnpj: string
  nome: string
  telefone?: string | null
  cnae?: string | null
  cidade?: string | null
  uf?: string | null
  situacao?: string | null
  email?: string | null
  createdAt: string
}

const states = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
]

function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <TableRow>
      {[...Array(cols)].map((_, i) => (
        <TableCell key={i}><div className="h-4 rounded bg-white/5 animate-pulse" /></TableCell>
      ))}
    </TableRow>
  )
}

export default function LeadSearchPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("google")
  const [googleResults, setGoogleResults] = useState<GoogleLead[]>([])
  const [cnpjResults, setCnpjResults] = useState<CnpjLead[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGoogle, setSelectedGoogle] = useState<Set<number>>(new Set())
  const [selectedCnpj, setSelectedCnpj] = useState<Set<number>>(new Set())

  const googleForm = useForm({ defaultValues: { estado: "", cidade: "", nicho: "" } })
  const cnpjForm = useForm({ defaultValues: { estado: "", cidade: "", cnae: "" } })

  // ─── Fetch stored leads from DB ─────────────────────────────────
  const { data: storedGoogle } = useQuery<{ leads: StoredLead[]; total: number; today: number; week: number }>({
    queryKey: ["leads-stored-google"],
    queryFn: async () => {
      const res = await fetch("/api/leads?type=google&limit=50")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 30_000,
  })

  const { data: storedCnpj } = useQuery<{ leads: StoredCnpjLead[]; total: number; today: number; week: number }>({
    queryKey: ["leads-stored-cnpj"],
    queryFn: async () => {
      const res = await fetch("/api/leads?type=cnpj&limit=50")
      if (!res.ok) throw new Error("Falha")
      return res.json()
    },
    staleTime: 30_000,
  })

  // ─── Save results to DB ──────────────────────────────────────────
  const saveLeads = useMutation({
    mutationFn: async ({ type, leads }: { type: string; leads: unknown[] }) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, leads }),
      })
      if (!res.ok) throw new Error("Falha ao salvar leads")
      return res.json()
    },
    onSuccess: (data) => {
      toast({ title: `${data.created} leads salvos no banco!` })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-cnpj"] })
    },
    onError: () => toast({ variant: "destructive", title: "Erro ao salvar leads" }),
  })

  // ─── Convert lead to CRM contact ────────────────────────────────
  const convertLead = useMutation({
    mutationFn: async ({ leadId, leadCnpjId }: { leadId?: string; leadCnpjId?: string }) => {
      const res = await fetch("/api/leads/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, leadCnpjId }),
      })
      if (!res.ok) throw new Error("Falha ao converter")
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Lead convertido em contato no CRM!" })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-google"] })
      queryClient.invalidateQueries({ queryKey: ["leads-stored-cnpj"] })
    },
    onError: () => toast({ variant: "destructive", title: "Erro ao converter lead" }),
  })

  // ─── Google Maps search ──────────────────────────────────────────
  const onGoogleSearch = async (data: { estado: string; cidade: string; nicho: string }) => {
    setIsSearching(true)
    setGoogleResults([])
    setSelectedGoogle(new Set())
    try {
      const webhookRes = await fetch("/api/webhooks/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "busca_google",
          data: { estado: data.estado, cidade: data.cidade, nicho: data.nicho },
        }),
      })

      if (webhookRes.ok) {
        const result = await webhookRes.json()
        if (Array.isArray(result?.leads)) {
          setGoogleResults(result.leads)
          toast({ title: `${result.leads.length} leads encontrados!` })
          return
        }
      }

      toast({
        title: "Webhook não configurado",
        description: "Configure o webhook Google Maps em Configurações.",
        variant: "destructive",
      })
    } catch {
      toast({ variant: "destructive", title: "Erro na busca" })
    } finally {
      setIsSearching(false)
    }
  }

  // ─── CNPJ search ─────────────────────────────────────────────────
  const onCnpjSearch = async (data: { estado: string; cidade: string; cnae: string }) => {
    setIsSearching(true)
    setCnpjResults([])
    setSelectedCnpj(new Set())
    try {
      const webhookRes = await fetch("/api/webhooks/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "busca_cnpj",
          data: { estado: data.estado, cidade: data.cidade, cnae: data.cnae },
        }),
      })

      if (webhookRes.ok) {
        const result = await webhookRes.json()
        if (Array.isArray(result?.leads)) {
          setCnpjResults(result.leads)
          toast({ title: `${result.leads.length} empresas encontradas!` })
          return
        }
      }

      toast({
        title: "Webhook não configurado",
        description: "Configure o webhook CNPJ em Configurações.",
        variant: "destructive",
      })
    } catch {
      toast({ variant: "destructive", title: "Erro na busca" })
    } finally {
      setIsSearching(false)
    }
  }

  // ─── Export CSV ──────────────────────────────────────────────────
  const exportCsv = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 pb-8 animate-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">Busca de Leads</h1>
          <p className="text-sm font-display italic text-accent opacity-80 mt-1">Inteligência de mercado e prospecção ativa</p>
        </div>
        <Users className="h-8 w-8 text-white opacity-10" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Base Google", value: storedGoogle?.total ?? "—", icon: MapPin, color: "text-accent" },
          { label: "Base CNPJ", value: storedCnpj?.total ?? "—", icon: Building2, color: "text-info" },
          { label: "Capturas Hoje", value: (storedGoogle?.today ?? 0) + (storedCnpj?.today ?? 0), icon: CalendarDays, color: "text-success" },
          { label: "Performance", value: (storedGoogle?.week ?? 0) + (storedCnpj?.week ?? 0), icon: TrendingUp, color: "text-warning" },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="bg-surface border-border-subtle group hover:border-border-default transition-all animate-entrance" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border-subtle group-hover:bg-white/[0.02] transition-colors">
                  <Icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xl font-black font-sans leading-none">{s.value}</p>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mt-1 opacity-60">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/40 border border-border-subtle w-full justify-start h-12 p-1.5 overflow-x-auto">
          <TabsTrigger value="google" className="text-[11px] uppercase font-black tracking-tight flex items-center gap-2.5 px-6">
            <MapPin className="h-3.5 w-3.5" /> Google Maps
          </TabsTrigger>
          <TabsTrigger value="cnpj" className="text-[11px] uppercase font-black tracking-tight flex items-center gap-2.5 px-6">
            <Building2 className="h-3.5 w-3.5" /> Base CNPJ
          </TabsTrigger>
        </TabsList>

        {/* ── Google Maps Tab ── */}
        <TabsContent value="google" className="space-y-6">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle pb-4">
              <CardTitle className="text-[13px] font-black font-mono uppercase tracking-[0.1em] text-text-primary">Motores de Busca Google</CardTitle>
              <CardDescription className="text-xs font-mono text-text-muted uppercase italic">Extração de dados via geolocalização e nicho</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={googleForm.handleSubmit(onGoogleSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Unidade Federativa</Label>
                  <Select onValueChange={(v) => googleForm.setValue("estado", v)}>
                    <SelectTrigger className="bg-surface-elevated border-border-default h-11"><SelectValue placeholder="Selecione UF" /></SelectTrigger>
                    <SelectContent className="bg-surface-overlay border-border-strong">
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Cidade / Região</Label>
                  <Input placeholder="Ex: São Paulo" className="h-11" {...googleForm.register("cidade")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Nicho Operacional</Label>
                  <Input placeholder="Ex: Escritórios, Clinicas..." className="h-11" {...googleForm.register("nicho")} />
                </div>
                <div className="sm:col-span-3 pt-2">
                  <Button type="submit" disabled={isSearching} className="w-full sm:w-auto h-11 px-8">
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Escaneando Rede..." : "Iniciar Extração Google"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Grid / Table */}
          {googleResults.length > 0 ? (
            <Card className="bg-surface border-border-subtle overflow-hidden animate-entrance">
              <CardHeader className="flex flex-row items-center justify-between bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-accent">Found {googleResults.length} Result(s)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => exportCsv(googleResults as any, "google-leads.csv")}>
                    <Download className="h-3.5 w-3.5 mr-2" /> Export
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => saveLeads.mutate({
                      type: "google",
                      leads: selectedGoogle.size > 0 ? [...selectedGoogle].map(i => googleResults[i]) : googleResults
                    })}
                    disabled={saveLeads.isPending}
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" /> {selectedGoogle.size > 0 ? `Salvar (${selectedGoogle.size})` : "Salvar Todos"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-border-subtle">
                      <TableHead className="w-12 text-center"><ChevronDown className="h-3 w-3 mx-auto opacity-20" /></TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Razão / Nome</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Digital</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Localidade</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Segmento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {googleResults.map((lead, i) => (
                      <TableRow key={i} className="border-border-subtle hover:bg-white/[0.01] group">
                        <TableCell className="text-center">
                          <Checkbox checked={selectedGoogle.has(i)} onCheckedChange={(v) => {
                            const next = new Set(selectedGoogle); v ? next.add(i) : next.delete(i); setSelectedGoogle(next);
                          }} />
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-text-primary">{lead.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {lead.telefone && <span className="text-[11px] font-mono text-accent flex items-center gap-1.5"><Phone className="h-3 w-3 opacity-50" /> {lead.telefone}</span>}
                            {lead.site && <span className="text-[10px] font-sans text-text-muted hover:text-white transition-colors flex items-center gap-1.5 truncate max-w-[140px]"><Globe className="h-3 w-3 opacity-50" /> {lead.site}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-[11px] text-text-muted italic opacity-80">{lead.endereco ? `${lead.endereco}, ${lead.cidade}` : "—"}</TableCell>
                        <TableCell>{lead.nicho && <Badge variant="secondary" className="bg-white/5 opacity-80">{lead.nicho}</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : storedGoogle && storedGoogle.leads.length > 0 ? (
            <Card className="bg-surface border-border-subtle overflow-hidden">
               <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Histórico de Extração ({storedGoogle.total})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-border-subtle">
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Nome do Lead</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Geo / Contato</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Segmento</TableHead>
                      <TableHead className="text-right text-[10px] font-black font-mono uppercase text-text-muted">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storedGoogle.leads.map((lead) => (
                      <TableRow key={lead.id} className="border-border-subtle hover:bg-white/[0.01] group transition-colors">
                        <TableCell className="text-[13px] font-bold text-text-primary">{lead.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono font-bold text-text-muted">{lead.telefone || "—"}</span>
                            <span className="text-[10px] font-display italic text-text-muted opacity-60">{lead.cidade}/{lead.uf}</span>
                          </div>
                        </TableCell>
                        <TableCell>{lead.nicho ? <Badge variant="secondary" className="bg-white/5">{lead.nicho}</Badge> : "—"}</TableCell>
                        <TableCell className="text-right">
                          {lead.status === "ATIVO" ? (
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-accent" onClick={() => convertLead.mutate({ leadId: lead.id })}>
                              <UserPlus className="h-3 w-3 mr-1.5" /> Adicionar
                            </Button>
                          ) : <Badge variant="ativa">Internalizado</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-surface-elevated/20 border border-dashed border-border-subtle rounded-xl text-text-muted opacity-40">
              <MapPin className="h-10 w-10 mb-4" />
              <p className="text-xs font-mono font-black uppercase tracking-[0.2em]">Sem resultados recentes</p>
            </div>
          )}
        </TabsContent>

        {/* ── CNPJ Tab ── */}
        <TabsContent value="cnpj" className="space-y-6">
          <Card className="bg-surface border-border-subtle overflow-hidden">
            <CardHeader className="bg-white/[0.01] border-b border-border-subtle pb-4">
              <CardTitle className="text-[13px] font-black font-mono uppercase tracking-[0.1em] text-text-primary">Escaner de Dados RFB</CardTitle>
              <CardDescription className="text-xs font-mono text-text-muted uppercase italic">Consulta estruturada por CNAE e localidade</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={cnpjForm.handleSubmit(onCnpjSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Unidade Federativa</Label>
                  <Select onValueChange={(v) => cnpjForm.setValue("estado", v)}>
                    <SelectTrigger className="bg-surface-elevated border-border-default h-11"><SelectValue placeholder="Selecione UF" /></SelectTrigger>
                    <SelectContent className="bg-surface-overlay border-border-strong">
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Cidade / Região</Label>
                  <Input placeholder="Ex: Curitiba" className="h-11" {...cnpjForm.register("cidade")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">CNAE Fiscal</Label>
                  <Input placeholder="Ex: 62.01-5-00" className="h-11" {...cnpjForm.register("cnae")} />
                </div>
                <div className="sm:col-span-3 pt-2">
                  <Button type="submit" disabled={isSearching} className="w-full sm:w-auto h-11 px-8">
                    <Building2 className="h-4 w-4 mr-2" />
                    {isSearching ? "Consultando Receita..." : "Consultar CNPJs"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {cnpjResults.length > 0 ? (
            <Card className="bg-surface border-border-subtle overflow-hidden animate-entrance">
              <CardHeader className="flex flex-row items-center justify-between bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-accent">Query Result ({cnpjResults.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => exportCsv(cnpjResults as any, "cnpj-leads.csv")}>
                    <Download className="h-3.5 w-3.5 mr-2" /> Export
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => saveLeads.mutate({
                      type: "cnpj",
                      leads: selectedCnpj.size > 0 ? [...selectedCnpj].map(i => cnpjResults[i]) : cnpjResults
                    })}
                    disabled={saveLeads.isPending}
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" /> Salvar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-border-subtle">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Identificação / CNPJ</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Razão Social</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Localidade</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted text-right">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cnpjResults.map((lead, i) => (
                      <TableRow key={i} className="border-border-subtle hover:bg-white/[0.01] group">
                        <TableCell className="text-center">
                          <Checkbox checked={selectedCnpj.has(i)} onCheckedChange={(v) => {
                            const next = new Set(selectedCnpj); v ? next.add(i) : next.delete(i); setSelectedCnpj(next);
                          }} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono font-bold text-accent tracking-tighter">{lead.cnpj}</span>
                            <span className="text-[10px] font-mono text-text-muted opacity-60">{lead.telefone || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-text-primary uppercase tracking-tight">{lead.nome}</TableCell>
                        <TableCell className="text-[11px] text-text-muted italic opacity-80">{lead.cidade}/{lead.uf}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={lead.situacao === "ATIVA" ? "ativa" : "inativa"}>{lead.situacao}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : storedCnpj && storedCnpj.leads.length > 0 ? (
            <Card className="bg-surface border-border-subtle overflow-hidden">
               <CardHeader className="bg-white/[0.01] border-b border-border-subtle py-4">
                <CardTitle className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-text-muted">Empresas Monitoradas ({storedCnpj.total})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-border-subtle">
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">CNPJ / Registro</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Razão Social</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted">Cidade/UF</TableHead>
                      <TableHead className="text-[10px] font-black font-mono uppercase text-text-muted text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storedCnpj.leads.map((lead) => (
                      <TableRow key={lead.id} className="border-border-subtle hover:bg-white/[0.01] group transition-colors">
                        <TableCell className="text-[11px] font-mono font-bold text-accent">{lead.cnpj}</TableCell>
                        <TableCell className="text-[13px] font-bold text-text-primary uppercase truncate max-w-[200px]">{lead.nome}</TableCell>
                        <TableCell className="text-[11px] text-text-muted italic opacity-60">{lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-accent" onClick={() => convertLead.mutate({ leadCnpjId: lead.id })}>
                            <Plus className="h-3 w-3 mr-1.5" /> Importar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
             <div className="flex flex-col items-center justify-center py-24 bg-surface-elevated/20 border border-dashed border-border-subtle rounded-xl text-text-muted opacity-40">
              <Building2 className="h-10 w-10 mb-4" />
              <p className="text-xs font-mono font-black uppercase tracking-[0.2em]">Sem empresas salvas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Security/Config Disclaimer */}
      <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-4 animate-entrance" style={{ animationDelay: '600ms' }}>
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
          <AlertTriangle className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h5 className="text-[13px] font-black uppercase tracking-tight text-accent">Protocolo de Integração n8n</h5>
          <p className="text-[12px] text-text-muted leading-relaxed mt-1 italic font-display">
            A extração automatizada depende da ativação dos fluxos de trabalho via webhook. Verifique a chave de API e o endpoint configurado em <span className="text-text-primary font-bold">Painel &gt; Configurações &gt; Integrações</span> para garantir a integridade da coleta de dados.
          </p>
        </div>
      </div>
    </div>
  )
}
