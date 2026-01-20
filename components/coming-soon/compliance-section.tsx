"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import {
  Shield,
  FileCheck,
  Eye,
  Scale,
  Server,
  KeyRound,
  CheckCircle2,
} from "lucide-react"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const complianceItems = [
  {
    icon: Shield,
    title: "SOC 2 Type II Ready",
    description: "Built with SOC 2 Type II compliance architecture from day one",
  },
  {
    icon: Server,
    title: "FedRAMP Ready",
    description: "Enterprise-grade security with FedRAMP-ready architecture",
  },
  {
    icon: Eye,
    title: "WCAG 2.2 AA",
    description: "Full accessibility compliance for inclusive learning",
  },
  {
    icon: FileCheck,
    title: "Section 508",
    description: "Federal accessibility standards compliance",
  },
  {
    icon: Scale,
    title: "GDPR/CCPA",
    description: "Privacy-first design meeting global data regulations",
  },
  {
    icon: KeyRound,
    title: "HIPAA Support",
    description: "Healthcare-ready with HIPAA compliance capabilities",
  },
]

const standards = [
  "xAPI (Experience API)",
  "SCORM 1.2 & 2004",
  "cmi5",
  "LTI 1.3",
  "SSO/SAML 2.0",
  "OAuth 2.0",
]

const techStack = [
  "Google Cloud Platform",
  "Firebase Auth",
  "Cloud SQL",
  "Firestore",
  "BigQuery Analytics",
  "Vertex AI",
]

export function ComplianceSection() {
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
            <AnimatedLinesBadge>Enterprise Ready</AnimatedLinesBadge>
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Built for SOC 2 Compliance
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-gray-400">
            Enterprise-grade security with FedRAMP-ready architecture, comprehensive compliance support, and modern tech stack that eliminates technical debt.
          </p>
        </motion.div>

        {/* Compliance grid */}
        <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {complianceItems.map((item) => (
            <motion.div key={item.title} variants={itemVariants}>
              <div className="relative h-full rounded-2xl border border-blue-900/30 p-2 md:rounded-3xl md:p-2">
                <GlowingEffect spread={30} glow={true} proximity={50} />
                <div className="group relative h-full rounded-xl bg-gray-950 p-5 flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex rounded-xl bg-blue-500/20 p-2.5 text-blue-400 transition-all group-hover:bg-blue-500 group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Standards and Tech Stack */}
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
          {/* Learning Standards */}
          <div className="relative rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
            <GlowingEffect spread={40} glow={true} proximity={60} />
            <div className="rounded-xl bg-gray-950 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Learning Standards</h3>
              <div className="flex flex-wrap gap-2">
                {standards.map((standard) => (
                  <span
                    key={standard}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {standard}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Tech Stack */}
          <div className="relative rounded-2xl border border-gray-800 p-2 md:rounded-3xl md:p-3">
            <GlowingEffect spread={40} glow={true} proximity={60} />
            <div className="rounded-xl bg-gray-950 p-6">
              <h3 className="text-lg font-bold text-white mb-4">100% Google Cloud</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {tech}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Near-zero tech debt—unlike competitors stuck on outdated stacks
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
