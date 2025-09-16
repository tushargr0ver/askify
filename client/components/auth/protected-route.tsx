"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/hooks/useAuthStore"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)
  const hydrated = useAuthStore((s) => s.hydrated)

  const isPublic = pathname === "/login" || pathname === "/signup"

  React.useEffect(() => {
    if (!hydrated) return
    if (isPublic) return
    if (!accessToken) {
      router.replace("/login")
    }
  }, [hydrated, accessToken, isPublic, router])

  if (!hydrated) return null
  if (isPublic) return <>{children}</>
  if (!accessToken) return null
  return <>{children}</>
}
