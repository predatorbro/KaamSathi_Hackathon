"use client"

import type React from "react"
import { Toaster as Sonner } from "sonner"

type SonnerProps = React.ComponentProps<typeof Sonner>

export function Toaster(props: SonnerProps) {
  return (
    <Sonner
      theme="light"
      toastOptions={{
        classNames: {
          toast: "group toast bg-white text-gray-900 border border-gray-200 shadow-md rounded-xl",
          description: "group-[.toast]:text-gray-600",
          actionButton: "group-[.toast]:bg-gray-800 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
        },
      }}
      {...props}
    />
  )
}
