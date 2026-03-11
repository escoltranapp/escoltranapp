"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Users, Kanban, Search } from "lucide-react"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Search },
  { href: "/contacts", label: "Contatos", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
]

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar contatos, deals, páginas..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação Rápida">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <CommandItem
                key={link.href}
                onSelect={() => handleSelect(link.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
