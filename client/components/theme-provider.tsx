"use client"

import * as React from "react"
import { useThemeStore } from "@/hooks/useThemeStore"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, initializeTheme } = useThemeStore()

  React.useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  if (!hydrated) {
    return <>{children}</>
  }

  return <>{children}</>
}
