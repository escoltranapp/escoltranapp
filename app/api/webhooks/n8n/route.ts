import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, data } = body

    // Get user's n8n webhook URL from settings
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { n8nWebhookUrl: true },
    })

    if (!user?.n8nWebhookUrl) {
      return NextResponse.json(
        { error: "n8n webhook URL not configured" },
        { status: 400 }
      )
    }

    // Forward to n8n
    const response = await fetch(user.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, userId: session.user.id }),
    })

    const result = await response.json().catch(() => ({ ok: true }))
    return NextResponse.json(result)
  } catch (error) {
    console.error("n8n webhook error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
