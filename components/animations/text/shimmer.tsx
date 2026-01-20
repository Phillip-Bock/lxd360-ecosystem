"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
  duration?: number
}

export function TextShimmer({ children, className, shimmerColor = "#3b82f6", duration = 2.5 }: TextShimmerProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-white via-white to-white",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          #fff 0%,
          #fff 35%,
          #60a5fa 45%,
          ${shimmerColor} 50%,
          #60a5fa 55%,
          #fff 65%,
          #fff 100%
        )`,
        backgroundSize: "200% 100%",
      }}
      animate={{
        backgroundPosition: ["100% 0%", "-100% 0%"],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  )
}
