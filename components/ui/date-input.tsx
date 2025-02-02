'use client'
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "./input";
import { FaCalendarAlt } from "react-icons/fa";

export type DateInputProps = InputProps;

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

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
          ref={inputRef}
          type="date"
          className={cn("pr-10", className)}
          {...props}
        />
        {/* <FontAwesomeIcon icon="far fa-calendar-alt" /> */}
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
    );
  }
);
DateInput.displayName = "DateInput"; 