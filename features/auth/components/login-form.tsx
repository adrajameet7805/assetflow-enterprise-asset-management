"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { loginSchema, type LoginFormData } from "../schemas"
import { loginAction, resendConfirmationAction } from "@/actions/auth"
import { cn } from "@/lib/utils"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormData) {
    setIsPending(true)
    const result = await loginAction(data)
    setIsPending(false)

    if (result.error) {
      if (result.error.toLowerCase().includes("email not confirmed")) {
        setUnconfirmedEmail(data.email)
      } else {
        toast.error(result.error)
      }
      return
    }

    toast.success("Welcome back!")
    router.push("/")
  }

  async function handleResend() {
    if (!unconfirmedEmail) return
    setIsResending(true)
    const result = await resendConfirmationAction(unconfirmedEmail)
    setIsResending(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Confirmation email resent. Check your inbox.")
      setUnconfirmedEmail(null)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
        <p className="text-sm text-slate-500">
          Enter your credentials to access your workspace
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@company.com"
                    type="email"
                    className={cn(
                      "h-11 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
                      "focus:border-blue-500/50 focus:ring-blue-500/20 focus:bg-white/[0.06]",
                      "transition-all duration-200 rounded-xl"
                    )}
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
                  <FormLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Password
                  </FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={cn(
                        "h-11 pr-10 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
                        "focus:border-blue-500/50 focus:ring-blue-500/20 focus:bg-white/[0.06]",
                        "transition-all duration-200 rounded-xl"
                      )}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          {/* Unconfirmed email notice */}
          {unconfirmedEmail && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-amber-300 mb-3">
                Please verify your email address before signing in.
              </p>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-transparent"
              >
                {isResending ? (
                  <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Sending...</>
                ) : (
                  "Resend confirmation email"
                )}
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 border-0 rounded-xl transition-all duration-200 hover:shadow-blue-500/30"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              <><span>Sign in</span><ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <span className="text-sm text-slate-600">Don&apos;t have an account?{" "}</span>
        <Link href="/signup" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
          Create account
        </Link>
      </div>
    </div>
  )
}
