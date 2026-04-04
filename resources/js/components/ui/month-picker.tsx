"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useTranslation } from 'react-i18next'
import { format, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthPickerProps {
  value?: string // YYYY-MM
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MonthPicker({
  value,
  onChange,
  placeholder,
  className,
}: MonthPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false)

  const selectedDate = value ? parse(value, 'yyyy-MM', new Date()) : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM');
      onChange(formatted);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-10',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(selectedDate!, 'MMMM yyyy') : (placeholder || t('Select Month'))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="month-picker-wrapper">
          <ReactDatePicker
            selected={selectedDate}
            onChange={handleChange}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            inline
          />
        </div>
        <style>{`
          .month-picker-wrapper .react-datepicker {
            border: none;
            font-family: inherit;
            background: hsl(var(--background));
          }
          .month-picker-wrapper .react-datepicker__header {
            background: hsl(var(--background));
            border-bottom: 1px solid hsl(var(--border));
          }
          .month-picker-wrapper .react-datepicker__current-month {
            color: hsl(var(--foreground));
            padding: 10px 0;
          }
          .month-picker-wrapper .react-datepicker__month-wrapper {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 12px;
          }
          .month-picker-wrapper .react-datepicker__month-text {
            width: auto !important;
            margin: 0 !important;
            padding: 10px 4px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            color: hsl(var(--foreground));
          }
          .month-picker-wrapper .react-datepicker__month-text:hover {
            background: hsl(var(--accent)) !important;
            color: hsl(var(--accent-foreground)) !important;
          }
          .month-picker-wrapper .react-datepicker__month--selected {
            background: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
          }
          .month-picker-wrapper .react-datepicker__navigation {
             top: 8px;
          }
          .month-picker-wrapper .react-datepicker__navigation--previous {
             left: 8px;
          }
          .month-picker-wrapper .react-datepicker__navigation--next {
             right: 8px;
          }
        `}</style>
      </PopoverContent>
    </Popover>
  )
}
