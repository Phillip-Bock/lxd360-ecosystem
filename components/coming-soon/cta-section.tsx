"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { WaitlistForm } from "./waitlist-form"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"

export function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-black py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl px-6 text-center"
      >
        <div className="mb-6">
          <AnimatedLinesBadge>Join the Revolution</AnimatedLinesBadge>
        </div>
        <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Be Part of the Learning Revolution
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-pretty text-lg text-gray-400">
          Join forward-thinking L&D professionals who are ready to transform their organizations. Get exclusive early
          access and updates.
        </p>
        <div className="flex justify-center">
          <WaitlistForm variant="footer" />
        </div>
      </motion.div>
    </section>
  )
}
