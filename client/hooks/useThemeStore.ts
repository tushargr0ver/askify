"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

type ThemeState = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  hydrated: boolean
  setTheme: (theme: Theme) => void
  setResolvedTheme: (theme: "light" | "dark") => void
  setHydrated: (hydrated: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",
      hydrated: false,
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== "undefined") {
          applyTheme(theme)
        }
      },
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "askify-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return
  
  const root = document.documentElement
  const { setResolvedTheme } = useThemeStore.getState()

  // Remove existing theme classes
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    root.classList.add(systemTheme)
    setResolvedTheme(systemTheme)
  } else {
    root.classList.add(theme)
    setResolvedTheme(theme)
  }
}

// Initialize theme on client side
if (typeof window !== "undefined") {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", () => {
    const { theme } = useThemeStore.getState()
    if (theme === "system") {
      applyTheme("system")
    }
  })
}
