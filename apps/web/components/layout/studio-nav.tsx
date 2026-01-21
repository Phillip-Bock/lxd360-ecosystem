'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function StudioNav() {
  return (
    <header className="bg-(--inspire-header-bg) border-(--inspire-sidebar-border) text-white h-16 flex items-center justify-between px-4">
      {/* Left side: Logo (far left) + Trigger */}
      <div className="flex items-center gap-x-4">
        <Image
          src="/INSPIRE-Studios Transparent Logo Primary.png"
          alt="INSPIRE Studios"
          width={160}
          height={40}
          className="h-10 w-auto"
          priority
        />
        <SidebarTrigger className="text-white hover:bg-white/10" />
      </div>

      {/* Center: Date and Token Counter with clear separation */}
      <div className="flex items-center gap-8">
        <div className="text-sm text-white/90">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          •{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
        <div className="h-6 w-px bg-white/30" />
        <div className="text-sm text-white/70">10,000 of 10,000 tokens remaining</div>
      </div>

      {/* Right side: Neuro Avatar with white circle background */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-white">Neuro</span>
        <div className="rounded-full bg-white p-0.5">
          <Avatar className="size-8 rounded-full">
            <AvatarImage alt="Neuro" src="/Neuronaut e-mentor head.png" />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
