'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { FC, useRef } from "react";
import { FieldValues, Control, Path } from "react-hook-form";
import { FormControl, FormField, FormMessage, FormItem, FormLabel } from "./form";

interface DatePickerProps extends Omit<React.ComponentPropsWithRef<"input">, 'onChange' | 'value'> {
  value?: string;
  onChange?: (date: string) => void;
}

export const DatePicker: FC<DatePickerProps> = ({
  className,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

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
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border border-input focus-visible:ring-ring",
            className
          )}
          onChange={handleChange}
          {...props}
          ref={inputRef}
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
    </div>
  );
};

DatePicker.displayName = "DatePicker";

interface DatePickerFieldProps<T extends FieldValues, V extends Date | null> {
  control: Control<T>;
  name: Path<T> & {
    [P in Path<T>]: T[P] extends (V | null) ? P : never;
  }[Path<T>];
  label: string;
  placeholder?: string;
}

export const DatePickerField = <T extends FieldValues, V extends Date | null>(props: DatePickerFieldProps<T, V>) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
              onChange={(date) => field.onChange(date ? new Date(date) : null)}
              placeholder={props.placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}