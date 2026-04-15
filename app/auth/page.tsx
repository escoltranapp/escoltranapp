"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen flex items-center justify-center bg-bg-base relative overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-[420px] mx-4 animate-entrance">
        {/* Logo Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(224,176,80,0.3)] animate-gold-pulse">
            <span className="text-3xl font-black text-accent-foreground select-none">E</span>
          </div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-1">
            Escoltran
          </h1>
          <p className="text-sm font-display italic text-accent tracking-wide">
            Inteligência em Prospecção CRM
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass rounded-2xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-white/5 relative overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8 bg-black/40 p-1 border border-white/5 rounded-lg h-11">
              <TabsTrigger 
                value="login" 
                className="rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-text-muted font-bold text-xs uppercase tracking-widest transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-text-muted font-bold text-xs uppercase tracking-widest transition-all"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Email Profissional</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ex@escoltran.com"
                    autoComplete="email"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] text-danger font-mono font-bold mt-1 uppercase tracking-tighter">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Senha de Acesso</Label>
                    <button type="button" className="text-[10px] text-accent/60 hover:text-accent font-bold uppercase tracking-tighter transition-colors">Esqueceu a senha?</button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] text-danger font-mono font-bold mt-1 uppercase tracking-tighter">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Validando Acesso..." : "Iniciar Sessão"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="animate-slide-up focus-visible:outline-none">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Nome Completo</Label>
                  <Input
                    id="reg-name"
                    placeholder="Como deseja ser chamado?"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-[10px] text-danger font-mono font-bold mt-1 uppercase tracking-tighter">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Email Corporativo</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="ex@empresa.com"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-[10px] text-danger font-mono font-bold mt-1 uppercase tracking-tighter">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Senha</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm" className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Confirmação</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register("confirmPassword")}
                    />
                  </div>
                </div>
                {(registerForm.formState.errors.password || registerForm.formState.errors.confirmPassword) && (
                  <p className="text-[10px] text-danger font-mono font-bold uppercase tracking-tighter">
                    {registerForm.formState.errors.password?.message || registerForm.formState.errors.confirmPassword?.message}
                  </p>
                )}
                <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                  {isLoading ? "Propagando Dados..." : "Finalizar Cadastro"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Support Section */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-text-muted font-sans tracking-wide">
            Problemas no acesso? <span className="text-accent cursor-pointer hover:underline">Contate o suporte Escoltran</span>
          </p>
        </div>
      </div>
    </div>
  )
}
