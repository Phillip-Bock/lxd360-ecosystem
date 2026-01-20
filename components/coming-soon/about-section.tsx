"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Award, Lightbulb } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
            <AnimatedLinesBadge>About LXD360</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Transforming How Organizations Learn
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-gray-400">
            LXD360 LLC is a Service-Disabled Veteran-Owned Small Business (SDVOSB) dedicated to revolutionizing
            corporate learning through innovative technology, neuroscience-based methodologies, and immersive
            experiences.
          </p>
        </motion.div>

        {/* Values/Pillars - Use GlowingEffect wrapper instead of BackgroundGradient */}
        <motion.div variants={containerVariants} className="grid gap-8 md:grid-cols-3">
          <motion.div variants={itemVariants}>
            <div className="relative h-full rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={40} glow={true} proximity={64} />
              <div className="group relative h-full rounded-xl bg-gray-950 p-8">
                <div className="mb-5 inline-flex rounded-xl bg-purple-500/20 p-3 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">Veteran-Owned Excellence</h3>
                <p className="text-gray-400">
                  As a certified SDVOSB, we bring military precision, discipline, and commitment to every learning
                  solution we deliver.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative h-full rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={40} glow={true} proximity={64} />
              <div className="group relative h-full rounded-xl bg-gray-950 p-8">
                <div className="mb-5 inline-flex rounded-xl bg-purple-500/20 p-3 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">Innovation First</h3>
                <p className="text-gray-400">
                  We combine cutting-edge AI/ML technology with proven learning science to create experiences that drive
                  real business outcomes.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative h-full rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={40} glow={true} proximity={64} />
              <div className="group relative h-full rounded-xl bg-gray-950 p-8">
                <div className="mb-5 inline-flex rounded-xl bg-purple-500/20 p-3 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">Measurable Impact</h3>
                <p className="text-gray-400">
                  Our integrated analytics and xAPI compliance ensure you can track, measure, and demonstrate the ROI of
                  your learning investments.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
