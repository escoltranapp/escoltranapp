"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="h-screen bg-surface selection:bg-amber-500/20">
      {/* Sidebar Fixa (200px) */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* TopBar Fixa (Offset de 200px) */}
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[200px] border-r-0">
          <AppSidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Área Principal com Offsets Rigorosos */}
      <main className="md:ml-[200px] pt-16 min-h-screen overflow-y-auto bg-surface-container-lowest">
        <div className="p-8 md:p-12 max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  )
}
