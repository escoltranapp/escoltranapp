"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] selection:bg-[#F97316]/20">
      {/* Sidebar Fixa (256px) */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* TopBar Fixa (Offset de 256px) */}
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Mobile Drawer (256px) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[256px] border-r-0 bg-[#0A0A0A]">
          <AppSidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Área Principal com Offsets Rigorosos */}
      <main className="md:pl-[256px] pt-16 min-h-screen">
        <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
