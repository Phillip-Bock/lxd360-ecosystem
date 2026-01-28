'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useRef } from 'react';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface FounderSectionProps {
  badge?: string;
  name?: string;
  title?: string;
  image?: { asset?: { url?: string } };
  bio?: string[];
  socialLinks?: Array<{ _key: string; platform: string; url: string }>;
  credentialIcons?: Array<{ _key: string; name: string; icon?: { asset?: { url?: string } } }>;
  credentialBadges?: Array<{ _key: string; value: string; label: string }>;
}

// Default values
const defaults = {
  badge: 'Meet Our Founder',
  name: 'Phillip Bock',
  title: 'Founder & CEO, LXD360',
  image: '/placeholder.jpg',
  bio: [
    'Phillip Bock is the visionary founder of LXD360, built on a distinguished career of over 15 years in instructional design and learning enablement, including key roles at Amazon and Blue Origin. Growing up across from the Saturn V at NASA Johnson Space Center in Houston, Texas, Phillip has always been deeply intrigued by technology. This fascination drives his commitment to integrating cutting-edge tech with human-centered learning strategies to solve complex business challenges.',
    "Phillip's unique expertise is rooted in rigorous academic and professional pursuits. A certified ATD Master Instructional Designer and a Lean Six Sigma Black Belt, he holds a PhD in Educational/Instructional Technology. He has furthered this specialization by completing multiple post-graduate certificates in AI and ML through MIT. Recognized for his contributions, he was inducted into the Continental Who's Who and has been published in the Inner Circle Magazine. A founding member of the AI Learning Consultant Network, Phillip has spent years researching the neurodiversity, socioeconomic, and psychological effects on learning theories as integrated with emerging technology. His upcoming book, INSPIRE 4 Ever, publishing in January 2026, reflects his passion for empowering teams with knowledge necessary for success.",
  ],
  credentialBadges: [
    { _key: 'cred1', value: '15+', label: 'Years Experience' },
    { _key: 'cred2', value: 'PhD', label: 'Ed/Instructional Tech' },
    { _key: 'cred3', value: 'MIT', label: 'AI/ML Certificates' },
    { _key: 'cred4', value: 'ATD', label: 'Master Designer' },
  ],
  credentialIcons: [
    {
      _key: 'icon1',
      name: 'AI Learning Consultant Network',
      icon: {
        asset: {
          url: '/placeholder.jpg',
        },
      },
    },
    {
      _key: 'icon2',
      name: 'U.S. Army Veteran',
      icon: {
        asset: {
          url: '/placeholder.jpg',
        },
      },
    },
    {
      _key: 'icon3',
      name: "Continental Who's Who",
      icon: {
        asset: {
          url: '/placeholder.jpg',
        },
      },
    },
    {
      _key: 'icon4',
      name: 'Inner Circle Magazine',
      icon: {
        asset: {
          url: '/placeholder.jpg',
        },
      },
    },
    {
      _key: 'icon5',
      name: 'Service-Disabled Veteran-Owned Small Business',
      icon: {
        asset: {
          url: '/placeholder.jpg',
        },
      },
    },
  ],
};

// ============================================================================
// FOUNDER SECTION COMPONENT
// ============================================================================

export const FounderSection = ({ badge, name, title }: FounderSectionProps): React.JSX.Element => {
  // Use props or fallback to defaults
  const displayBadge = badge || defaults.badge;
  const displayName = name || defaults.name;
  const displayTitle = title || defaults.title;

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
      style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Ambient glow effects */}
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[150px]" />
      </div>

      {/* Content Container */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-brand-purple bg-brand-secondary/10 rounded-full border border-brand-secondary/20">
            {displayBadge}
          </span>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-primary tracking-tight"
            style={{
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              textShadow: '0 4px 60px rgba(139, 92, 246, 0.3)',
            }}
          >
            {displayName}
          </h2>
          <p className="mt-4 text-lg md:text-xl text-lxd-text-light-muted font-medium">
            {displayTitle}
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          {/* Chasing Border Animation */}
          <ChasingBorder />

          {/* Card Content */}
          <div
            className="
              relative z-10
              backdrop-blur-xl
              rounded-3xl
              p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16
              border border-white/5
            "
            style={{ backgroundColor: 'rgba(0, 29, 61, 0.95)' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column - Image */}
              <div className="lg:col-span-5">
                <div className="relative">
                  {/* Image Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                  >
                    {/* Image Glow Effect */}
                    <div className="absolute -inset-4 bg-linear-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-2xl opacity-50" />

                    {/* Image */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10">
                      <Image
                        src="/placeholder.jpg"
                        alt="Phillip Bock - Founder & CEO of LXD360"
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority
                      />
                      {/* Subtle overlay for depth */}
                      <div
                        className="absolute inset-0 bg-linear-to-t via-transparent to-transparent"
                        style={{
                          backgroundImage:
                            'linear-gradient(to top, rgba(0, 29, 61, 0.6), transparent, transparent)',
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-3 mt-6"
                  >
                    <SocialLink
                      icon={<Linkedin className="w-5 h-5" />}
                      href="https://linkedin.com"
                      label="LinkedIn"
                    />
                    <SocialLink icon={<XIcon />} href="https://x.com" label="X" />
                    <SocialLink
                      icon={<Github className="w-5 h-5" />}
                      href="https://github.com"
                      label="GitHub"
                    />
                    <SocialLink icon={<MediumIcon />} href="https://medium.com" label="Medium" />
                    <SocialLink icon={<RedditIcon />} href="https://reddit.com" label="Reddit" />
                    <SocialLink icon={<AmazonIcon />} href="https://amazon.com" label="Amazon" />
                    <SocialLink icon={<SpotifyIcon />} href="https://spotify.com" label="Spotify" />
                  </motion.div>

                  {/* Founder Credential Icons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap justify-center items-center gap-4 mt-6"
                  >
                    <FounderIcon src="/placeholder.jpg" alt="AI Learning Consultant Network" />
                    <FounderIcon src="/placeholder.jpg" alt="U.S. Army Veteran" />
                    <FounderIcon src="/placeholder.jpg" alt="Continental Who's Who" />
                    <FounderIcon src="/placeholder.jpg" alt="Inner Circle Magazine" />
                    <FounderIcon
                      src="/placeholder.jpg"
                      alt="Service-Disabled Veteran-Owned Small Business"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Right Column - Bio */}
              <div className="lg:col-span-7 space-y-6 md:space-y-8">
                {/* Bio Paragraphs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-base sm:text-lg md:text-xl text-lxd-text-light-body leading-relaxed">
                    Phillip Bock is the visionary founder of LXD360, built on a distinguished career
                    of over 15 years in instructional design and learning enablement, including key
                    roles at Amazon and Blue Origin. Growing up across from the Saturn V at NASA
                    Johnson Space Center in Houston, Texas, Phillip has always been deeply intrigued
                    by technology. This fascination drives his commitment to integrating
                    cutting-edge tech with human-centered learning strategies to solve complex
                    business challenges.
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-lxd-text-light-body leading-relaxed">
                    Phillip&apos;s unique expertise is rooted in rigorous academic and professional
                    pursuits. A certified ATD Master Instructional Designer and a Lean Six Sigma
                    Black Belt, he holds a PhD in Educational/Instructional Technology. He has
                    furthered this specialization by completing multiple post-graduate certificates
                    in AI and ML through MIT. Recognized for his contributions, he was inducted into
                    the Continental Who&apos;s Who and has been published in the Inner Circle
                    Magazine. A founding member of the AI Learning Consultant Network, Phillip has
                    spent years researching the neurodiversity, socioeconomic, and psychological
                    effects on learning theories as integrated with emerging technology. His
                    upcoming book, INSPIRE 4 Ever, publishing in January 2026, reflects his passion
                    for empowering teams with knowledge necessary for success.
                  </p>
                </motion.div>

                {/* Credentials Highlights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-brand-subtle"
                >
                  <CredentialBadge value="15+" label="Years Experience" />
                  <CredentialBadge value="PhD" label="Ed/Instructional Tech" />
                  <CredentialBadge value="MIT" label="AI/ML Certificates" />
                  <CredentialBadge value="ATD" label="Master Designer" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ============================================================================
// SOCIAL LINK COMPONENT
// ============================================================================

interface SocialLinkProps {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const SocialLink = ({ icon, href, label }: SocialLinkProps): React.JSX.Element => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="
      flex items-center justify-center
      w-12 h-12
      bg-lxd-light-card/5 hover:bg-lxd-light-card/10
      border border-brand-subtle hover:border-brand-secondary/50
      rounded-xl
      text-lxd-text-light-muted hover:text-brand-purple
      transition-all duration-300
    "
  >
    {icon}
  </motion.a>
);

// ============================================================================
// CREDENTIAL BADGE COMPONENT
// ============================================================================

interface CredentialBadgeProps {
  value: string;
  label: string;
}

const CredentialBadge = ({ value, label }: CredentialBadgeProps): React.JSX.Element => (
  <div className="text-center">
    <div
      className="text-2xl sm:text-3xl font-bold text-brand-primary"
      style={{
        background: 'linear-gradient(135deg, #fff 0%, var(--brand-secondary) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {value}
    </div>
    <div className="text-xs sm:text-sm text-lxd-text-dark-muted mt-1">{label}</div>
  </div>
);

// ============================================================================
// CHASING BORDER COMPONENT
// ============================================================================

const ChasingBorder = (): React.JSX.Element => {
  return (
    <div className="absolute -inset-[2px] rounded-[26px] overflow-hidden">
      {/* Rotating gradient background */}
      <div
        className="absolute inset-0 animate-spin-slow"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 60deg,
            var(--brand-secondary) 120deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 240deg,
            transparent 300deg,
            transparent 360deg
          )`,
        }}
      />

      {/* Secondary rotating gradient (offset) */}
      <div
        className="absolute inset-0 animate-spin-slow-reverse"
        style={{
          background: `conic-gradient(
            from 180deg,
            transparent 0deg,
            transparent 60deg,
            var(--brand-secondary) 120deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 240deg,
            transparent 300deg,
            transparent 360deg
          )`,
          opacity: 0.7,
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 animate-spin-slow blur-sm"
        style={{
          background: `conic-gradient(
            from 90deg,
            transparent 0deg,
            transparent 45deg,
            var(--brand-secondary) 135deg,
            var(--brand-secondary) 180deg,
            var(--brand-secondary) 225deg,
            transparent 315deg,
            transparent 360deg
          )`,
        }}
      />

      {/* Inner mask to create the border effect */}
      <div
        className="absolute inset-[2px] rounded-3xl"
        style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
      />
    </div>
  );
};

// ============================================================================
// FOUNDER ICON COMPONENT
// ============================================================================

interface FounderIconProps {
  src: string;
  alt: string;
}

const FounderIcon = ({ src, alt }: FounderIconProps): React.JSX.Element => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
  >
    <Image src={src} alt={alt} fill className="object-contain" sizes="80px" />
  </motion.div>
);

// ============================================================================
// CUSTOM SOCIAL ICONS
// ============================================================================

const XIcon = (): React.JSX.Element => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <title>X</title>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MediumIcon = (): React.JSX.Element => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <title>Medium</title>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const RedditIcon = (): React.JSX.Element => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <title>Reddit</title>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const AmazonIcon = (): React.JSX.Element => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <title>Amazon</title>
    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.045-.122zm6.221-6.665c0-1.09.27-2.016.81-2.78.54-.762 1.256-1.268 2.147-1.523.752-.203 1.65-.31 2.697-.31l1.36.032v-1.2c0-.9-.084-1.49-.257-1.77-.168-.28-.533-.42-1.09-.42l-.397.015c-.36.027-.618.123-.765.29-.15.165-.255.457-.313.874l-.018.313-.018.155h-3.53c.06-1.17.465-2.022 1.217-2.557.735-.52 1.89-.79 3.467-.79 1.726 0 2.94.325 3.65.974.708.646 1.065 1.673 1.065 3.076v5.588c0 .352.047.612.134.78.09.17.27.32.546.446l.02.01-.06.133-.238.485-.238.487c-.078.163-.184.29-.314.374-.13.087-.31.13-.54.13-.47 0-.893-.134-1.273-.402a2.304 2.304 0 01-.845-.99 4.094 4.094 0 01-1.553 1.08c-.634.287-1.317.43-2.047.43-1.048 0-1.896-.296-2.536-.89-.64-.59-.96-1.386-.96-2.387zm4.063-.144c.372 0 .72-.09 1.046-.273.32-.18.588-.405.79-.668V9.78l-1.187.044c-.73.038-1.254.208-1.572.51-.32.3-.48.688-.48 1.16 0 .387.108.69.318.91.21.22.507.332.89.332l.195-.018zM22.037 18.22c.2-.18.39-.272.59-.272.14 0 .28.053.39.16.12.108.18.233.18.378 0 .168-.067.33-.2.487-.71.83-1.596 1.267-2.66 1.267-.47 0-.884-.084-1.248-.252-.36-.168-.674-.444-.94-.83-.265-.383-.46-.878-.59-1.48a9.616 9.616 0 01-.195-2.032V9.2h-1.52V7.59l1.682-.073.493-2.89h1.97v2.89h2.61v1.68h-2.61v6.063c0 .756.107 1.29.32 1.603.213.31.57.466 1.066.466.416 0 .83-.17 1.247-.508l.415-.36z" />
  </svg>
);

const SpotifyIcon = (): React.JSX.Element => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <title>Spotify</title>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);
