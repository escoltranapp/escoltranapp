import { useQuery } from "@tanstack/react-query"

export interface UTMAnalyticsData {
  summary: {
    totalContacts: number
    totalDeals: number
    totalWon: number
    totalRevenue: number
    conversionRate: number
    avgTicket: number
    pipelineValue: number
    openDeals: number
    uniqueCampaigns: number
  }
  performance: any[]
  sourceDistribution: any[]
  funnel: {
    sources: string[]
    leads: number
    deals: number
    won: number
  }
  timeline: any[]
  topAds: any[]
  topCampaigns: any[]
}

export function useUTMAnalytics(productId: string = "all", from?: string, to?: string) {
  return useQuery<UTMAnalyticsData>({
    queryKey: ["utm-analytics", productId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ productId })
      if (from) params.append("from", from)
      if (to) params.append("to", to)
      
      const res = await fetch(`/api/analytics/utm?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch UTM analytics")
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
