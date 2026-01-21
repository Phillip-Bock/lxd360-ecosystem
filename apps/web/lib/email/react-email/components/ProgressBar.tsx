import { Section } from '@react-email/components';
import * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Label to show above the bar */
  label?: string;
  /** Whether to show the percentage */
  showPercentage?: boolean;
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'error';
  /** Height of the progress bar */
  height?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  height = 20,
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  const colorMap = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  const barColor = colorMap[color];

  return (
    <Section
      style={{
        margin: `${theme.spacing[4]} 0`,
      }}
    >
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <Section
          style={{
            marginBottom: theme.spacing[2],
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              <tr>
                {label && (
                  <td
                    style={{
                      color: theme.colors.gray[700],
                      fontFamily: theme.typography.fontFamily,
                      fontSize: theme.typography.sizes.sm,
                      textAlign: 'left',
                    }}
                  >
                    {label}
                  </td>
                )}
                {showPercentage && (
                  <td
                    style={{
                      color: theme.colors.gray[700],
                      fontFamily: theme.typography.fontFamily,
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: theme.typography.weights.semibold,
                      textAlign: label ? 'right' : 'left',
                    }}
                  >
                    {clampedValue}%
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </Section>
      )}

      {/* Progress Bar */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: theme.colors.gray[200],
                borderRadius: theme.borders.radius.full,
                padding: '2px',
              }}
            >
              <table
                style={{
                  width: `${clampedValue}%`,
                  borderCollapse: 'collapse',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        backgroundColor: barColor,
                        borderRadius: theme.borders.radius.full,
                        height: `${height}px`,
                      }}
                    />
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ============================================================================
// STEPS INDICATOR
// ============================================================================

export interface StepsIndicatorProps {
  /** Total number of steps */
  total: number;
  /** Current step (1-indexed) */
  current: number;
  /** Step labels */
  labels?: string[];
}

export function StepsIndicator({ total, current, labels }: StepsIndicatorProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <Section
      style={{
        margin: `${theme.spacing[4]} 0`,
        textAlign: 'center',
      }}
    >
      <table
        style={{
          margin: '0 auto',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr>
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                {/* Step circle */}
                <td
                  style={{
                    backgroundColor:
                      step <= current ? theme.colors.primary : theme.colors.gray[300],
                    borderRadius: theme.borders.radius.full,
                    color: step <= current ? theme.colors.white : theme.colors.gray[600],
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.semibold,
                    height: '32px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    width: '32px',
                  }}
                >
                  {step}
                </td>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <td
                    style={{
                      backgroundColor:
                        step < current ? theme.colors.primary : theme.colors.gray[300],
                      height: '4px',
                      width: '40px',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </tr>

          {/* Labels */}
          {labels && labels.length > 0 && (
            <tr>
              {steps.map((step, index) => (
                <React.Fragment key={`label-${step}`}>
                  <td
                    style={{
                      color: step <= current ? theme.colors.gray[700] : theme.colors.gray[400],
                      fontFamily: theme.typography.fontFamily,
                      fontSize: theme.typography.sizes.xs,
                      paddingTop: theme.spacing[2],
                      textAlign: 'center',
                    }}
                  >
                    {labels[index] || ''}
                  </td>
                  {index < steps.length - 1 && <td />}
                </React.Fragment>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </Section>
  );
}

export default ProgressBar;
