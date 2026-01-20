"use client"

import { motion, AnimatePresence } from "framer-motion"
import { WaitlistForm } from "./waitlist-form"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { TextShimmer } from "@/components/animations/text/shimmer"
import { AnimatedLinesBadge } from "@/components/ui/animated-lines-badge"

export function HeroSection() {
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoEnd = () => {
    setVideoEnded(true)
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Video - Only content initially */}
      <AnimatePresence>
        {!videoEnded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="h-full w-full object-contain"
            >
              <source src="/LXD360.mp4" type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content - Revealed after video ends */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: videoEnded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: videoEnded ? 1 : 0, y: videoEnded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Image
            src="/images/lxd360-20company-20logo.png"
            alt="LXD360 Logo"
            width={180}
            height={80}
            className="mx-auto"
            priority
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: videoEnded ? 1 : 0, y: videoEnded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-6"
        >
          <AnimatedLinesBadge>Coming Soon</AnimatedLinesBadge>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: videoEnded ? 1 : 0, y: videoEnded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-6"
        >
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <TextShimmer className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Learning That Actually Works
            </TextShimmer>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: videoEnded ? 1 : 0, y: videoEnded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-white/70 sm:text-xl"
        >
          LXD360 LLC is pioneering the future of Learning Experience Design with AI-powered platforms, immersive
          experiences, and a thriving professional community.
        </motion.p>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: videoEnded ? 1 : 0, y: videoEnded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex justify-center"
        >
          <WaitlistForm variant="hero" />
        </motion.div>

        {/* Trust indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: videoEnded ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-6 text-sm text-white/50"
        >
          Join 5,000+ L&D professionals already on the waitlist
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: videoEnded ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
