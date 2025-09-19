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
  initializeTheme: () => void
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
      initializeTheme: () => {
        if (typeof window !== "undefined") {
          const { theme } = get()
          applyTheme(theme)
          set({ hydrated: true })
        }
      },
    }),
    {
      name: "askify-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          applyTheme(state.theme)
          state.setHydrated(true)
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return
  
  const root = document.documentElement
  const { setResolvedTheme } = useThemeStore.getState()

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

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", () => {
    const { theme } = useThemeStore.getState()
    if (theme === "system") {
      applyTheme("system")
    }
  })
}
