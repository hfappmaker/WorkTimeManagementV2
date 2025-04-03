import * as React from "react"
import { FC, useState, memo, useCallback } from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/utils/utils"

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

type NumberInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T> & {
    [P in Path<T>]: T[P] extends (number | undefined) ? P : never;
  }[Path<T>];
  label: string;
  placeholder?: string;
}

const NumberInput = memo(({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <Input
    type="number"
    placeholder={placeholder}
    value={value}
    min="0"
    step="1"
    onChange={onChange}
    onKeyDown={onKeyDown}
  />
));

NumberInput.displayName = "NumberInput";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NumberInputFieldContent = ({ field, label, placeholder }: { field: any; label: string; placeholder?: string }) => {
  const [localValue, setLocalValue] = useState<string>(field.value?.toString() ?? "");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    if (value === "") {
      field.onChange(undefined);
    } else {
      const numValue = Number(value);
      if (numValue >= 0) {
        field.onChange(numValue);
      }
    }
  }, [field]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === '.' || e.key === ',') {
      e.preventDefault();
    }
  }, []);

  return (
    <FormItem className="flex-1">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <NumberInput
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

NumberInputFieldContent.displayName = "NumberInputFieldContent";

export const NumberInputField = <T extends FieldValues>(props: NumberInputFieldProps<T>) => {
  const { control, name, label, placeholder } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <NumberInputFieldContent field={field} label={label} placeholder={placeholder} />
      )}
    />
  );
};

export { Input }
