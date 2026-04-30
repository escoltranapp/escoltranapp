import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { module, level } = await req.json()

  try {
    const permission = await prisma.modulePermission.upsert({
      where: {
        userId_moduleName: {
          userId: id,
          moduleName: module,
        },
      },
      update: {
        level: level,
      },
      create: {
        userId: id,
        moduleName: module,
        level: level,
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("Erro ao atualizar permissão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
