'use client'
import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { ComponentPropsWithRef, FC, useState, useEffect, useRef } from "react";

export interface DateInputProps
  extends ComponentPropsWithRef<"input"> {
  error?: string;
  name: string;
}

export const DateInput : FC<DateInputProps> = ({ className, error, name, onChange, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setLocalError(undefined);
    }
    onChange && onChange(e);
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
          name={name}
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            localError 
              ? "border border-red-500 focus-visible:ring-red-500"
              : "border border-input focus-visible:ring-ring",
            className
          )}
          {...props}
          onChange={handleChange}
          ref={inputRef}
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
      {localError && (
        <div className="mt-1 text-sm text-red-500">{localError}</div>
      )}
    </div>
  );
};
DateInput.displayName = "DateInput";