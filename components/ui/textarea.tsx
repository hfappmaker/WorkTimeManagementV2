'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ComponentPropsWithRef, FC } from "react"
import { Observable } from "rxjs";
import { FormActionResult } from "@/models/form-action-result";
import { useFormControl } from "@/hooks/useFormControl";

export interface TextAreaProps extends ComponentPropsWithRef<"textarea"> {
  observable?: Observable<{result: FormActionResult, isPending: boolean}>
}

const TextArea : FC<TextAreaProps> = ({ 
  className, 
  name, 
  onChange, 
  placeholder, 
  observable,
  ...props 
}) => {
  const { localError, localValue, handleChange } = useFormControl(name, observable, onChange);

  return (
    <div>
      <textarea
        name={name}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          localError 
            ? "border border-red-500 focus-visible:ring-red-500"
            : "border border-input focus-visible:ring-ring",
          className
        )}
        {...props}
        placeholder={placeholder}
        onChange={handleChange}
        value={localValue}
      />
      {localError && <div className="mt-1 text-sm text-red-500">{localError}</div>}
    </div>
  );
};

TextArea.displayName = "TextArea";

export { TextArea };
