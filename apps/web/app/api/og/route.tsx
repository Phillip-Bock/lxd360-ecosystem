import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-og' });

export const runtime = 'edge';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'LXD360 - AI Learning Platform';
    const description = searchParams.get('description') || 'Transform enterprise learning with AI';
    const type = searchParams.get('type') || 'default'; // default, blog, comparison, feature, industry

    // Type-specific colors
    const colors = {
      default: { primary: '#00FFFF', secondary: '#9B59B6' },
      blog: { primary: '#F59E0B', secondary: '#EF4444' },
      comparison: { primary: '#10B981', secondary: '#3B82F6' },
      feature: { primary: '#8B5CF6', secondary: '#EC4899' },
      industry: { primary: '#06B6D4', secondary: '#0EA5E9' },
    };

    const color = colors[type as keyof typeof colors] || colors.default;

    // Type badges
    const badges: Record<string, string> = {
      blog: '📝 Blog',
      comparison: '⚖️ Comparison',
      feature: '✨ Feature',
      industry: '🏢 Industry',
    };

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${color.primary}15 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${color.secondary}10 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            LXD360
          </span>
        </div>

        {/* Type badge */}
        {type !== 'default' && badges[type] && (
          <div
            style={{
              display: 'flex',
              padding: '8px 16px',
              background: `${color.primary}15`,
              border: `1px solid ${color.primary}40`,
              borderRadius: '20px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: color.primary,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {badges[type]}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 50 ? '48px' : '64px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '24px',
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
              maxWidth: '800px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {description.slice(0, 120)}
            {description.length > 120 ? '...' : ''}
          </p>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '80px',
            right: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
            AI-Powered Enterprise Learning
          </span>
          <span style={{ fontSize: '18px', color: color.primary }}>lxd360.com</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    log.error('OG Image generation error', { e });
    // Return a fallback image
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '64px', fontWeight: 700, color: '#ffffff' }}>LXD360</span>
          <span style={{ fontSize: '24px', color: '#00FFFF', marginTop: '16px' }}>
            AI-Powered Learning Platform
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
