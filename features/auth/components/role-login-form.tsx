"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Zap, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react"

import { loginSchema, type LoginFormData } from "@/features/auth/schemas"
import { loginAction, resendConfirmationAction } from "@/actions/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LoginState = "idle" | "loading" | "error" | "success" | "wrong_role"

interface RoleLoginFormProps {
  role: "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE"
  heading: string
  subtitle: string
  accentColor: string 
  accentHover: string
  accentText: string
  accentBorder: string
  accentGlow: string
  illustrationTheme: "navy" | "blue" | "purple" | "green"
}

export function RoleLoginForm({
  role,
  heading,
  subtitle,
  accentColor,
  accentHover,
  accentText,
  accentBorder,
  accentGlow,
  illustrationTheme
}: RoleLoginFormProps) {
  const router = useRouter()
  const [loginState, setLoginState] = useState<LoginState>("idle")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [shake, setShake] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [welcomeName, setWelcomeName] = useState("")
  const [actualRole, setActualRole] = useState("")
  const [correctUrl, setCorrectUrl] = useState("")

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormData) {
    if (process.env.NODE_ENV === "development") {
      console.log("Email:", data.email)
      console.log("Password Length:", data.password?.length || 0)
    }

    if (!data.password || data.password.trim() === "") {
      toast.error("Please enter your password.")
      setLoginState("error")
      setShake(true)
      setPasswordError(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    setLoginState("loading")
    setPasswordError(false)
    setUnconfirmedEmail(null)
    
    const result = await loginAction(data, role)
    
    if (result?.error) {
      if (process.env.NODE_ENV === "development" && result.rawError) {
        console.error("Backend Authentication Error:", result.rawError)
      }

      setLoginState("error")
      setShake(true)
      setPasswordError(true)
      setTimeout(() => setShake(false), 600)
      toast.error(result.error)

      if (result.error === "EMAIL_NOT_CONFIRMED") {
        setUnconfirmedEmail(data.email)
        form.setValue("password", "")
        setTimeout(() => form.setFocus("password"), 50)
        return
      }

      form.setValue("password", "")
      setTimeout(() => form.setFocus("password"), 50)
      return
    }

    if (result?.success) {
      if (result.wrongRole) {
        setLoginState("wrong_role")
        setActualRole(result.actualRoleString || "Employee")
        setCorrectUrl(result.correctLoginUrl || "/login/employee")
        return
      }

      setWelcomeName(result.userName || "there")
      setLoginState("success")
      setTimeout(() => {
        router.push(result.redirectUrl!)
        router.refresh()
      }, 1400)
    }
  }

  async function handleResend() {
    if (!unconfirmedEmail) return
    setIsResending(true)
    const res = await resendConfirmationAction(unconfirmedEmail)
    setIsResending(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Confirmation email sent! Please check your inbox.")
      setUnconfirmedEmail(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className={cn("absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3", accentColor)} />
        <div className={cn("absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-10 translate-y-1/3 -translate-x-1/3", accentColor)} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center z-10 px-4 sm:px-6 py-12">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Home</span>
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("p-2 rounded-xl bg-white/5 border backdrop-blur-sm", accentBorder)}>
                <Zap className={cn("w-6 h-6", accentText)} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AssetFlow</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              {heading}
            </h1>
            <p className="text-slate-400 text-sm">
              {subtitle}
            </p>
          </div>

          <div className={cn(
            "relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300",
            shake && "animate-shake",
            passwordError && accentBorder,
            loginState === "wrong_role" && "border-amber-500/50 shadow-amber-500/10"
          )}>
            
            {loginState === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-6 relative bg-emerald-500/10", accentText)}>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-in zoom-in delay-150 duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome back, {welcomeName}!</h3>
                <p className="text-slate-400">Securely authenticating your session...</p>
                <div className="mt-8 flex gap-1.5 justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </div>
            ) : loginState === "wrong_role" ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Wrong Portal</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  This account belongs to the <span className="font-semibold text-amber-400">{actualRole}</span> portal.
                </p>
                <Link 
                  href={correctUrl} 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-amber-500/25 transition-all w-full text-center"
                >
                  Go to Correct Login
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Work Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@company.com"
                            autoComplete="email"
                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-white/20 h-11 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-300">Password</FormLabel>
                          <Link href="/forgot-password" className={cn("text-xs font-medium hover:underline", accentText)}>
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className={cn(
                                "bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 pr-10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-white/20 h-11 transition-all",
                                passwordError && "border-red-500/50 focus-visible:ring-red-500/50 bg-red-500/5"
                              )}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {unconfirmedEmail && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col gap-3 animate-in fade-in">
                      <p className="text-sm text-amber-200">
                        Please verify your email address to sign in.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResend}
                        disabled={isResending}
                        className="bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                      >
                        {isResending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Resend verification email
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loginState === "loading"}
                    className={cn(
                      "w-full h-11 font-medium text-white shadow-lg transition-all active:scale-[0.98]",
                      accentColor,
                      accentHover,
                      accentGlow
                    )}
                  >
                    {loginState === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Illustration Area */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-l border-white/[0.05]">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xl z-10" />
        
        {/* We can place conditional illustrations here based on illustrationTheme */}
        {illustrationTheme === "navy" && (
          <div className="z-20 w-full max-w-lg p-12">
             <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden relative backdrop-blur-md">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute inset-4 rounded-xl border border-white/5 bg-slate-950/50 p-6 flex flex-col gap-4">
                  <div className="h-6 w-1/3 bg-amber-500/20 rounded-md" />
                  <div className="h-32 w-full bg-slate-900/50 rounded-lg border border-white/5" />
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-amber-500/10 rounded-lg border border-amber-500/20" />
                    <div className="h-24 flex-1 bg-slate-900/50 rounded-lg border border-white/5" />
                  </div>
                </div>
             </div>
          </div>
        )}
        {illustrationTheme === "blue" && (
          <div className="z-20 w-full max-w-lg p-12">
             <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-500/20 to-slate-900 border border-blue-500/30 shadow-2xl shadow-blue-500/10 overflow-hidden relative backdrop-blur-md">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute inset-4 rounded-xl border border-white/5 bg-slate-950/50 p-6 flex flex-col gap-4">
                  <div className="h-6 w-1/2 bg-blue-500/20 rounded-md" />
                  <div className="flex gap-4 mt-2">
                    <div className="h-10 flex-1 bg-blue-500/20 rounded-lg border border-blue-500/30" />
                    <div className="h-10 flex-1 bg-slate-800/50 rounded-lg border border-white/5" />
                  </div>
                  <div className="flex-1 w-full bg-slate-900/80 rounded-lg border border-white/5 p-4 flex flex-col gap-2">
                     <div className="h-4 w-full bg-slate-800 rounded" />
                     <div className="h-4 w-3/4 bg-slate-800 rounded" />
                     <div className="h-4 w-5/6 bg-slate-800 rounded" />
                  </div>
                </div>
             </div>
          </div>
        )}
        {illustrationTheme === "purple" && (
          <div className="z-20 w-full max-w-lg p-12">
             <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple-500/20 to-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden relative backdrop-blur-md">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute inset-4 rounded-xl border border-white/5 bg-slate-950/50 p-6 flex gap-4">
                  <div className="w-1/3 flex flex-col gap-4">
                    <div className="h-12 w-full bg-purple-500/20 rounded-lg border border-purple-500/30" />
                    <div className="h-12 w-full bg-slate-900/50 rounded-lg border border-white/5" />
                    <div className="h-12 w-full bg-slate-900/50 rounded-lg border border-white/5" />
                  </div>
                  <div className="flex-1 bg-slate-900/80 rounded-lg border border-white/5 p-4 flex flex-col justify-end gap-3">
                     <div className="h-8 w-1/2 bg-purple-500/10 rounded ml-auto" />
                     <div className="h-8 w-2/3 bg-slate-800 rounded" />
                     <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  </div>
                </div>
             </div>
          </div>
        )}
        {illustrationTheme === "green" && (
          <div className="z-20 w-full max-w-lg p-12">
             <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-500/20 to-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 overflow-hidden relative backdrop-blur-md">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute inset-4 rounded-xl border border-white/5 bg-slate-950/50 p-6 flex flex-col gap-4 items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center relative">
                     <div className="absolute inset-2 border-2 border-dashed border-emerald-500/50 rounded-full animate-[spin_10s_linear_infinite]" />
                  </div>
                  <div className="h-4 w-1/3 bg-emerald-500/20 rounded-md mt-4" />
                  <div className="h-3 w-1/4 bg-slate-800 rounded-md" />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
