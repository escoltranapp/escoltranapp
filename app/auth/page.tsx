"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email("Email corporativo inválido"),
  password: z.string().min(6, "Token de segurança muito curto"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As chaves não coincidem",
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
        toast({ variant: "destructive", title: "ERRO DE ACESSO", description: "O dataset não reconhece estas credenciais." })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast({ variant: "destructive", title: "TIMEOUT", description: "Falha na comunicação com o servidor Escoltran." })
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
        toast({ title: "ACESSO LIBERADO", description: "Seu nó operacional foi provisionado com sucesso." })
        await signIn("credentials", { email: data.email, password: data.password, redirect: false })
        router.push("/dashboard")
      } else {
        const err = await response.json()
        toast({ variant: "destructive", title: "FALHA NO REGISTRO", description: err.message })
      }
    } catch {
      toast({ variant: "destructive", title: "TIMEOUT", description: "O cluster Escoltran não respondeu ao registro." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F97316]/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
      
      <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
        
        {/* BRAND IDENTITY */}
        <div className="flex flex-col items-center mb-12 group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] mb-6 transition-transform duration-500 group-hover:scale-110">
             <span className="text-white font-black text-3xl italic">E</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Escoltran</h1>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-4 h-1 bg-[#F97316] rounded-full" />
             <span className="text-[10px] text-[#6B7280] font-black tracking-[0.3em] uppercase">Enterprise CRM</span>
          </div>
        </div>

        {/* AUTH CARD */}
        <div className="bg-[#1A1A1A]/50 backdrop-blur-3xl border border-white/[0.05] rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent" />
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="bg-[#0A0A0A]/80 border border-white/[0.03] p-1.5 rounded-2xl mb-10 w-full flex">
              <TabsTrigger 
                value="login" 
                className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-xl"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-xl"
              >
                Provisionar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in slide-in-from-bottom-2 duration-500">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Acesso Corporativo</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] text-[18px] group-focus-within:text-[#F97316] transition-colors">mail</span>
                    <input 
                      type="email" 
                      placeholder="nomedeusuario@escoltran.com" 
                      className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl pl-11 pr-4 py-4 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                      {...loginForm.register("email")}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest">Matriz de Senha</label>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#404040] text-[18px] group-focus-within:text-[#F97316] transition-colors">lock</span>
                    <input 
                      type="password" 
                      placeholder="••••••••••••" 
                      className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl pl-11 pr-4 py-4 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                      {...loginForm.register("password")}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#F97316]/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Autenticar no Cluster
                    </>
                  )}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in slide-in-from-bottom-2 duration-500">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Identificação Operacional</label>
                  <input 
                    placeholder="Seu nome completo" 
                    className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                    {...registerForm.register("name")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Email Registrável</label>
                  <input 
                    type="email" 
                    placeholder="nome@empresa.com" 
                    className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                    {...registerForm.register("email")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Criar Senha</label>
                    <input 
                      type="password" 
                      placeholder="••••••" 
                      className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-[#404040] uppercase tracking-widest pl-1">Confirmar</label>
                    <input 
                      type="password" 
                      placeholder="••••••" 
                      className="w-full bg-[#0A0A0A] border border-white/[0.03] rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#F97316]/50 outline-none transition-all font-bold placeholder:text-[#262626]"
                      {...registerForm.register("confirmPassword")}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-4 py-4 bg-[#F2F2F2] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#F97316] hover:text-white transition-all disabled:opacity-30"
                >
                  {isLoading ? "Processando Registro..." : "Habilitar Novo Nó"}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER INFO */}
        <p className="mt-12 text-center text-[9px] font-black text-[#262626] uppercase tracking-[0.4em] italic select-none">
          Secured by Escoltran Engine Alpha-7
        </p>
      </div>
    </div>
  )
}
