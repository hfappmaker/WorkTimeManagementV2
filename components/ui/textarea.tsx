'use client'

import * as React from "react"

import { cn } from "@/lib/utils"
import { ComponentPropsWithRef, FC, useEffect, useState } from "react"

export interface TextAreaProps extends ComponentPropsWithRef<"textarea"> {
  error?: string;
  /** フォームの送信中かどうか */
  isPending?: boolean;
}



const TextArea : FC<TextAreaProps> = ({ className, error, name, isPending, onChange, ...props }) => {
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    if(!isPending){
      setLocalError(error);
    }
  }, [error, isPending]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalError(undefined);
    if (onChange) onChange(e);
  };

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
        onChange={handleChange}
        {...props}
      />
    {localError && <div className="mt-1 text-sm text-red-500">{localError}</div>}
    </div>
  );
};

TextArea.displayName = "TextArea";

export { TextArea };
