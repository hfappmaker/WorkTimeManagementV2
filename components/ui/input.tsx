'use client'
import React, { ComponentPropsWithRef, FC, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends ComponentPropsWithRef<"input"> {
  error?: string;
  errorVersion?: number;
  name: string;
}

export const Input: FC<InputProps> = ({ className, type, error, errorVersion, name, value, onChange, ...props }) => {
  const [localError, setLocalError] = useState(error);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value === inputRef.current.defaultValue) {
      setLocalError(error);
    }
  }, [error, errorVersion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      setLocalError(undefined);
    }
    if (onChange) onChange(e);
  };

  return (
    <div>
      <input
        ref={inputRef}
        defaultValue={value}
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
  );
};

Input.displayName = "Input"
