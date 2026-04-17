import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log(`[test-webhook] Testando conexão com: ${url}`)

    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        test: true, 
        message: "Teste de conexão via Escoltran Server",
        timestamp: new Date().toISOString()
      }),
    })

    const status = res.status
    const text = await res.text()

    return NextResponse.json({ 
      ok: res.ok, 
      status, 
      message: text.slice(0, 200) // Pega só o começo da resposta
    })

  } catch (error: any) {
    console.error("[test-webhook] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
