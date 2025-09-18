"use client"

import * as React from "react"
import { useThemeStore } from "@/hooks/useThemeStore"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setHydrated } = useThemeStore()

  React.useEffect(() => {
    // Apply stored theme after component mounts
    const stored = localStorage.getItem("askify-theme")
    const storedTheme = stored ? JSON.parse(stored).state?.theme || "system" : "system"
    
    const root = document.documentElement
    root.classList.remove("light", "dark")
    
    if (storedTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(storedTheme)
    }
    
    setHydrated(true)
  }, [setHydrated])

  return <>{children}</>
}
