"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, ArrowRight, Mail, CheckCircle2 } from "lucide-react"
import { signupSchema, type SignupFormData } from "../schemas"
import { signUpAction, resendConfirmationAction } from "@/actions/auth"
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

export function SignupForm() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [isResending, setIsResending] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(data: SignupFormData) {
    setIsPending(true)
    const result = await signUpAction(data)
    setIsPending(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.needsConfirmation) {
      setNeedsConfirmation(true)
      setSubmittedEmail(result.email || data.email)
      return
    }

    toast.success("Account created successfully!")
    router.push("/login")
  }

  async function handleResend() {
    setIsResending(true)
    const result = await resendConfirmationAction(submittedEmail)
    setIsResending(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Confirmation email resent.")
    }
  }

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We sent a confirmation link to{" "}
              <span className="text-slate-300 font-medium">{submittedEmail}</span>.
              Please verify your email to sign in.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold border-0 rounded-xl"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resending...</>
            ) : (
              "Resend confirmation email"
            )}
          </Button>

          <div className="text-center">
            <span className="text-sm text-slate-600">Already confirmed?{" "}</span>
            <Link href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create account</h2>
        <p className="text-sm text-slate-500">
          Join your team's workspace on AssetFlow
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
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
                <FormLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
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

          {/* Note about role */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              New accounts are created as <span className="text-slate-400 font-medium">Employee</span> by default. Your admin can promote your role afterwards.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 border-0 rounded-xl transition-all"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
            ) : (
              <><span>Create account</span><ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <span className="text-sm text-slate-600">Already have an account?{" "}</span>
        <Link href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  )
}
