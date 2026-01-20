"use client"

import { useActionState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinWaitlist, type WaitlistFormState } from "@/lib/actions/waitlist"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"

const initialState: WaitlistFormState = {
  success: false,
  message: "",
}

interface WaitlistFormProps {
  variant?: "hero" | "footer"
}

export function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState)

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 rounded-full bg-emerald-500/10 px-6 py-4 text-emerald-400"
      >
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">{state.message}</span>
      </motion.div>
    )
  }

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className={`flex flex-col gap-3 sm:flex-row ${variant === "hero" ? "sm:gap-2" : "sm:gap-3"}`}>
        <div className="relative flex-1">
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            disabled={isPending}
            className={`h-12 rounded-md border-white/20 bg-white/10 px-5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-blue-400 focus:ring-blue-400/20 ${
              state.errors?.email ? "border-red-400" : ""
            }`}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-md bg-blue-600 px-6 font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      <AnimatePresence>
        {state.message && !state.success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-sm text-red-400"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}
