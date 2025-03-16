'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { FaCalendarAlt } from "react-icons/fa";
import { FC, useRef } from "react";

interface DatePickerProps extends Omit<React.ComponentPropsWithRef<"input">, 'onChange' | 'value'> {
  value?: string | Date | null;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker: FC<DatePickerProps> = ({ 
  className, 
  value, 
  onChange,
  placeholder,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 文字列をISOフォーマットの日付文字列に変換する関数
  const formatValueForInput = (val: string | Date | null | undefined): string => {
    if (!val) return '';
    
    if (val instanceof Date) {
      // Dateオブジェクトの場合、YYYY-MM-DD形式に変換
      return val.toISOString().split('T')[0];
    }
    
    if (typeof val === 'string') {
      try {
        // 日付文字列として解析できる場合
        const dateObj = new Date(val);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        // 解析エラーの場合はそのまま返す
      }
      // それ以外の場合はそのまま返す
      return val;
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const inputValue = e.target.value;
      // 空の場合はundefinedを返す
      if (!inputValue) {
        onChange(undefined);
        return;
      }
      
      // 入力値からDateオブジェクトを作成して返す
      const dateObj = new Date(inputValue);
      if (!isNaN(dateObj.getTime())) {
        onChange(dateObj);
      }
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

  const formattedValue = formatValueForInput(value);

  return (
    <div>
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border border-input focus-visible:ring-ring",
            className
          )}
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder}
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