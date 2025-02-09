'use client'
import React, { ComponentPropsWithRef, FC, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends ComponentPropsWithRef<"input"> {
  error?: string;
  name: string;
}

export const Input: FC<InputProps> = ({ className, type, error, name, onChange, ...props }) => {
  // Local state to override error display
  const [localError, setLocalError] = useState(error);

  // Update local state when parent error prop changes
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  // Clear error when input changes and call any provided onChange event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setLocalError(undefined);
    }
    onChange && onChange(e);
  };

  return (
    <div>
      <input
        type={type}
        name={name}
        className={cn(
          "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          localError 
            ? "border border-red-500 focus-visible:ring-red-500"
            : "border border-input focus-visible:ring-ring",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {localError && <div className="mt-1 text-sm text-red-500">{localError}</div>}
    </div>
  )
}

Input.displayName = "Input"
