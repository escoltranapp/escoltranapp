"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { ShieldCheck, Zap, Lock } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast({ variant: "destructive", title: "Erro ao entrar", description: "Credenciais inválidas." })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Falha na comunicação." })
    } finally {
      setIsLoading(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      if (response.ok) {
        toast({ title: "Bem-vindo!", description: "Conta criada com sucesso." })
        await signIn("credentials", { email: data.email, password: data.password, redirect: false })
        router.push("/dashboard")
      } else {
        const err = await response.json()
        toast({ variant: "destructive", title: "Erro no cadastro", description: err.message })
      }
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Falha na comunicação." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-bg-composition font-sans selection:bg-[#d4af37]/30">
      {/* BACKGROUND ARCHITECTURE */}
      <div className="auth-bg-radial" />
      <div className="auth-bg-noise" />
      <div className="auth-bg-grid" />

      <div className="relative flex flex-col items-center animate-entrance px-6">
        
        {/* BRAND IDENTITY */}
        <div className="text-center mb-10 flex flex-col items-center group">
          <div className="auth-logo-box transition-transform duration-500 group-hover:scale-110">
             <span className="text-4xl font-black text-black select-none">E</span>
          </div>
          <h1 className="auth-wordmark animate-aether">Escoltran</h1>
          <p className="auth-tagline">Inteligência em Prospecção CRM</p>
        </div>

        {/* AUTH ARCHITECTURE */}
        <div className="glass-auth-card">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="auth-tab-container w-full h-auto p-1.5 border-white/[0.03]">
              <TabsTrigger value="login" className="auth-tab-trigger">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="auth-tab-trigger">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="auth-label">Email Corporativo</label>
                  <Input id="login-email" type="email" placeholder="nome@empresa.com" className="auth-input" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest px-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="auth-label">Senha de Acesso</label>
                    <button type="button" className="text-[11px] text-[#d4af37]/80 hover:text-[#d4af37] font-bold tracking-tight transition-colors">Esqueceu a senha?</button>
                  </div>
                  <Input id="login-password" type="password" placeholder="••••••••" className="auth-input" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest px-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                  {isLoading ? "Autenticando..." : "Iniciar Sessão"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="reg-name" className="auth-label">Identificação</label>
                  <Input id="reg-name" placeholder="Seu nome completo" className="auth-input" {...registerForm.register("name")} />
                  {registerForm.formState.errors.name && (
                    <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest px-1">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="reg-email" className="auth-label">Email Corporativo</label>
                  <Input id="reg-email" type="email" placeholder="nome@empresa.com" className="auth-input" {...registerForm.register("email")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="auth-label">Senha</label>
                    <Input id="reg-password" type="password" placeholder="••••••••" className="auth-input" {...registerForm.register("password")} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-confirm" className="auth-label">Confirmar</label>
                    <Input id="reg-confirm" type="password" placeholder="••••••••" className="auth-input" {...registerForm.register("confirmPassword")} />
                  </div>
                </div>
                <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                  {isLoading ? "Processando..." : "Finalizar Cadastro"}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <footer className="mt-10 text-center border-t border-white/[0.03] pt-6">
            <p className="text-[12px] text-white/20 font-medium">
              Suporte Técnico <a href="#" className="text-[#d4af37]/60 hover:text-[#d4af37] transition-all">Central Escoltran</a>
            </p>
          </footer>
        </div>

        {/* TRUST SIGNALS */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-12 text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] select-none">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
             <Lock size={12} className="text-[#d4af37]/40" /> SSL SECURE
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
             <Zap size={12} className="text-[#d4af37]/40" /> HIGH SPEED
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
             <ShieldCheck size={12} className="text-[#d4af37]/40" /> ENCRYPTED
           </div>
        </div>

      </div>
    </div>
  )
}
