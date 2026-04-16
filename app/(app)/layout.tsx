"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface selection:bg-amber-500/20">
      {/* Sidebar Fixa (240px) */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* TopBar Fixa (Offset de 240px) */}
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px] border-r-0">
          <AppSidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Área Principal com Offsets Rigorosos */}
      <main className="md:pl-[240px] pt-16 min-h-screen bg-surface-lowest">
        <div className="p-6 md:p-10 w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
