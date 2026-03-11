"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, MapPin, Building2, Phone, Globe, Plus, Download } from "lucide-react"
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

const states = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
]

const mockGoogleLeads: GoogleLead[] = [
  { nome: "Restaurante Bom Sabor", telefone: "(11) 3333-1111", endereco: "Rua das Flores, 100", cidade: "São Paulo", uf: "SP", nicho: "Restaurante", site: "www.bomsabor.com" },
  { nome: "Farmácia Saúde Total", telefone: "(11) 3333-2222", endereco: "Av. Paulista, 500", cidade: "São Paulo", uf: "SP", nicho: "Farmácia" },
  { nome: "Auto Mecânica Silva", telefone: "(11) 3333-3333", endereco: "Rua do Comércio, 50", cidade: "São Paulo", uf: "SP", nicho: "Mecânica" },
  { nome: "Clínica Bem Estar", telefone: "(11) 3333-4444", endereco: "Rua da Saúde, 200", cidade: "São Paulo", uf: "SP", nicho: "Clínica", site: "www.bemestar.com" },
  { nome: "Padaria Pão Nosso", telefone: "(11) 3333-5555", endereco: "Rua do Pão, 10", cidade: "São Paulo", uf: "SP", nicho: "Padaria" },
]

const mockCnpjLeads: CnpjLead[] = [
  { cnpj: "12.345.678/0001-90", nome: "EMPRESA ALPHA LTDA", telefone: "(11) 4444-1111", cnae: "6201-5/00", cidade: "São Paulo", uf: "SP", situacao: "ATIVA", email: "contato@alpha.com" },
  { cnpj: "23.456.789/0001-01", nome: "BETA COMERCIO S/A", telefone: "(11) 4444-2222", cnae: "4711-3/02", cidade: "São Paulo", uf: "SP", situacao: "ATIVA" },
  { cnpj: "34.567.890/0001-12", nome: "GAMMA SERVICOS LTDA", cnae: "7319-0/02", cidade: "Campinas", uf: "SP", situacao: "ATIVA" },
]

export default function LeadSearchPage() {
  const [googleResults, setGoogleResults] = useState<GoogleLead[]>([])
  const [cnpjResults, setCnpjResults] = useState<CnpjLead[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  const googleForm = useForm({
    defaultValues: { estado: "", cidade: "", nicho: "" },
  })

  const cnpjForm = useForm({
    defaultValues: { estado: "", cidade: "", cnae: "" },
  })

  const onGoogleSearch = async (data: { estado: string; cidade: string; nicho: string }) => {
    setIsSearching(true)
    try {
      // Simulate webhook call
      await new Promise((res) => setTimeout(res, 1500))
      setGoogleResults(mockGoogleLeads)
      toast({ title: `${mockGoogleLeads.length} leads encontrados!` })
    } catch {
      toast({ variant: "destructive", title: "Erro na busca", description: "Verifique o webhook configurado." })
    } finally {
      setIsSearching(false)
    }
  }

  const onCnpjSearch = async (data: { estado: string; cidade: string; cnae: string }) => {
    setIsSearching(true)
    try {
      await new Promise((res) => setTimeout(res, 1500))
      setCnpjResults(mockCnpjLeads)
      toast({ title: `${mockCnpjLeads.length} empresas encontradas!` })
    } catch {
      toast({ variant: "destructive", title: "Erro na busca" })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Busca de Leads</h1>
        <p className="text-muted-foreground text-sm">Encontre novos leads via Google Maps e CNPJ</p>
      </div>

      <Tabs defaultValue="google">
        <TabsList>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Google Maps
          </TabsTrigger>
          <TabsTrigger value="cnpj" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> CNPJ
          </TabsTrigger>
        </TabsList>

        {/* Google Maps Tab */}
        <TabsContent value="google" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Busca por Google Maps</CardTitle>
              <CardDescription>Encontre empresas locais por nicho e localização</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={googleForm.handleSubmit(onGoogleSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => googleForm.setValue("estado", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
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

          {googleResults.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{googleResults.length} leads encontrados</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button size="sm" className="escoltran-gradient-bg text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Selecionados
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell className="font-medium">{lead.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.telefone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.telefone}
                            </div>
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
                              <Globe className="h-3 w-3" />
                              {lead.site}
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
        </TabsContent>

        {/* CNPJ Tab */}
        <TabsContent value="cnpj" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Busca por CNPJ</CardTitle>
              <CardDescription>Encontre empresas por CNAE e localização</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={cnpjForm.handleSubmit(onCnpjSearch)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => cnpjForm.setValue("estado", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
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

          {cnpjResults.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cnpjResults.length} empresas encontradas</CardTitle>
                  <Button size="sm" className="escoltran-gradient-bg text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Selecionados
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
