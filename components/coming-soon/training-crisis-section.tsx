"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { AlertTriangle, TrendingDown, DollarSign, Target } from "lucide-react"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const crisisStats = [
  {
    icon: TrendingDown,
    stat: "88%",
    label: "Training Failure Rate",
    description: "of corporate training fails to transfer to job performance",
  },
  {
    icon: DollarSign,
    stat: "$88B",
    label: "Annual Waste",
    description: "wasted on ineffective training in the US alone",
  },
  {
    icon: AlertTriangle,
    stat: "70%",
    label: "Knowledge Lost",
    description: "of new information forgotten within 24 hours",
  },
  {
    icon: Target,
    stat: "83%",
    label: "Skills Gap",
    description: "of organizations report critical skills gaps",
  },
]

export function TrainingCrisisSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section ref={ref} className="bg-black py-24 sm:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mx-auto max-w-6xl px-6"
      >
        {/* Section header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <div className="mb-6">
            <AnimatedLinesBadge>The Problem</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            The Corporate Training Crisis
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-gray-400">
            Organizations track completions—not competence. The result? Billions wasted on training that never transfers to the job.
            <span className="block mt-4 text-white font-medium">LXD360 was built to solve this with science-backed learning that actually works.</span>
          </p>
        </motion.div>

        {/* Crisis stats grid */}
        <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {crisisStats.map((item) => (
            <motion.div key={item.label} variants={itemVariants}>
              <div className="relative h-full rounded-2xl border border-red-900/30 p-2 md:rounded-3xl md:p-3">
                <GlowingEffect spread={40} glow={true} proximity={64} />
                <div className="group relative h-full rounded-xl bg-gray-950 p-6 text-center">
                  <div className="mb-4 inline-flex rounded-xl bg-red-500/20 p-3 text-red-400 transition-all group-hover:bg-red-500 group-hover:text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="mb-2 text-4xl font-bold text-red-400">{item.stat}</div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Market opportunity callout */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="relative rounded-2xl border border-blue-500/30 p-2 md:rounded-3xl md:p-3">
            <GlowingEffect spread={50} glow={true} proximity={70} />
            <div className="rounded-xl bg-linear-to-br from-blue-950/50 to-gray-950 p-8 text-center">
              <p className="text-lg text-gray-300 mb-4">
                The L&D market is projected to grow from <span className="font-bold text-blue-400">$401B to $929B by 2030</span> at an <span className="font-bold text-blue-400">18.27% CAGR</span>.
              </p>
              <p className="text-gray-400">
                The LXP segment alone is growing at <span className="font-semibold text-white">33.8% CAGR</span>—the fastest in the industry.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
