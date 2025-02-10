'use client'
import React, { ComponentPropsWithRef, FC, useEffect, useState } from "react"
import { cn } from "@/lib/utils"


export interface InputProps extends ComponentPropsWithRef<"input"> {
  error?: string;
  /** フォームの送信中かどうか */
  isPending?: boolean;
}


export const Input: FC<InputProps> = ({ className, type, error, name, isPending, onChange, ...props }) => {
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    if(!isPending){
      setLocalError(error);
    }
  }, [error, isPending]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      setLocalError(undefined);
    }
    if (onChange) onChange(e);
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
  );
};

Input.displayName = "Input"
