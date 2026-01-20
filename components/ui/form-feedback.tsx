'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// FormStatus Component
// =============================================================================

export type FormStatusType = 'idle' | 'loading' | 'success' | 'error';

export interface FormStatusProps {
  status: FormStatusType;
  message?: string;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    className: '',
  },
  loading: {
    icon: <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />,
    className: 'text-muted-foreground',
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
    className: 'text-green-600 dark:text-brand-success',
  },
  error: {
    icon: <XCircle className="w-4 h-4" aria-hidden="true" />,
    className: 'text-destructive',
  },
};

export function FormStatus({ status, message, className }: FormStatusProps) {
  if (status === 'idle' || !message) return null;

  const config = statusConfig[status];

  return (
    <motion.output
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      aria-live="polite"
      className={cn('flex items-center gap-2 text-sm', config.className, className)}
    >
      {config.icon}
      <span>{message}</span>
    </motion.output>
  );
}

// =============================================================================
// FieldFeedback Component
// =============================================================================

export type FieldFeedbackType = 'error' | 'warning' | 'success' | 'info';

export interface FieldFeedbackProps {
  type: FieldFeedbackType;
  message: string;
  id?: string;
  className?: string;
}

const feedbackConfig = {
  error: {
    icon: <XCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    className: 'text-destructive',
  },
  warning: {
    icon: <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    className: 'text-yellow-600 dark:text-yellow-500',
  },
  success: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />,
    className: 'text-green-600 dark:text-brand-success',
  },
  info: {
    icon: <Info className="w-3.5 h-3.5" aria-hidden="true" />,
    className: 'text-brand-blue dark:text-brand-blue',
  },
};

export function FieldFeedback({ type, message, id, className }: FieldFeedbackProps) {
  const config = feedbackConfig[type];

  return (
    <motion.output
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      id={id}
      role={type === 'error' ? 'alert' : undefined}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn('flex items-center gap-1.5 text-xs mt-1.5', config.className, className)}
    >
      {config.icon}
      <span>{message}</span>
    </motion.output>
  );
}

// =============================================================================
// FieldFeedbackList - For multiple validation messages
// =============================================================================

export interface FieldFeedbackListProps {
  errors?: string[];
  warnings?: string[];
  id?: string;
  className?: string;
}

export function FieldFeedbackList({ errors, warnings, id, className }: FieldFeedbackListProps) {
  const hasContent = (errors && errors.length > 0) || (warnings && warnings.length > 0);
  if (!hasContent) return null;

  return (
    <div id={id} className={cn('space-y-1 mt-1.5', className)}>
      <AnimatePresence mode="sync">
        {errors?.map((error, index) => (
          <FieldFeedback key={`error-${index}`} type="error" message={error} />
        ))}
        {warnings?.map((warning, index) => (
          <FieldFeedback key={`warning-${index}`} type="warning" message={warning} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// CharacterCounter Component
// =============================================================================

export interface CharacterCounterProps {
  current: number;
  max: number;
  min?: number;
  showWarningAt?: number; // Percentage (0-100) at which to show warning
  className?: string;
}

export function CharacterCounter({
  current,
  max,
  min = 0,
  showWarningAt = 90,
  className,
}: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isOverLimit = current > max;
  const isUnderMin = current < min;
  const isWarning = percentage >= showWarningAt && !isOverLimit;

  let status: 'normal' | 'warning' | 'error' = 'normal';
  if (isOverLimit || isUnderMin) {
    status = 'error';
  } else if (isWarning) {
    status = 'warning';
  }

  const statusStyles = {
    normal: 'text-muted-foreground',
    warning: 'text-yellow-600 dark:text-yellow-500',
    error: 'text-destructive',
  };

  return (
    <output
      aria-live="polite"
      aria-atomic="true"
      className={cn('text-xs tabular-nums transition-colors', statusStyles[status], className)}
    >
      <span className={isOverLimit ? 'font-medium' : ''}>{current.toLocaleString()}</span>
      <span className="mx-0.5">/</span>
      <span>{max.toLocaleString()}</span>
      {isOverLimit && (
        <span className="ml-1" aria-hidden="true">
          ({(current - max).toLocaleString()} over)
        </span>
      )}
      <span className="sr-only">
        {isOverLimit
          ? `${current - max} characters over the limit of ${max}`
          : `${current} of ${max} characters used`}
      </span>
    </output>
  );
}

// =============================================================================
// PasswordStrength Component
// =============================================================================

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthProps {
  password: string;
  showLabel?: boolean;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function calculatePasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) return 0;
  const passedRequirements = passwordRequirements.filter((req) => req.test(password)).length;
  return Math.min(4, passedRequirements) as PasswordStrengthLevel;
}

const strengthConfig: Record<
  PasswordStrengthLevel,
  { label: string; color: string; bgColor: string }
> = {
  0: {
    label: 'No password',
    color: 'bg-muted',
    bgColor: 'bg-muted',
  },
  1: {
    label: 'Weak',
    color: 'bg-brand-error',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  2: {
    label: 'Fair',
    color: 'bg-brand-warning',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  3: {
    label: 'Good',
    color: 'bg-brand-warning',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
  },
  4: {
    label: 'Strong',
    color: 'bg-brand-success',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
};

export function PasswordStrength({
  password,
  showLabel = true,
  showRequirements = false,
  className,
}: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password);
  const config = strengthConfig[strength];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="space-y-1.5">
        {/* biome-ignore lint/a11y/useSemanticElements: Custom visual meter with 4 segments cannot use native <meter> */}
        <div
          className="flex gap-1"
          role="meter"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`Password strength: ${config.label}`}
        >
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                level <= strength ? config.color : 'bg-muted',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        {showLabel && password && (
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xs font-medium',
                strength <= 1
                  ? 'text-red-600 dark:text-brand-error'
                  : strength === 2
                    ? 'text-orange-600 dark:text-orange-500'
                    : strength === 3
                      ? 'text-yellow-600 dark:text-yellow-500'
                      : 'text-green-600 dark:text-brand-success',
              )}
            >
              {config.label}
            </span>
          </div>
        )}
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <ul className="space-y-1" aria-label="Password requirements">
          {passwordRequirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <li
                key={index}
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors',
                  passed ? 'text-green-600 dark:text-brand-success' : 'text-muted-foreground',
                )}
              >
                <div className="shrink-0">
                  {passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-current"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// PasswordInput - Input with toggle visibility and strength indicator
// =============================================================================

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  showRequirements?: boolean;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, showRequirements = false, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {error && <FieldFeedback type="error" message={error} id={`${props.id}-error`} />}

        {showStrength && (
          <PasswordStrength password={password} showRequirements={showRequirements} />
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

// =============================================================================
// FormFieldWrapper - Wrapper for form fields with label and feedback
// =============================================================================

export interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
}: FormFieldWrapperProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {children}

      <AnimatePresence>
        {error && <FieldFeedback type="error" message={error} id={errorId} />}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

const FormFeedback = {
  FormStatus,
  FieldFeedback,
  FieldFeedbackList,
  CharacterCounter,
  PasswordStrength,
  PasswordInput,
  FormFieldWrapper,
};

export default FormFeedback;
