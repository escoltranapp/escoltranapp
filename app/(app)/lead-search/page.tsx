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
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
        <TableCell key={i}><div className="h-4 rounded bg-muted animate-pulse" /></TableCell>
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
      // Try user's configured webhook first
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
        description: "Configure o webhook Google Maps em Configurações para buscar leads reais.",
        variant: "destructive",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: "Verifique o webhook configurado em Configurações.",
      })
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
        description: "Configure o webhook CNPJ em Configurações para buscar empresas reais.",
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Busca de Leads</h1>
        <p className="text-muted-foreground text-sm">Encontre novos leads via Google Maps e CNPJ</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Google", value: storedGoogle?.total ?? "—", icon: MapPin, color: "text-primary" },
          { label: "Total CNPJ", value: storedCnpj?.total ?? "—", icon: Building2, color: "text-blue-400" },
          { label: "Leads Hoje", value: (storedGoogle?.today ?? 0) + (storedCnpj?.today ?? 0), icon: CalendarDays, color: "text-amber-400" },
          { label: "Na Semana", value: (storedGoogle?.week ?? 0) + (storedCnpj?.week ?? 0), icon: TrendingUp, color: "text-green-400" },
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Google Maps
          </TabsTrigger>
          <TabsTrigger value="cnpj" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> CNPJ
          </TabsTrigger>
        </TabsList>

        {/* ── Google Maps Tab ── */}
        <TabsContent value="google" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Busca por Google Maps</CardTitle>
              <CardDescription>
                Configure o webhook em{" "}
                <span className="text-primary">Configurações → Busca de Leads</span> para buscar leads reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={googleForm.handleSubmit(onGoogleSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => googleForm.setValue("estado", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input placeholder="São Paulo" {...googleForm.register("cidade")} />
                </div>
                <div className="space-y-2">
                  <Label>Nicho / Categoria</Label>
                  <Input placeholder="Restaurante, Farmácia..." {...googleForm.register("nicho")} />
                </div>
                <div className="sm:col-span-3">
                  <Button type="submit" disabled={isSearching} className="escoltran-gradient-bg text-white">
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Buscando..." : "Buscar Leads"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search results (from webhook) */}
          {googleResults.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{googleResults.length} leads encontrados</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCsv(googleResults as unknown as Record<string, unknown>[], "leads-google.csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button
                      size="sm"
                      className="escoltran-gradient-bg text-white"
                      onClick={() => saveLeads.mutate({
                        type: "google",
                        leads: selectedGoogle.size > 0
                          ? [...selectedGoogle].map((i) => googleResults[i])
                          : googleResults,
                      })}
                      disabled={saveLeads.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedGoogle.size > 0 ? `Salvar ${selectedGoogle.size} selecionados` : "Salvar todos"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden sm:table-cell">Endereço</TableHead>
                      <TableHead className="hidden md:table-cell">Nicho</TableHead>
                      <TableHead className="hidden lg:table-cell">Site</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {googleResults.map((lead, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Checkbox
                            checked={selectedGoogle.has(i)}
                            onCheckedChange={(checked) => {
                              setSelectedGoogle((prev) => {
                                const next = new Set(prev)
                                checked ? next.add(i) : next.delete(i)
                                return next
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.nome}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {lead.telefone ? (
                            <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.telefone}</div>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                          {lead.endereco ? `${lead.endereco}, ${lead.cidade}` : "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.nicho && <Badge variant="secondary" className="text-xs">{lead.nicho}</Badge>}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {lead.site ? (
                            <div className="flex items-center gap-1 text-primary text-xs">
                              <Globe className="h-3 w-3" />{lead.site}
                            </div>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Stored Google leads from DB */}
          {!googleResults.length && storedGoogle && storedGoogle.leads.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Leads salvos ({storedGoogle.total})</CardTitle>
                <CardDescription>Últimos leads extraídos e salvos no banco</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden sm:table-cell">Cidade/UF</TableHead>
                      <TableHead className="hidden md:table-cell">Nicho</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storedGoogle.leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium text-sm">{lead.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.telefone || "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.nicho ? <Badge variant="secondary" className="text-xs">{lead.nicho}</Badge> : "—"}
                        </TableCell>
                        <TableCell>
                          {lead.status === "ATIVO" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary"
                              onClick={() => convertLead.mutate({ leadId: lead.id })}
                              disabled={convertLead.isPending}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Adicionar ao CRM
                            </Button>
                          )}
                          {lead.status === "CONTATADO" && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">No CRM</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {!googleResults.length && !storedGoogle?.leads.length && (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <MapPin className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhum lead do Google Maps ainda</p>
                <p className="text-xs">Configure o webhook e faça uma busca acima</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── CNPJ Tab ── */}
        <TabsContent value="cnpj" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Busca por CNPJ</CardTitle>
              <CardDescription>
                Configure o webhook em{" "}
                <span className="text-primary">Configurações → Busca de Leads</span> para buscar empresas reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={cnpjForm.handleSubmit(onCnpjSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => cnpjForm.setValue("estado", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input placeholder="São Paulo" {...cnpjForm.register("cidade")} />
                </div>
                <div className="space-y-2">
                  <Label>CNAE</Label>
                  <Input placeholder="6201-5/00" {...cnpjForm.register("cnae")} />
                </div>
                <div className="sm:col-span-3">
                  <Button type="submit" disabled={isSearching} className="escoltran-gradient-bg text-white">
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Buscando..." : "Buscar Empresas"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* CNPJ search results */}
          {cnpjResults.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cnpjResults.length} empresas encontradas</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCsv(cnpjResults as unknown as Record<string, unknown>[], "leads-cnpj.csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button
                      size="sm"
                      className="escoltran-gradient-bg text-white"
                      onClick={() => saveLeads.mutate({
                        type: "cnpj",
                        leads: selectedCnpj.size > 0
                          ? [...selectedCnpj].map((i) => cnpjResults[i])
                          : cnpjResults,
                      })}
                      disabled={saveLeads.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedCnpj.size > 0 ? `Salvar ${selectedCnpj.size}` : "Salvar todos"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Razão Social</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                      <TableHead className="hidden md:table-cell">CNAE</TableHead>
                      <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
                      <TableHead>Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cnpjResults.map((lead, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCnpj.has(i)}
                            onCheckedChange={(checked) => {
                              setSelectedCnpj((prev) => {
                                const next = new Set(prev)
                                checked ? next.add(i) : next.delete(i)
                                return next
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono">{lead.cnpj}</TableCell>
                        <TableCell className="font-medium text-sm">{lead.nome}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {lead.telefone || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.cnae && <Badge variant="outline" className="text-xs">{lead.cnae}</Badge>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              lead.situacao === "ATIVA"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {lead.situacao || "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Stored CNPJ leads */}
          {!cnpjResults.length && storedCnpj && storedCnpj.leads.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Empresas salvas ({storedCnpj.total})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Razão Social</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                      <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storedCnpj.leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-xs font-mono">{lead.cnpj}</TableCell>
                        <TableCell className="font-medium text-sm">{lead.nome}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {lead.telefone || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {lead.cidade && lead.uf ? `${lead.cidade}/${lead.uf}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              lead.situacao === "ATIVA"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {lead.situacao || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary"
                            onClick={() => convertLead.mutate({ leadCnpjId: lead.id })}
                            disabled={convertLead.isPending}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Adicionar ao CRM
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {!cnpjResults.length && !storedCnpj?.leads.length && (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Building2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhuma empresa CNPJ encontrada ainda</p>
                <p className="text-xs">Configure o webhook e faça uma busca acima</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Webhook config notice */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">Configuração necessária</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Para buscar leads reais, configure os webhooks em{" "}
              <strong>Configurações → Busca de Leads</strong>. O sistema usa n8n para integrar com Google Maps e APIs de CNPJ.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
