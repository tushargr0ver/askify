"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/hooks/useThemeStore"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "default"
}

export function ThemeToggle({ className, size = "default" }: ThemeToggleProps) {
  const { resolvedTheme, hydrated } = useThemeStore()

  if (!hydrated) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(
          "h-8 w-8 bg-background", 
          size === "sm" && "h-6 w-6", 
          className
        )}
        disabled
      >
        <div className={cn("h-4 w-4", size === "sm" && "h-3 w-3")} />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "h-8 w-8 bg-background", 
            size === "sm" && "h-6 w-6", 
            className
          )}
        >
          {resolvedTheme === "dark" ? (
            <Moon className={cn("h-4 w-4 text-yellow-400", size === "sm" && "h-3 w-3")} />
          ) : (
            <Sun className={cn("h-4 w-4 text-orange-500", size === "sm" && "h-3 w-3")} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => useThemeStore.getState().setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => useThemeStore.getState().setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => useThemeStore.getState().setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, hydrated } = useThemeStore()

  const handleToggle = () => {
    useThemeStore.getState().setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  if (!hydrated) {
    return (
      <button
        disabled
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-2 opacity-50",
          "bg-gray-300 border-gray-400",
          className
        )}
        aria-label="Toggle theme"
      >
        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 flex items-center justify-center border-2 border-gray-100 translate-x-0.5">
          <div className="h-3 w-3" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-2",
        resolvedTheme === "dark" ? "bg-blue-600 border-blue-500" : "bg-gray-300 border-gray-400",
        className
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 flex items-center justify-center border-2 border-gray-100",
          resolvedTheme === "dark" ? "translate-x-6" : "translate-x-0.5"
        )}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-3 w-3 text-blue-700" />
        ) : (
          <Sun className="h-3 w-3 text-orange-500" />
        )}
      </div>
    </button>
  )
}
