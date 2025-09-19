"use client"

import { create } from "zustand"
import { getJson } from "@/lib/api"

export interface UsageData {
  daily: {
    used: number
    limit: number
    remaining: number
    percentage: number
    breakdown: {
      messages: number
      uploads: number
      repos: number
    }
  }
  monthly: {
    used: number
    limit: number
    remaining: number
    percentage: number
    breakdown: {
      messages: number
      uploads: number
      repos: number
    }
  }
  weekly: Array<{
    date: string
    total: number
    breakdown: {
      messages: number
      uploads: number
      repos: number
    }
  }>
}

interface UsageState {
  usage: UsageData | null
  isLoading: boolean
  error: string | null
  fetchUsage: () => Promise<void>
  updateUsage: (newUsage: UsageData) => void
  reset: () => void
}

export const useUsageStore = create<UsageState>((set, get) => ({
  usage: null,
  isLoading: false,
  error: null,

  fetchUsage: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await getJson<UsageData>("/users/usage")
      set({ usage: data, isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || "Failed to fetch usage data",
        isLoading: false 
      })
    }
  },

  updateUsage: (newUsage: UsageData) => {
    set({ usage: newUsage })
  },

  reset: () => {
    set({ usage: null, isLoading: false, error: null })
  },
}))
