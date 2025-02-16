'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { ComponentPropsWithRef, FC, useRef } from "react";
import { Observable } from "rxjs";
import { FormActionResult } from "@/models/form-action-result";
import { useFormControl } from "@/hooks/useFormControl";

export interface DateInputProps extends ComponentPropsWithRef<"input"> {
  observable?: Observable<{result: FormActionResult, isPending: boolean}>
}

export const DateInput : FC<DateInputProps> = ({ 
  className, 
  name, 
  onChange, 
  observable,
  ...props 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { localError, localValue, handleChange } = useFormControl(name, observable, onChange);

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
          onChange={handleChange}
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            localError 
              ? "border border-red-500 focus-visible:ring-red-500"
              : "border border-input focus-visible:ring-ring",
            className
          )}
          {...props}
          ref={inputRef}
          value={localValue}
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