import * as React from "react"

import { cn } from "@/lib/utils"
import { FC } from "react"

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextArea : FC<TextAreaProps> = ({ className, ...props }) => (
  <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
    )}
    {...props}
  />
)

TextArea.displayName = "TextArea"


export { TextArea } 