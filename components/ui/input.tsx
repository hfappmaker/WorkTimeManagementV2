import * as React from "react"

import { cn } from "@/lib/utils"
import { FC } from "react"
import { Control, FieldValues, Path } from "react-hook-form"
import { FormControl, FormLabel, FormField, FormMessage, FormItem } from "./form"

const Input: FC<React.ComponentPropsWithRef<"input">> =
  ({ className, type, ...props }) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }

Input.displayName = "Input"

interface InputFieldProps<T extends FieldValues, V extends number | null> {
  control: Control<T>;
  name: Path<T> & {
    [P in Path<T>]: T[P] extends (V | null) ? P : never;
  }[Path<T>];
  label: string;
  placeholder?: string;
}

export const NumberInputField = <T extends FieldValues, V extends number | null>(props: InputFieldProps<T, V>) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <Input value={field.value ?? ""} type="number" placeholder={props.placeholder} onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]+$/.test(value)) {
                field.onChange(Number(value));
              }
              else{
                field.onChange(null);
              }
            }} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { Input }
