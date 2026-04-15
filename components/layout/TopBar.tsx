"use client"

import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Menu, Search, Bell, Sun, Moon, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GlobalSearch } from "./GlobalSearch"
import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <header className={cn(
        "h-14 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300 border-b",
        scrolled 
          ? "bg-black/80 backdrop-blur-md border-border-default shadow-lg" 
          : "bg-transparent border-transparent"
      )}>
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-text-secondary hover:text-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div 
            className="hidden sm:flex items-center gap-2 text-text-muted text-[13px] w-64 justify-start px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-3.5 w-3.5 group-hover:text-accent transition-colors" />
            <span className="font-sans">Buscar no CRM...</span>
            <kbd className="ml-auto text-[10px] bg-white/10 text-text-muted px-1.5 py-0.5 rounded font-mono border border-white/5 uppercase">⌘K</kbd>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden text-text-secondary hover:text-accent"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-accent relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary hover:text-accent"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <div className="w-[1px] h-6 bg-border-subtle mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border-2 border-transparent hover:border-accent/40 transition-all overflow-hidden">
                <Avatar className="h-full w-full">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-black">
                    {getInitials(session?.user?.name || session?.user?.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-surface-overlay border-border-strong" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black font-sans uppercase tracking-tight">{session?.user?.name || "Usuário"}</p>
                  <p className="text-[11px] font-mono text-text-muted italic">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-default" />
              <DropdownMenuItem className="focus:bg-surface-elevated cursor-pointer">
                <User className="mr-2 h-4 w-4 text-text-muted" />
                <span className="text-[13px]">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-surface-elevated cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-text-muted" />
                <span className="text-[13px]">Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-default" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-[13px] font-bold">Encerrar Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
