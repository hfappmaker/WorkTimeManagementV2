"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import * as React from "react"
import { FC } from "react"

import { cn } from "@/utils/styles/tailwind-utils"

const RadioGroup: FC<React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>>
  = ({ className, ...props }) => {
    return (
      <RadioGroupPrimitive.Root
        className={cn("grid gap-2", className)}
        {...props}
      />
    )
  }

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem: FC<React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>> =
  ({ className, ...props }) => {
    return (
      <RadioGroupPrimitive.Item
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="size-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
  }

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem } 