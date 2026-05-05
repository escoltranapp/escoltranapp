"use client"

import { useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LayoutGrid, 
  Megaphone, 
  Globe, 
  Clock, 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Layers
} from "lucide-react"
import { useUTMAnalytics } from "@/hooks/useUTMAnalytics"
import { UTMFunnelChart } from "@/components/utm/UTMFunnelChart"
import { UTMSourceChart } from "@/components/utm/UTMSourceChart"
import { UTMTimelineChart } from "@/components/utm/UTMTimelineChart"
import { UTMPerformanceTable } from "@/components/utm/UTMPerformanceTable"
import { UTMAdTable } from "@/components/utm/UTMAdTable"
import { TopCampaignsCard } from "@/components/utm/TopCampaignsCard"
import { TopAdsCard } from "@/components/utm/TopAdsCard"

type ProductFilter = "all" | "Consultoria" | "Sistema"

export default function UTMAnalyticsPage() {
  const [productFilter, setProductFilter] = useState<ProductFilter>("all")
  const { data, isLoading } = useUTMAnalytics(productFilter)

  const kpis = [
    { label: "Leads", value: data?.summary?.totalContacts ?? 0, icon: Users, format: (v: number) => v.toLocaleString() },
    { label: "Deals Criados", value: data?.summary?.totalDeals ?? 0, icon: Briefcase, format: (v: number) => v.toLocaleString() },
    { label: "Em Pipeline", value: data?.summary?.pipelineValue ?? 0, icon: Layers, format: (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) },
    { label: "Taxa Conversão", value: data?.summary?.conversionRate ?? 0, icon: Target, format: (v: number) => `${v.toFixed(1)}%` },
    { label: "Receita", value: data?.summary?.totalRevenue ?? 0, icon: DollarSign, format: (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-24 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">UTM Analytics</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-bold tracking-tight uppercase">Rastreamento de campanhas e atribuição de receita</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Filtrar por:</span>
          <Select value={productFilter} onValueChange={(v) => setProductFilter(v as ProductFilter)}>
            <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-white/5 text-[#6B7280] font-black text-[10px] uppercase tracking-widest h-9">
              <SelectValue placeholder="Pipeline" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">Todos os Produtos</SelectItem>
              <SelectItem value="Consultoria" className="text-[10px] font-black uppercase tracking-widest">Consultoria</SelectItem>
              <SelectItem value="Sistema" className="text-[10px] font-black uppercase tracking-widest">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-[#0A0A0A] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest flex items-center gap-2">
                <kpi.icon className="w-3 h-3" strokeWidth={2.5} />
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? (
                <Skeleton className="h-7 w-20 bg-white/5" />
              ) : (
                <p className="text-2xl font-black text-white tracking-tighter italic">
                  {kpi.format(kpi.value)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#0A0A0A] border border-white/5 p-1 h-auto mb-8">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 gap-2"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 gap-2"
          >
            <Megaphone className="w-3.5 h-3.5" /> Campanhas
          </TabsTrigger>
          <TabsTrigger 
            value="ads" 
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 gap-2"
          >
            <Target className="w-3.5 h-3.5" /> Anúncios
          </TabsTrigger>
          <TabsTrigger 
            value="sources" 
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 gap-2"
          >
            <Globe className="w-3.5 h-3.5" /> Fontes
          </TabsTrigger>
          <TabsTrigger 
            value="timeline" 
            className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-[#6B7280] text-[10px] font-black uppercase tracking-widest px-6 py-2.5 gap-2"
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Funil de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[300px] w-full bg-white/5" /> : <UTMFunnelChart data={data!.funnel} />}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {isLoading ? <Skeleton className="h-[300px] w-full bg-white/5" /> : <TopCampaignsCard data={data!.topCampaigns} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? <Skeleton className="h-[400px] w-full bg-white/5" /> : <TopAdsCard data={data!.topAds} />}
            
            <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Distribuição por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[300px] w-full bg-white/5" /> : <UTMSourceChart data={data!.sourceDistribution} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Performance por Campanha</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[400px] w-full bg-white/5" /> : <UTMPerformanceTable data={data!.performance} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="mt-0">
          <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Performance por Anúncio</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[400px] w-full bg-white/5" /> : <UTMAdTable data={data!.topAds} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-0">
          <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Distribuição por Fonte</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full bg-white/5" /> : <UTMSourceChart data={data!.sourceDistribution} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <Card className="bg-[#0A0A0A]/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Evolução (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full bg-white/5" /> : <UTMTimelineChart data={data!.timeline} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
