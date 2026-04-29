import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    // Filter by user and product if provided
    const baseWhere: any = { userId: session.user.id };
    if (productId && productId !== "all") {
      baseWhere.produtoInteresse = productId;
    }

    // 1. Fetch Stats
    const [leadsCount, dealsCount, inPipelineDeals, wonDeals] = await Promise.all([
      prisma.contact.count({
        where: { 
          userId: session.user.id,
          OR: [
            { utmSourceFirst: { not: null } },
            { utmSourceLast: { not: null } }
          ]
        }
      }),
      prisma.deal.count({
        where: baseWhere
      }),
      prisma.deal.findMany({
        where: { ...baseWhere, status: "OPEN" },
        select: { valorEstimado: true }
      }),
      prisma.deal.findMany({
        where: { ...baseWhere, status: "WON" },
        select: { valorEstimado: true }
      })
    ]);

    const totalPipelineValue = inPipelineDeals.reduce((acc, deal) => acc + (deal.valorEstimado || 0), 0);
    const totalRevenue = wonDeals.reduce((acc, deal) => acc + (deal.valorEstimado || 0), 0);
    const wonCount = wonDeals.length;
    const conversionRate = leadsCount > 0 ? (wonCount / leadsCount) * 100 : 0;

    // 2. Funnel Data
    // Simplified funnel: Sources (Unique sources) -> Leads -> Deals -> Won
    const uniqueSourcesCount = await prisma.contact.groupBy({
      by: ['utmSourceFirst'],
      where: { userId: session.user.id, utmSourceFirst: { not: null } },
      _count: true
    }).then(res => res.length);

    const funnel = {
      sources: uniqueSourcesCount,
      leads: leadsCount,
      deals: dealsCount,
      won: wonCount
    };

    // 3. Top Campaigns
    const topCampaignsRaw = await prisma.deal.groupBy({
      by: ['utmCampaign'],
      where: { ...baseWhere, utmCampaign: { not: null } },
      _count: { _all: true },
      _sum: { valorEstimado: true },
    });

    // For each campaign, count won deals and leads
    const topCampaigns = await Promise.all(topCampaignsRaw.map(async (camp) => {
      const wonForCamp = await prisma.deal.count({
        where: { ...baseWhere, utmCampaign: camp.utmCampaign, status: "WON" }
      });
      const leadsForCamp = await prisma.contact.count({
        where: { userId: session.user.id, utmCampaignFirst: camp.utmCampaign }
      });

      return {
        name: camp.utmCampaign,
        leads: leadsForCamp,
        deals: camp._count._all,
        won: wonForCamp,
        revenue: camp._sum.valorEstimado || 0,
        conversion: leadsForCamp > 0 ? (wonForCamp / leadsForCamp) * 100 : 0
      };
    }));

    // Sort by revenue
    topCampaigns.sort((a, b) => b.revenue - a.revenue);

    // 4. Top Ads (using utmContent as ad name)
    const topAdsRaw = await prisma.deal.groupBy({
      by: ['utmContent'],
      where: { ...baseWhere, utmContent: { not: null } },
      _count: { _all: true },
      _sum: { valorEstimado: true },
    });

    const topAds = await Promise.all(topAdsRaw.map(async (ad) => {
      const wonForAd = await prisma.deal.count({
        where: { ...baseWhere, utmContent: ad.utmContent, status: "WON" }
      });
      const leadsForAd = await prisma.contact.count({
        where: { userId: session.user.id, utmContentFirst: ad.utmContent }
      });

      return {
        name: ad.utmContent,
        leads: leadsForAd,
        deals: ad._count._all,
        won: wonForAd,
        revenue: ad._sum.valorEstimado || 0,
        conversion: leadsForAd > 0 ? (wonForAd / leadsForAd) * 100 : 0
      };
    }));

    topAds.sort((a, b) => b.revenue - a.revenue);

    // 5. Source Distribution
    const sourceDistRaw = await prisma.contact.groupBy({
      by: ['utmSourceFirst'],
      where: { userId: session.user.id, utmSourceFirst: { not: null } },
      _count: { _all: true }
    });

    const sourceDistribution = sourceDistRaw.map(src => ({
      name: src.utmSourceFirst,
      value: src._count._all
    }));

    return NextResponse.json({
      stats: {
        leads: leadsCount,
        deals: dealsCount,
        pipelineValue: totalPipelineValue,
        conversionRate,
        revenue: totalRevenue
      },
      funnel,
      topCampaigns: topCampaigns.slice(0, 5),
      topAds: topAds.slice(0, 5),
      sourceDistribution
    });

  } catch (error) {
    console.error("[UTM_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
