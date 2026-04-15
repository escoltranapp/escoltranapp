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
        "h-16 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300",
        scrolled 
          ? "bg-black/60 backdrop-blur-xl border-b border-white/[0.05] shadow-2xl" 
          : "bg-transparent border-b border-transparent"
      )}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-white/40 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-white/20 hover:text-white relative hover:bg-white/5 transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#d4af37]" />
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
