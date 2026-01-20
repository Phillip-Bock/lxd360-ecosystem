"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import {
  Link2,
  Brain,
  Target,
  User,
  Layers,
  BarChart3,
  RefreshCw,
  GraduationCap
} from "lucide-react"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const inspireFramework = [
  {
    letter: "I",
    title: "Integrative",
    description: "Connect new knowledge to existing mental schemas for deeper understanding",
    icon: Link2,
  },
  {
    letter: "N",
    title: "Neuroscience-Informed",
    description: "Design based on how the brain actually learns and retains information",
    icon: Brain,
  },
  {
    letter: "S",
    title: "Strategic",
    description: "Align learning objectives to measurable business outcomes",
    icon: Target,
  },
  {
    letter: "P",
    title: "Personalized",
    description: "Adapt to individual learner needs, preferences, and pace",
    icon: User,
  },
  {
    letter: "I",
    title: "Immersive",
    description: "Multi-sensory experiences for high-stakes skill development",
    icon: Layers,
  },
  {
    letter: "R",
    title: "Results-Focused",
    description: "Measure skill application on the job—not just completions",
    icon: BarChart3,
  },
  {
    letter: "E",
    title: "Evolutionary",
    description: "Continuous improvement through AI-powered analytics and feedback",
    icon: RefreshCw,
  },
]

export function InspireFrameworkSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
            <AnimatedLinesBadge>Our Methodology</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            The INSPIRE™ Framework
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-gray-400">
            Our proprietary methodology—<span className="text-white font-medium">validated through doctoral research with 289 neurodiverse learners</span>—ensures training transfers to the job. Not marketing. Science.
          </p>
        </motion.div>

        {/* Framework grid */}
        <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {inspireFramework.map((item, index) => (
            <motion.div key={item.title} variants={itemVariants}>
              <div className="relative h-full rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-2">
                <GlowingEffect spread={30} glow={true} proximity={50} />
                <div className="group relative h-full rounded-xl bg-gray-950 p-4 text-center">
                  <div className="mb-3 text-4xl font-black bg-linear-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {item.letter}
                  </div>
                  <div className="mb-3 inline-flex rounded-lg bg-blue-500/20 p-2 text-blue-400 transition-all group-hover:bg-blue-500 group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bayesian Knowledge Tracing callout */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="relative rounded-2xl border border-cyan-500/30 p-2 md:rounded-3xl md:p-3">
            <GlowingEffect spread={50} glow={true} proximity={70} />
            <div className="rounded-xl bg-linear-to-br from-cyan-950/30 to-gray-950 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="inline-flex rounded-2xl bg-cyan-500/20 p-4 text-cyan-400">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Powered by Bayesian Knowledge Tracing</h3>
                  <p className="text-gray-400">
                    When INSPIRE Studio and LXP360 work together, they leverage <span className="text-cyan-400 font-medium">Bayesian Knowledge Tracing</span> to predict learner mastery with scientific precision. Built on the INSPIRE™ Learning Architecture—validated through doctoral research with 289 learners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
