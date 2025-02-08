'use client'
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { FaCalendarAlt } from "react-icons/fa";
import { ComponentPropsWithRef, FC, useRef } from "react";

export interface DateInputProps
  extends ComponentPropsWithRef<typeof Input> {}

export const DateInput : FC<DateInputProps> = 
  ({ className, ...props }) => {
    const inputRef = useRef<HTMLInputElement>(null);
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
      <div className="relative">
        <Input
          type="date"
          className={cn("pr-10", className)}
          {...props}
          ref={inputRef}
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
    );
  };
DateInput.displayName = "DateInput";