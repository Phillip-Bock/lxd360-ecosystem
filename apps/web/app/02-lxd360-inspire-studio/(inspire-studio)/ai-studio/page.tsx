'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  Image,
  Languages,
  Lightbulb,
  Mic,
  RefreshCw,
  Sparkles,
  Video,
  Wand2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const AI_TOOLS = [
  {
    id: 'content',
    name: 'Content Generator',
    description: 'Generate lesson content, explanations, summaries, and learning objectives',
    icon: FileText,
    color: 'var(--brand-primary-hover)',
    href: '/inspire-studio-app/ai-studio/content-generator',
    features: ['Lesson outlines', 'Explanatory text', 'Examples', 'Summaries'],
    tokensPerUse: '~500-2000',
  },
  {
    id: 'image',
    name: 'Image Generator',
    description: 'Create custom illustrations, diagrams, icons, and graphics for your courses',
    icon: Image,
    color: 'var(--brand-secondary)',
    href: '/inspire-studio-app/ai-studio/image-generator',
    features: ['Illustrations', 'Diagrams', 'Icons', 'Backgrounds'],
    tokensPerUse: '~1000-3000',
  },
  {
    id: 'voice',
    name: 'Voice Generator',
    description: 'Convert text to natural-sounding speech narration for videos and audio lessons',
    icon: Mic,
    color: '#22c55e',
    href: '/inspire-studio-app/ai-studio/voice-generator',
    features: ['50+ voices', 'Multiple languages', 'Custom pacing', 'Emotion control'],
    tokensPerUse: '~100-500',
  },
  {
    id: 'video',
    name: 'Video Generator',
    description: 'Create AI presenter videos with realistic avatars and lip-sync technology',
    icon: Video,
    color: '#f59e0b',
    href: '/inspire-studio-app/ai-studio/video-generator',
    features: ['AI avatars', 'Custom backgrounds', 'Script-to-video', 'Lip sync'],
    badge: 'Beta',
    tokensPerUse: '~5000-15000',
  },
  {
    id: 'quiz',
    name: 'Quiz Generator',
    description: 'Automatically generate assessments, quizzes, and knowledge checks from content',
    icon: HelpCircle,
    color: '#ec4899',
    href: '/inspire-studio-app/ai-studio/quiz-generator',
    features: ['Multiple choice', 'True/false', 'Fill-in-blank', 'Matching'],
    tokensPerUse: '~300-800',
  },
  {
    id: 'translate',
    name: 'Translation',
    description: 'Translate your courses to 50+ languages with context-aware AI translation',
    icon: Globe,
    color: '#06b6d4',
    href: '/inspire-studio-app/ai-studio/translate',
    features: ['50+ languages', 'Context-aware', 'Preserve formatting', 'Review mode'],
    tokensPerUse: '~200-1000',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Checker',
    description: 'Scan content for accessibility issues and get AI-powered fix suggestions',
    icon: Eye,
    color: '#10b981',
    href: '/inspire-studio-app/ai-studio/accessibility',
    features: ['WCAG 2.2 AA', 'Alt text suggestions', 'Color contrast', 'Reading level'],
    tokensPerUse: '~100-300',
  },
];

const QUICK_ACTIONS = [
  {
    icon: Wand2,
    label: 'Generate lesson from topic',
    description: 'Enter a topic and get a complete lesson outline',
    color: 'var(--brand-primary-hover)',
  },
  {
    icon: RefreshCw,
    label: 'Improve existing content',
    description: 'Paste content and get suggestions for improvement',
    color: '#a855f7',
  },
  {
    icon: Languages,
    label: 'Quick translate',
    description: 'Translate selected text to another language',
    color: '#06b6d4',
  },
  {
    icon: Lightbulb,
    label: 'Generate ideas',
    description: 'Get creative ideas for activities and interactions',
    color: '#f59e0b',
  },
];

export default function AIStudioPage(): React.JSX.Element {
  // Token usage data (would come from API/context in production)
  const tokenUsage = {
    used: 105000,
    limit: 250000,
    percentage: 42,
    resetDays: 12,
    breakdown: {
      content: 45000,
      image: 30000,
      voice: 15000,
      video: 10000,
      quiz: 5000,
    },
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-(--primary)/10 to-(--lxd-purple)/10 border border-(--primary)/20 mb-4">
            <Sparkles className="w-4 h-4 text-(--primary)" />
            <span className="text-(--primary) text-sm font-medium">AI-Powered Creation</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">AI Studio</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Accelerate course creation with AI-powered tools. Generate content, images, audio,
            video, and more in seconds.
          </p>
        </motion.div>

        {/* Token Usage Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-(--lxd-purple) flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Token Balance</h3>
                <p className="text-sm text-muted-foreground">Team plan: 250,000 tokens/month</p>
              </div>
            </div>
            <Link
              href="/inspire-studio-app/settings"
              className="text-(--primary) text-sm hover:underline flex items-center gap-1"
            >
              Manage usage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-linear-to-r from-(--primary) to-(--lxd-purple) rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tokenUsage.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              {tokenUsage.used.toLocaleString()} tokens used
            </span>
            <span className="text-(--primary) font-medium">
              {(tokenUsage.limit - tokenUsage.used).toLocaleString()} remaining
            </span>
            <span className="text-muted-foreground">Resets in {tokenUsage.resetDays} days</span>
          </div>

          {/* Token Breakdown */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Usage breakdown this month:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(tokenUsage.breakdown).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-sm font-medium text-foreground">
                    {(value / 1000).toFixed(0)}k
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                type="button"
                key={index}
                className="p-4 bg-card border border-border rounded-xl hover:border-(--primary)/50 transition-all text-left group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-(--primary)">
                  {action.label}
                </h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">AI Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_TOOLS.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  href={tool.href}
                  className="block h-full p-6 bg-card border border-border rounded-2xl hover:border-(--primary)/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
                    </div>
                    {tool.badge && (
                      <span className="px-2 py-1 bg-brand-warning/10 text-amber-500 text-xs font-medium rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-(--primary) transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {tool.tokensPerUse} tokens
                    </span>
                    <span className="flex items-center gap-1 text-(--primary) text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 bg-linear-to-r from-(--primary)/5 to-(--lxd-purple)/5 border border-(--primary)/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-(--primary)" />
            <h3 className="font-semibold text-foreground">AI Best Practices</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success" />
                <span className="font-medium text-foreground text-sm">Be specific</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The more context and detail you provide in your prompts, the better and more
                relevant the AI output will be.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success" />
                <span className="font-medium text-foreground text-sm">Review & refine</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI generates drafts, not finished products. Always review output and customize it
                for your specific needs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success" />
                <span className="font-medium text-foreground text-sm">Iterate & combine</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Generate multiple variations and combine the best elements. Iteration leads to
                better results.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-card border border-border rounded-2xl"
        >
          <h3 className="font-semibold text-foreground mb-4">Coming Soon</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'AI Storyboard', icon: Wand2, description: 'Generate visual storyboards' },
              { name: 'Voice Cloning', icon: Mic, description: 'Clone your voice for narration' },
              {
                name: 'Auto-Subtitles',
                icon: FileText,
                description: 'Generate subtitles for videos',
              },
              {
                name: 'Learning Paths',
                icon: Brain,
                description: 'AI-generated learning journeys',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="p-4 bg-muted/30 border border-border rounded-xl opacity-60"
              >
                <item.icon className="w-6 h-6 text-muted-foreground mb-2" />
                <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
