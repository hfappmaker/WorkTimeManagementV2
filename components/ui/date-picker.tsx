'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { FC, useRef } from "react";

interface DatePickerProps extends Omit<React.ComponentPropsWithRef<"input">, 'onChange' | 'value'> {
  value?: string;
  onChange?: (date: string) => void;
}

export const DatePicker: FC<DatePickerProps> = ({ 
  className, 
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      if (inputRef.current.showPicker) {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border border-input focus-visible:ring-ring",
            className
          )}
          onChange={handleChange}
          {...props}
          ref={inputRef}
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
    </div>
  );
};

DatePicker.displayName = "DatePicker";