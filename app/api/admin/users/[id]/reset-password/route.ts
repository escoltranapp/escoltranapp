import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { newPassword } = await req.json()

  if (!newPassword) {
    return NextResponse.json({ error: "Nova senha é obrigatória" }, { status: 400 })
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao resetar senha:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
