"use client"

import Image from "next/image"
import { Linkedin, Twitter, Mail } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="bg-black border-t border-white/10">
      {/* Footer bottom */}
      <div className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Logo and SDVOSB info */}
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Image
                src="/images/lxd360-20company-20logo.png"
                alt="LXD360 Logo"
                width={100}
                height={45}
                className="opacity-80"
              />
              <div className="h-12 w-px bg-white/20 hidden md:block" />
              <div className="text-center md:text-left">
                <span className="block text-sm font-semibold text-white">Veteran-Owned. Federal-Ready.</span>
                <span className="block text-xs text-gray-400 mt-1">Certified SDVOSB</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="rounded-full border border-white/10 p-2.5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full border border-white/10 p-2.5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@lxd360.com"
                className="rounded-full border border-white/10 p-2.5 text-gray-400 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} LXD360 LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
