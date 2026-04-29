import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      name, email, phone,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      referrer, landing_page,
      source_system = 'webhook',
      user_id,
    } = payload;

    if (!user_id) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const now = new Date();

    // 1. Search for existing contact
    let contact = null;
    if (email) {
      contact = await prisma.contact.findFirst({ where: { email, userId: user_id } });
    }
    if (!contact && phone) {
      contact = await prisma.contact.findFirst({ where: { telefone: phone, userId: user_id } });
    }

    const utmFieldsLast = {
      utmSourceLast: utm_source || null,
      utmMediumLast: utm_medium || null,
      utmCampaignLast: utm_campaign || null,
      utmContentLast: utm_content || null,
      utmTermLast: utm_term || null,
      landingPageLast: landing_page || null,
      referrerLast: referrer || null,
      updatedAt: now,
    };

    if (contact) {
      // 2. Update existing contact
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: utmFieldsLast,
      });
    } else {
      // 3. Create new contact
      contact = await prisma.contact.create({
        data: {
          nome: name || "Lead Webhook",
          email,
          telefone: phone,
          userId: user_id,
          utmSourceFirst: utm_source || null,
          utmMediumFirst: utm_medium || null,
          utmCampaignFirst: utm_campaign || null,
          utmContentFirst: utm_content || null,
          utmTermFirst: utm_term || null,
          landingPageFirst: landing_page || null,
          referrerFirst: referrer || null,
          ...utmFieldsLast,
        },
      });
    }

    // 4. Register tracking event
    await prisma.trackingEvent.create({
      data: {
        contactId: contact.id,
        evento: "webhook_ingest",
        utmSource: utm_source || null,
        utmMedium: utm_medium || null,
        utmCampaign: utm_campaign || null,
        utmContent: utm_content || null,
        utmTerm: utm_term || null,
        landingPage: landing_page || null,
        referrer: referrer || null,
        metadata: payload,
      },
    });

    return NextResponse.json({ success: true, contactId: contact.id });
  } catch (error) {
    console.error("[WEBHOOK_INGEST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
