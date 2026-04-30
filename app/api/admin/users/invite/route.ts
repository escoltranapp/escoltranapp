import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MEMBER",
        status: "ATIVO",
      },
    })

    // Create default permissions
    const modules = ["pipeline", "contacts", "activities", "lead-search", "mass-messaging", "utm-analytics", "ai-insights"]
    await prisma.modulePermission.createMany({
      data: modules.map(m => ({
        userId: user.id,
        moduleName: m,
        level: "VIEW" // Default level
      }))
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erro ao convidar usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
