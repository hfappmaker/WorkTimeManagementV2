'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { FC, useRef } from "react";
import { FieldValues, Control, Path } from "react-hook-form";
import { FormControl, FormField, FormMessage, FormItem, FormLabel } from "./form";
import { SelectItem } from "./select";
import { SelectContent } from "./select";
import { SelectValue } from "./select";
import { SelectTrigger } from "./select";
import { Select } from "./select";
import { Button } from "./button";
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

interface YearMonthPickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T> & {
    [P in Path<T>]: T[P] extends (Date | null) ? P : never;
  }[Path<T>];
  label?: string;
  yearPlaceholder?: string;
  monthPlaceholder?: string;
  defaultValue?: Date;
  showClearButton?: boolean;
  yearTriggerClassName?: string;
  monthTriggerClassName?: string;
}

export const YearMonthPickerField = <T extends FieldValues>(props: YearMonthPickerFieldProps<T>) => {
  const {
    control,
    name,
    yearPlaceholder = "年",
    monthPlaceholder = "月",
    label,
    defaultValue,
    showClearButton = true,
    yearTriggerClassName,
    monthTriggerClassName } = props;
  // 年の選択肢を生成 (2025年から2099年までの範囲)
  const startYear = 2025;
  const endYear = 2099;
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    value: (startYear + i),
    label: `${startYear + i}年`
  }));

  // 月の選択肢を生成（ComboBox用にオブジェクト形式で）
  const monthOptions = [
    { value: 0, label: '1月' },
    { value: 1, label: '2月' },
    { value: 2, label: '3月' },
    { value: 3, label: '4月' },
    { value: 4, label: '5月' },
    { value: 5, label: '6月' },
    { value: 6, label: '7月' },
    { value: 7, label: '8月' },
    { value: 8, label: '9月' },
    { value: 9, label: '10月' },
    { value: 10, label: '11月' },
    { value: 11, label: '12月' },
  ];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) =>
        <FormItem className="flex flex-col gap-2">
          <FormLabel>{label ?? ""}</FormLabel>
          <div className="flex gap-2">
            <Select
              onValueChange={(value) => {
                const option = yearOptions.find(opt => opt.value?.toString() === value);
                if (option) {
                  field.onChange(new Date(Date.UTC(option.value, field.value?.getMonth() ?? 0, 1)));
                }
              }}
              value={field.value?.getFullYear().toString() ?? ""}
            >
              <FormControl>
                <SelectTrigger className={yearTriggerClassName}>
                  <SelectValue placeholder={<span className="text-muted-foreground">{yearPlaceholder}</span>} className="truncate" />
                </SelectTrigger>
              </FormControl>
              <SelectContent defaultValue={defaultValue?.getFullYear().toString()}>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value?.toString() ?? ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => {
                const option = monthOptions.find(opt => opt.value?.toString() === value);
                if (option) {
                  field.onChange(new Date(Date.UTC(field.value?.getFullYear() ?? startYear, option.value, 1)));
                }
              }}
              value={field.value?.getMonth().toString() ?? ""}
            >
              <FormControl>
                <SelectTrigger className={monthTriggerClassName}>
                  <SelectValue placeholder={<span className="text-muted-foreground">{monthPlaceholder}</span>} className="truncate" />
                </SelectTrigger>
              </FormControl>
              <SelectContent defaultValue={defaultValue?.getMonth().toString()}>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value?.toString() ?? ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showClearButton && (
            <Button
              type="button"
              onClick={() => field.onChange(null)}
              variant="outline"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground w-fit"
            >
              クリア
            </Button>
          )}
          <FormMessage />
        </FormItem>
      }
    />
  )
}