'use client'

import React, { ComponentPropsWithRef, FC } from "react"
import { cn } from "@/lib/utils"
import { Observable } from "rxjs";
import { FormActionResult } from "@/models/form-action-result";
import { useFormControl } from "@/hooks/useFormControl";

export interface InputProps extends ComponentPropsWithRef<"input"> {
  observable?: Observable<{ result: FormActionResult, isPending: boolean }>
}

export const Input: FC<InputProps> = ({ 
  className, 
  type, 
  name, 
  onChange, 
  observable, 
  ...props 
}) => {
  const { localError, localValue, handleChange } = useFormControl(name, observable, onChange);

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
        value={localValue}
        {...props}
      />
      {localError && <div className="mt-1 text-sm text-red-500">{localError}</div>}
    </div>
  );
};

Input.displayName = "Input"
