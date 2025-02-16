'use client'

import React, { ComponentPropsWithRef, FC, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Observable, filter, map } from "rxjs";
import { FormActionResult } from "@/models/form-action-result";
export interface TextBoxProps extends ComponentPropsWithRef<"input"> {
  observable?: Observable<{result: FormActionResult, isPending: boolean}>
}

export const TextBox: FC<TextBoxProps> = ({ className, name, onChange, placeholder, observable,...props }) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [localValue, setLocalValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    if(observable){
      const subscription = observable.pipe(
        filter(({ isPending }) => isPending === false),
        map(({ result }) => result.formatErrors?.[name!])
      ).subscribe(error => {
        if(error !== undefined){
          setLocalError(error.error);
          setLocalValue(error.value); 
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [observable, name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(undefined);
    setLocalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      <input
        type='text'
        name={name}
        placeholder={placeholder}
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

TextBox.displayName = "TextBox"
