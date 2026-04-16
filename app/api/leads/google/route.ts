import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { estado, cidade, nicho } = body

    // 1. Log the search in history
    await prisma.historicoBusca.create({
      data: {
        userId: session.user.id,
        estado,
        cidade,
        nicho
      }
    })

    // 2. Get user's N8N webhook URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { n8nWebhookUrl: true }
    })

    const webhookUrl = user?.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || "https://auto.devnetlife.com/webhook/buscar-google"
    
    console.log(`[LEAD_SEARCH_GOOGLE] Triggering: ${webhookUrl} for user: ${session.user.id}`)

    // 3. Trigger N8N
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado,
        cidade,
        nicho,
        user_id: session.user.id
      })
    })

    if (!n8nResponse.ok) {
      throw new Error("Falha na comunicação com o broker de automação")
    }

    return NextResponse.json({ success: true, message: "Orquestração iniciada com sucesso" })
  } catch (error: any) {
    console.error("[LEAD_SEARCH_GOOGLE]", error)
    return new NextResponse(error.message || "Internal Error", { status: 500 })
  }
}
