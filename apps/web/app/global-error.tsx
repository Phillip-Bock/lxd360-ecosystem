'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('GlobalError');

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error (Cloud Logging will capture this in production)
    log.critical('Critical application error', error, {
      digest: error.digest,
    });
  }, [error]);

  // Inline styles since we can't rely on the layout
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#0a0a0a',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    } as React.CSSProperties,
    card: {
      maxWidth: '480px',
      width: '100%',
      backgroundColor: '#171717',
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center' as const,
      border: '1px solid #262626',
    } as React.CSSProperties,
    iconContainer: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
    } as React.CSSProperties,
    title: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#f5f5f5',
      marginBottom: '0.75rem',
      margin: '0 0 0.75rem 0',
    } as React.CSSProperties,
    description: {
      color: '#a3a3a3',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      marginBottom: '1.5rem',
      margin: '0 0 1.5rem 0',
    } as React.CSSProperties,
    digest: {
      fontSize: '0.75rem',
      color: '#737373',
      fontFamily: 'monospace',
      backgroundColor: '#262626',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
    } as React.CSSProperties,
    buttonPrimary: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#ffffff',
      backgroundColor: '#0056B8',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '0.75rem',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    buttonSecondary: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#f5f5f5',
      backgroundColor: 'transparent',
      border: '1px solid #404040',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      textDecoration: 'none',
      display: 'block',
    } as React.CSSProperties,
    footer: {
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #262626',
      fontSize: '0.75rem',
      color: '#737373',
    } as React.CSSProperties,
  };

  return (
    <html lang="en">
      <head>
        <title>Application Error | LXD360</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a' }}>
        <div style={styles.container}>
          <div style={styles.card}>
            {/* Error Icon (inline SVG) */}
            <div style={styles.iconContainer}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            <h1 style={styles.title}>Critical Error</h1>
            <p style={styles.description}>
              We apologize, but something went seriously wrong. Our team has been automatically
              notified and is investigating the issue.
            </p>

            {/* Error Digest for Support */}
            {error.digest && <div style={styles.digest}>Error ID: {error.digest}</div>}

            {/* Actions */}
            <button
              type="button"
              onClick={reset}
              style={styles.buttonPrimary}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0067D8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0056B8';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#0067D8';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = '#0056B8';
              }}
            >
              Try Again
            </button>

            <Link
              href="/"
              style={styles.buttonSecondary}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#262626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#262626';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Return to Home
            </Link>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={{ margin: 0 }}>
                If this continues, please contact{' '}
                <a
                  href="mailto:support@lxd360.com"
                  style={{ color: '#0056B8', textDecoration: 'none' }}
                >
                  support@lxd360.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
