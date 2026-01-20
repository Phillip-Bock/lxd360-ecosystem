/**
 * =============================================================================
 * LXP360-SaaS | Accessible Form Components
 * =============================================================================
 *
 * @fileoverview Enhanced form components for WCAG 2.1 AA compliance
 *
 * @description
 * Provides accessible form components with:
 * - Proper ARIA attributes and label associations
 * - Required field indicators with screen reader support
 * - Character count with live updates
 * - Error announcements to screen readers
 * - Focus management on validation
 * - High contrast focus indicators
 *
 * WCAG Compliance:
 * - 1.3.1 Info and Relationships (Level A)
 * - 1.3.5 Identify Input Purpose (Level AA)
 * - 3.3.1 Error Identification (Level A)
 * - 3.3.2 Labels or Instructions (Level A)
 * - 3.3.3 Error Suggestion (Level AA)
 * - 4.1.2 Name, Role, Value (Level A)
 *
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { announce } from '@/lib/accessibility/focus-management';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Maximum character count to display */
  maxLength?: number;
  /** Show character count even when not near limit */
  showCharacterCount?: boolean;
  /** Icon to display at start of input */
  startIcon?: React.ReactNode;
  /** Icon to display at end of input */
  endIcon?: React.ReactNode;
  /** Hide the label visually (still accessible to screen readers) */
  hideLabel?: boolean;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
}

export interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text for the textarea */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Maximum character count */
  maxLength?: number;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Hide the label visually */
  hideLabel?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
}

export interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text for the select */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Hide the label visually */
  hideLabel?: boolean;
  /** Placeholder option text */
  placeholder?: string;
  /** Options to display */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
}

export interface AccessibleCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text for the checkbox */
  label: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
}

export interface AccessibleRadioGroupProps {
  /** Legend text for the radio group */
  legend: string;
  /** Name attribute for all radios */
  name: string;
  /** Current value */
  value?: string;
  /** Options to display */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Whether selection is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Change handler */
  onChange?: (value: string) => void;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
}

// ============================================================================
// Utility Components
// ============================================================================

function RequiredIndicator() {
  return (
    <span className="text-destructive ml-1" aria-hidden="true">
      *
    </span>
  );
}

function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

function CharacterCount({ current, max, id }: { current: number; max: number; id: string }) {
  const remaining = max - current;
  const isNearLimit = remaining <= Math.ceil(max * 0.1); // 10% remaining
  const isOverLimit = remaining < 0;

  return (
    <span
      id={id}
      className={cn(
        'text-xs tabular-nums',
        isOverLimit
          ? 'text-destructive font-medium'
          : isNearLimit
            ? 'text-warning'
            : 'text-muted-foreground',
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {current}/{max}
      <ScreenReaderOnly>
        {isOverLimit
          ? ` (${Math.abs(remaining)} characters over limit)`
          : ` (${remaining} characters remaining)`}
      </ScreenReaderOnly>
    </span>
  );
}

function ErrorMessage({
  id,
  message,
  announce: shouldAnnounce = true,
}: {
  id: string;
  message: string;
  announce?: boolean;
}) {
  // Announce error to screen readers when it appears
  React.useEffect(() => {
    if (shouldAnnounce && message) {
      announce(`Error: ${message}`, { politeness: 'assertive' });
    }
  }, [message, shouldAnnounce]);

  return (
    <p
      id={id}
      className="text-destructive text-sm flex items-center gap-1"
      role="alert"
      aria-live="assertive"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 shrink-0"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}

function HelperText({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="text-muted-foreground text-sm">
      {text}
    </p>
  );
}

// ============================================================================
// Accessible Input
// ============================================================================

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      maxLength,
      showCharacterCount = false,
      startIcon,
      endIcon,
      hideLabel = false,
      announceErrors = true,
      className,
      id: providedId,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const countId = `${id}-count`;

    const [charCount, setCharCount] = React.useState(
      () => String(value || defaultValue || '').length,
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
      maxLength && showCharacterCount ? countId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none',
            hideLabel && 'sr-only',
            error && 'text-destructive',
          )}
        >
          {label}
          {required && <RequiredIndicator />}
          {required && <ScreenReaderOnly>(required)</ScreenReaderOnly>}
        </label>

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type="text"
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            maxLength={maxLength}
            onChange={handleChange}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              'flex h-10 w-full rounded-md border bg-background px-3 py-2',
              'text-sm ring-offset-background',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className,
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && <ErrorMessage id={errorId} message={error} announce={announceErrors} />}
            {!error && helperText && <HelperText id={helperId} text={helperText} />}
          </div>
          {maxLength && showCharacterCount && (
            <CharacterCount id={countId} current={charCount} max={maxLength} />
          )}
        </div>
      </div>
    );
  },
);
AccessibleInput.displayName = 'AccessibleInput';

// ============================================================================
// Accessible Textarea
// ============================================================================

export const AccessibleTextarea = React.forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      maxLength,
      showCharacterCount = true,
      hideLabel = false,
      autoResize = false,
      announceErrors = true,
      className,
      id: providedId,
      onChange,
      value,
      defaultValue,
      rows = 3,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const countId = `${id}-count`;
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const [charCount, setCharCount] = React.useState(
      () => String(value || defaultValue || '').length,
    );

    // Handle auto-resize
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const setRefs = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        textareaRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref],
    );

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
      maxLength && showCharacterCount ? countId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none',
            hideLabel && 'sr-only',
            error && 'text-destructive',
          )}
        >
          {label}
          {required && <RequiredIndicator />}
          {required && <ScreenReaderOnly>(required)</ScreenReaderOnly>}
        </label>

        <textarea
          ref={setRefs}
          id={id}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          maxLength={maxLength}
          rows={rows}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2',
            'text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
            error && 'border-destructive focus-visible:ring-destructive',
            autoResize && 'resize-none overflow-hidden',
            className,
          )}
          {...props}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && <ErrorMessage id={errorId} message={error} announce={announceErrors} />}
            {!error && helperText && <HelperText id={helperId} text={helperText} />}
          </div>
          {maxLength && showCharacterCount && (
            <CharacterCount id={countId} current={charCount} max={maxLength} />
          )}
        </div>
      </div>
    );
  },
);
AccessibleTextarea.displayName = 'AccessibleTextarea';

// ============================================================================
// Accessible Select
// ============================================================================

export const AccessibleSelect = React.forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      hideLabel = false,
      placeholder,
      options,
      announceErrors = true,
      className,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [helperText ? helperId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none',
            hideLabel && 'sr-only',
            error && 'text-destructive',
          )}
        >
          {label}
          {required && <RequiredIndicator />}
          {required && <ScreenReaderOnly>(required)</ScreenReaderOnly>}
        </label>

        <select
          ref={ref}
          id={id}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={cn(
            'flex h-10 w-full rounded-md border bg-background px-3 py-2',
            'text-sm ring-offset-background',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <ErrorMessage id={errorId} message={error} announce={announceErrors} />}
        {!error && helperText && <HelperText id={helperId} text={helperText} />}
      </div>
    );
  },
);
AccessibleSelect.displayName = 'AccessibleSelect';

// ============================================================================
// Accessible Checkbox
// ============================================================================

export const AccessibleCheckbox = React.forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  (
    { label, error, helperText, announceErrors = true, className, id: providedId, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [helperText ? helperId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              'h-4 w-4 rounded border text-primary',
              'focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive',
              className,
            )}
            {...props}
          />
          <label htmlFor={id} className={cn('text-sm leading-none', error && 'text-destructive')}>
            {label}
          </label>
        </div>

        {error && <ErrorMessage id={errorId} message={error} announce={announceErrors} />}
        {!error && helperText && <HelperText id={helperId} text={helperText} />}
      </div>
    );
  },
);
AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// ============================================================================
// Accessible Radio Group
// ============================================================================

export function AccessibleRadioGroup({
  legend,
  name,
  value,
  options,
  required = false,
  error,
  helperText,
  orientation = 'vertical',
  onChange,
  announceErrors = true,
}: AccessibleRadioGroupProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const describedBy = [helperText ? helperId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className="space-y-2"
      aria-invalid={!!error}
      aria-describedby={describedBy || undefined}
    >
      <legend className={cn('text-sm font-medium', error && 'text-destructive')}>
        {legend}
        {required && <RequiredIndicator />}
        {required && <ScreenReaderOnly>(required)</ScreenReaderOnly>}
      </legend>

      <div
        className={cn('flex gap-4', orientation === 'vertical' && 'flex-col gap-2')}
        role="radiogroup"
        aria-required={required}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              id={`${id}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                'h-4 w-4 border text-primary',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
            <label
              htmlFor={`${id}-${option.value}`}
              className={cn('text-sm leading-none', option.disabled && 'opacity-50')}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && <ErrorMessage id={errorId} message={error} announce={announceErrors} />}
      {!error && helperText && <HelperText id={helperId} text={helperText} />}
    </fieldset>
  );
}

// ============================================================================
// Form Status Component
// ============================================================================

interface FormStatusProps {
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Success message to show */
  successMessage?: string;
  /** Error message to show */
  errorMessage?: string;
  /** Number of validation errors */
  errorCount?: number;
}

export function FormStatus({
  isSubmitting,
  successMessage,
  errorMessage,
  errorCount,
}: FormStatusProps) {
  // Announce status changes
  React.useEffect(() => {
    if (successMessage) {
      announce(successMessage, { politeness: 'polite' });
    } else if (errorMessage) {
      announce(errorMessage, { politeness: 'assertive' });
    } else if (errorCount && errorCount > 0) {
      announce(
        `Form has ${errorCount} error${errorCount === 1 ? '' : 's'}. Please correct them before submitting.`,
        { politeness: 'assertive' },
      );
    }
  }, [successMessage, errorMessage, errorCount]);

  if (isSubmitting) {
    return (
      <output aria-live="polite" className="flex items-center gap-2 text-muted-foreground">
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Submitting...</span>
      </output>
    );
  }

  if (successMessage) {
    return (
      <output aria-live="polite" className="flex items-center gap-2 text-green-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <span>{successMessage}</span>
      </output>
    );
  }

  if (errorMessage) {
    return (
      <div role="alert" aria-live="assertive" className="flex items-center gap-2 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>{errorMessage}</span>
      </div>
    );
  }

  return null;
}

// ============================================================================
// Exports
// ============================================================================

const AccessibleForm = {
  Input: AccessibleInput,
  Textarea: AccessibleTextarea,
  Select: AccessibleSelect,
  Checkbox: AccessibleCheckbox,
  RadioGroup: AccessibleRadioGroup,
  Status: FormStatus,
};

export default AccessibleForm;
