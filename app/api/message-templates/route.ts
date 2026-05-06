import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("GET /api/message-templates error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nome, canal, conteudo, variaveis } = await req.json()

    if (!nome || !conteudo) {
      return NextResponse.json({ error: "Nome e conteúdo são obrigatórios" }, { status: 400 })
    }

    const template = await prisma.messageTemplate.create({
      data: {
        nome,
        canal: canal || "WHATSAPP",
        conteudo,
        variaveis: variaveis || [],
        userId: session.user.id
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("POST /api/message-templates error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
