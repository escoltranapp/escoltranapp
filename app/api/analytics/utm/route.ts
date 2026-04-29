import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { classifyDeal, normalizeSourceLabel, getProductGroup } from "@/lib/lead-classification";
import { subDays, format, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || "all";
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");

    const baseWhere: any = { userId: session.user.id };
    if (productId !== "all") {
      baseWhere.produtoInteresse = productId;
    }
    
    // Add date filters if provided
    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) baseWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) baseWhere.createdAt.lte = new Date(dateTo);
    }

    // 1. Fetch Raw Data
    const [contacts, deals] = await Promise.all([
      prisma.contact.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          utmSourceFirst: true,
          utmMediumFirst: true,
          utmCampaignFirst: true,
          utmContentFirst: true,
          createdAt: true,
        }
      }),
      prisma.deal.findMany({
        where: baseWhere,
        select: {
          id: true,
          titulo: true,
          valorEstimado: true,
          status: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          createdAt: true,
        }
      })
    ]);

    // 2. Process Data
    const classifiedDeals = deals.map(d => classifyDeal(d));
    
    const wonDeals = classifiedDeals.filter(d => d.status === "WON");
    const openDeals = classifiedDeals.filter(d => d.status === "OPEN");
    const lostDeals = classifiedDeals.filter(d => d.status === "LOST");

    const totalRevenue = wonDeals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0);
    const totalPipelineValue = openDeals.reduce((acc, d) => acc + (d.valorEstimado || 0), 0);
    
    // Summary
    const summary = {
      totalContacts: contacts.length,
      totalDeals: classifiedDeals.length,
      totalWon: wonDeals.length,
      totalRevenue,
      conversionRate: contacts.length > 0 ? (wonDeals.length / contacts.length) * 100 : 0,
      avgTicket: wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0,
      pipelineValue: totalPipelineValue,
      openDeals: openDeals.length,
      uniqueCampaigns: new Set(classifiedDeals.map(d => d.utmCampaign).filter(Boolean)).size,
    };

    // Performance by Campaign
    const campaignMap = new Map();
    contacts.forEach(c => {
      const key = c.utmCampaignFirst || "Direto";
      if (!campaignMap.has(key)) {
        campaignMap.set(key, { 
          campaign: key, 
          source: normalizeSourceLabel(c.utmSourceFirst), 
          medium: c.utmMediumFirst || "", 
          leads: 0, deals: 0, won: 0, lost: 0, revenue: 0 
        });
      }
      campaignMap.get(key).leads++;
    });

    classifiedDeals.forEach(d => {
      const key = d.utmCampaign || "Direto";
      if (!campaignMap.has(key)) {
        campaignMap.set(key, { 
          campaign: key, 
          source: normalizeSourceLabel(d.utmSource), 
          medium: d.utmMedium || "", 
          leads: 0, deals: 0, won: 0, lost: 0, revenue: 0 
        });
      }
      const row = campaignMap.get(key);
      row.deals++;
      if (d.status === "WON") {
        row.won++;
        row.revenue += d.valorEstimado || 0;
      } else if (d.status === "LOST") {
        row.lost++;
      }
    });

    const performance = Array.from(campaignMap.values()).map(r => ({
      ...r,
      conversion_rate: r.leads > 0 ? (r.won / r.leads) * 100 : 0,
      avg_ticket: r.won > 0 ? r.revenue / r.won : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    // Distribution by Source
    const sourceMap = new Map();
    contacts.forEach(c => {
      const key = normalizeSourceLabel(c.utmSourceFirst);
      if (!sourceMap.has(key)) sourceMap.set(key, { source: key, leads: 0, deals: 0, revenue: 0 });
      sourceMap.get(key).leads++;
    });
    classifiedDeals.forEach(d => {
      const key = normalizeSourceLabel(d.utmSource);
      if (!sourceMap.has(key)) sourceMap.set(key, { source: key, leads: 0, deals: 0, revenue: 0 });
      const row = sourceMap.get(key);
      row.deals++;
      if (d.status === "WON") row.revenue += d.valorEstimado || 0;
    });
    const sourceDistribution = Array.from(sourceMap.values());

    // Funnel Summary
    const funnel = {
      sources: Array.from(new Set(contacts.map(c => normalizeSourceLabel(c.utmSourceFirst)))),
      leads: contacts.length,
      deals: classifiedDeals.length,
      won: wonDeals.length
    };

    // Timeline (last 30 days)
    const timelineMap = new Map();
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    contacts.forEach(c => {
      if (new Date(c.createdAt) >= thirtyDaysAgo) {
        const date = format(c.createdAt, "yyyy-MM-dd");
        if (!timelineMap.has(date)) timelineMap.set(date, { date, leads: 0, deals: 0, revenue: 0 });
        timelineMap.get(date).leads++;
      }
    });
    classifiedDeals.forEach(d => {
      if (new Date(d.createdAt) >= thirtyDaysAgo) {
        const date = format(d.createdAt, "yyyy-MM-dd");
        if (!timelineMap.has(date)) timelineMap.set(date, { date, leads: 0, deals: 0, revenue: 0 });
        const row = timelineMap.get(date);
        row.deals++;
        if (d.status === "WON") row.revenue += d.valorEstimado || 0;
      }
    });
    const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Top Ads
    const adMap = new Map();
    classifiedDeals.forEach(d => {
      const key = d.utmContent || "Sem criativo";
      if (!adMap.has(key)) {
        adMap.set(key, { 
          name: key, 
          adset: d.utmCampaign, 
          source: normalizeSourceLabel(d.utmSource), 
          leads: 0, deals: 0, won: 0, lost: 0, pipeline_value: 0, revenue: 0 
        });
      }
      const row = adMap.get(key);
      row.deals++;
      if (d.status === "WON") { row.won++; row.revenue += d.valorEstimado || 0; }
      else if (d.status === "LOST") row.lost++;
      else if (d.status === "OPEN") row.pipeline_value += d.valorEstimado || 0;
    });
    // Add leads to adMap from contacts
    contacts.forEach(c => {
      const key = c.utmContentFirst || "Sem criativo";
      if (adMap.has(key)) adMap.get(key).leads++;
    });
    const topAds = Array.from(adMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.pipeline_value - a.pipeline_value)
      .slice(0, 10);

    return NextResponse.json({
      summary,
      performance,
      sourceDistribution,
      funnel,
      timeline,
      topAds,
      topCampaigns: performance.slice(0, 10)
    });

  } catch (error) {
    console.error("[UTM_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
