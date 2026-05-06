import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        n8nWebhookUrl: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/user/profile error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { n8nWebhookUrl, name, email, password } = await req.json()

    // Verificação de e-mail duplicado (garante que não pertence a OUTRO usuário)
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          NOT: { id: session.user.id }
        }
      })
      if (existingUser) {
        return NextResponse.json({ error: "Este e-mail já está sendo utilizado por outro usuário" }, { status: 400 })
      }
    }

    const data: any = {
      n8nWebhookUrl,
      name,
      email
    }

    if (password) {
      const bcrypt = await import("bcryptjs")
      data.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
