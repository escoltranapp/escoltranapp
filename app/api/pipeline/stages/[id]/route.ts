import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, color } = body

    // Verify stage belongs to user through pipeline
    const stage = await prisma.stage.findFirst({
      where: { id, pipeline: { userId: session.user.id } },
    })

    if (!stage) {
      return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 })
    }

    const updated = await prisma.stage.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/pipeline/stages/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify stage belongs to user
    const stage = await prisma.stage.findFirst({
      where: { id, pipeline: { userId: session.user.id } },
      include: { deals: true }
    })

    if (!stage) {
      return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 })
    }

    // Don't delete if there are deals (safeguard)
    if (stage.deals.length > 0) {
      return NextResponse.json({ 
        error: "Não é possível excluir uma etapa que contém registros ativos." 
      }, { status: 400 })
    }

    await prisma.stage.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/pipeline/stages/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
