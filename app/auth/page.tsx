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
import { ShieldCheck, Zap, Lock, Sparkles } from "lucide-react"

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

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: "Email ou senha incorretos.",
        })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
      })
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
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (response.ok) {
        toast({
          title: "Conta criada!",
          description: "Faça login para continuar.",
        })
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })
        if (!result?.error) {
          router.push("/dashboard")
        }
      } else {
        const err = await response.json()
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: err.message || "Tente novamente.",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-bg-composition font-sans">
      {/* 1. COMPOSIÇÃO DE FUNDO */}
      <div className="auth-bg-radial" />
      <div className="auth-bg-noise" />
      <div className="auth-bg-grid" />

      <div className="relative flex flex-col items-center animate-entrance">
        
        {/* 2. ÁREA DO LOGO */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="auth-logo-box">
             <span className="text-3xl font-black text-black select-none">E</span>
          </div>
          <h1 className="auth-wordmark">Escoltran</h1>
          <p className="auth-tagline">Inteligência em Prospecção CRM</p>
        </div>

        {/* 3. CARD DE AUTENTICAÇÃO */}
        <div className="glass-auth-card">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="auth-tab-container w-full h-auto p-1.5">
              <TabsTrigger 
                value="login" 
                className="auth-tab-trigger flex-1 h-10 text-[11px] font-bold uppercase tracking-widest text-white/40 data-[state=active]:text-black transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="auth-tab-trigger flex-1 h-10 text-[11px] font-bold uppercase tracking-widest text-white/40 data-[state=active]:text-black transition-all"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* Login Flow */}
            <TabsContent value="login" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="login-email" className="auth-label">Email Profissional</label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ex@escoltran.com"
                    className="auth-input"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="auth-label">Senha de Acesso</label>
                    <button type="button" className="text-[11px] text-[#C89B3C] hover:underline font-bold tracking-tight">Esqueceu a senha?</button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="auth-input"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                  {isLoading ? "Validando Acesso..." : "Iniciar Sessão"}
                </button>
              </form>
            </TabsContent>

            {/* Register Flow */}
            <TabsContent value="register" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="auth-label">Nome Completo</label>
                  <Input
                    id="reg-name"
                    placeholder="Como deseja ser chamado?"
                    className="auth-input"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="auth-label">Email Corporativo</label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="ex@empresa.com"
                    className="auth-input"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="reg-password" className="auth-label">Senha</label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      className="auth-input"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="reg-confirm" className="auth-label">Confirmação</label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="auth-input"
                      {...registerForm.register("confirmPassword")}
                    />
                  </div>
                </div>
                {(registerForm.formState.errors.password || registerForm.formState.errors.confirmPassword) && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                    {registerForm.formState.errors.password?.message || registerForm.formState.errors.confirmPassword?.message}
                  </p>
                )}
                <button type="submit" className="btn-auth-primary" disabled={isLoading}>
                  {isLoading ? "Propagando Dados..." : "Finalizar Cadastro"}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Support Line */}
          <div className="mt-8 text-center">
            <p className="text-[12px] text-white/30">
              Problemas no acesso? <a href="#" className="text-[#C89B3C]/65 hover:text-[#C89B3C] hover:underline transition-all">Contate o suporte Escoltran</a>
            </p>
          </div>
        </div>

        {/* 4. SECURITY BADGES */}
        <div className="flex items-center gap-2 mt-8 text-[10px] text-white/25 font-bold uppercase tracking-widest select-none">
           <div className="flex items-center gap-1.5"><Lock size={12} className="text-[#C89B3C]/40" /> Conexão Segura SSL</div>
           <span className="opacity-20">·</span>
           <div className="flex items-center gap-1.5"><Zap size={12} className="text-[#C89B3C]/40" /> 99.9% Uptime</div>
           <span className="opacity-20">·</span>
           <div className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#C89B3C]/40" /> Dados Criptografados</div>
        </div>

      </div>
    </div>
  )
}
