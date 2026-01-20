'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * =============================================================================
 * LXP360-SaaS | DatePicker Component
 * =============================================================================
 *
 * @fileoverview A composed date picker component using Calendar and Popover.
 *
 * @version      1.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
}: DatePickerProps): React.JSX.Element {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  const handleSelect = React.useCallback(
    (newDate: Date | undefined): void => {
      setSelectedDate(newDate);
      onDateChange?.(newDate);
    },
    [onDateChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
