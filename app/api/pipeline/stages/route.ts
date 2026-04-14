import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find or create default pipeline for user
    let pipeline = await prisma.pipeline.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    if (!pipeline) {
      pipeline = await prisma.pipeline.create({
        data: {
          name: "Pipeline Principal",
          userId: session.user.id,
          stages: {
            createMany: {
              data: [
                { name: "Prospecção", color: "#6b7280", order: 0 },
                { name: "Qualificação", color: "#f97316", order: 1 },
                { name: "Proposta", color: "#f59e0b", order: 2 },
                { name: "Negociação", color: "#8b5cf6", order: 3 },
                { name: "Fechamento", color: "#22c55e", order: 4 },
              ],
            },
          },
        },
      })
    }

    const stages = await prisma.stage.findMany({
      where: { pipelineId: pipeline.id },
      orderBy: { order: "asc" },
      include: {
        deals: {
          where: { status: "OPEN", userId: session.user.id },
          orderBy: { createdAt: "desc" },
          include: {
            contact: { select: { nome: true, sobrenome: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ stages, pipelineId: pipeline.id, pipelineName: pipeline.name })
  } catch (error) {
    console.error("GET /api/pipeline/stages error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, color = "#6b7280", pipelineId } = body

    if (!name || !pipelineId) {
      return NextResponse.json({ error: "Nome e pipelineId são obrigatórios" }, { status: 400 })
    }

    // Verify pipeline belongs to user
    const pipeline = await prisma.pipeline.findFirst({
      where: { id: pipelineId, userId: session.user.id },
    })
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline não encontrado" }, { status: 404 })
    }

    const lastStage = await prisma.stage.findFirst({
      where: { pipelineId },
      orderBy: { order: "desc" },
    })

    const stage = await prisma.stage.create({
      data: {
        name,
        color,
        order: (lastStage?.order ?? -1) + 1,
        pipelineId,
      },
    })

    return NextResponse.json(stage, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
