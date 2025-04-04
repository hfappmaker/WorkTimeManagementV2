"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"
import { FC } from "react"

import { cn } from "@/utils/styles/tailwind-utils"

const Avatar: FC<React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>> =
  ({ className, ...props }) => (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage: FC<React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>> =
  ({ className, ...props }) => (
    <AvatarPrimitive.Image
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )

AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback: FC<React.ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>> =
  ({ className, ...props }) => (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
