"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UTMStatsCards } from "@/components/analytics/UTMStatsCards"
import { UTMFunnel } from "@/components/analytics/UTMFunnel"
import { UTMTopRanking } from "@/components/analytics/UTMTopRanking"
import { UTMSourceChart } from "@/components/analytics/UTMSourceChart"
import { Megaphone, LayoutGrid, Globe, Clock, Loader2 } from "lucide-react"

export default function UtmAnalyticsPage() {
  const [productId, setProductId] = useState("all")

  const { data, isLoading } = useQuery({
    queryKey: ["utm-analytics", productId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/utm?productId=${productId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-[#6B7280] text-sm font-medium">Carregando métricas de performance...</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics UTM</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Performance das campanhas e anúncios de marketing</p>
        </div>

        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="w-[200px] bg-[#0A0A0A] border-white/5 text-[#6B7280] font-bold text-xs uppercase tracking-widest">
            <SelectValue placeholder="Todos os produtos" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
            <SelectItem value="all">Todos os produtos</SelectItem>
            {/* We could fetch unique products here, but for now we'll have 'all' */}
          </SelectContent>
        </Select>
      </header>

      <div className="space-y-8">
        <UTMStatsCards stats={data.stats} />

        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center gap-4 mb-6">
            <TabsList className="bg-[#0A0A0A] border border-white/5 p-1 h-auto">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-xs font-bold px-4 py-2 gap-2"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns" 
                className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-xs font-bold px-4 py-2 gap-2"
              >
                <Megaphone className="w-3.5 h-3.5" /> Campanhas
              </TabsTrigger>
              <TabsTrigger 
                value="ads" 
                className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-xs font-bold px-4 py-2 gap-2"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Anúncios
              </TabsTrigger>
              <TabsTrigger 
                value="sources" 
                className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-xs font-bold px-4 py-2 gap-2"
              >
                <Globe className="w-3.5 h-3.5" /> Fontes
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-xs font-bold px-4 py-2 gap-2"
              >
                <Clock className="w-3.5 h-3.5" /> Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-[#0A0A0A]/50 border-white/5 p-6 backdrop-blur-sm">
                <UTMFunnel data={data.funnel} />
              </Card>

              <Card className="bg-[#0A0A0A]/50 border-white/5 p-6 backdrop-blur-sm">
                <UTMTopRanking title="Top Campanhas" items={data.topCampaigns} />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#0A0A0A]/50 border-white/5 p-6 backdrop-blur-sm">
                <UTMTopRanking title="Top Anúncios" items={data.topAds} />
              </Card>

              <Card className="bg-[#0A0A0A]/50 border-white/5 p-6 backdrop-blur-sm">
                <UTMSourceChart data={data.sourceDistribution} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
             <Card className="bg-[#0A0A0A] border-white/5 p-8 text-center">
                <p className="text-[#6B7280] font-medium">Relatório detalhado de campanhas em breve.</p>
             </Card>
          </TabsContent>
          {/* Other tabs content... */}
        </Tabs>
      </div>
    </div>
  )
}
