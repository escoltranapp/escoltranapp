"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Filter, Download, Users, Mail, Phone } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

interface Contact {
  id: string
  nome: string
  sobrenome?: string | null
  email?: string | null
  telefone?: string | null
  tags: string[]
  lgpdConsent: boolean
  createdAt: string
  _count?: { deals: number }
}

const mockContacts: Contact[] = [
  {
    id: "c1",
    nome: "Maria",
    sobrenome: "Silva",
    email: "maria.silva@email.com",
    telefone: "(11) 99999-0001",
    tags: ["lead", "premium"],
    lgpdConsent: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    _count: { deals: 2 },
  },
  {
    id: "c2",
    nome: "João",
    sobrenome: "Santos",
    email: "joao.santos@empresa.com",
    telefone: "(11) 99999-0002",
    tags: ["cliente"],
    lgpdConsent: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    _count: { deals: 1 },
  },
  {
    id: "c3",
    nome: "Ana",
    sobrenome: "Oliveira",
    email: "ana.oliveira@email.com",
    telefone: "(11) 99999-0003",
    tags: ["prospect"],
    lgpdConsent: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    _count: { deals: 0 },
  },
  {
    id: "c4",
    nome: "Carlos",
    sobrenome: "Ferreira",
    email: "carlos@empresa.com",
    telefone: "(21) 98888-0001",
    tags: ["lead", "b2b"],
    lgpdConsent: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    _count: { deals: 3 },
  },
  {
    id: "c5",
    nome: "Lucia",
    sobrenome: "Pereira",
    email: "lucia.p@gmail.com",
    telefone: "(31) 97777-0001",
    tags: ["cliente", "premium"],
    lgpdConsent: true,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    _count: { deals: 1 },
  },
]

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", search, page],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/contacts?search=${search}&page=${page}&limit=${pageSize}`)
        if (res.ok) return res.json()
      } catch {
        // ignore
      }
      const filtered = mockContacts.filter((c) => {
        const q = search.toLowerCase()
        return (
          !q ||
          c.nome.toLowerCase().includes(q) ||
          (c.sobrenome || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.telefone || "").includes(q)
        )
      })
      return { contacts: filtered, total: filtered.length }
    },
  })

  const contacts: Contact[] = data?.contacts || mockContacts
  const total: number = data?.total || mockContacts.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
          <p className="text-muted-foreground text-sm">{total} contatos cadastrados</p>
        </div>
        <Button className="escoltran-gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: total, icon: Users, color: "text-primary" },
          { label: "Com Email", value: contacts.filter((c) => c.email).length, icon: Mail, color: "text-blue-400" },
          { label: "Com Telefone", value: contacts.filter((c) => c.telefone).length, icon: Phone, color: "text-green-400" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead className="hidden sm:table-cell">Tags</TableHead>
                <TableHead className="hidden lg:table-cell">Deals</TableHead>
                <TableHead className="hidden lg:table-cell">LGPD</TableHead>
                <TableHead className="hidden md:table-cell">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum contato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => {
                  const fullName = `${contact.nome}${contact.sobrenome ? " " + contact.sobrenome : ""}`
                  return (
                    <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{fullName}</p>
                            {contact.email && (
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {contact.telefone || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{contact.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {contact._count?.deals || 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          className={
                            contact.lgpdConsent
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        >
                          {contact.lgpdConsent ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(contact.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
              >
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
