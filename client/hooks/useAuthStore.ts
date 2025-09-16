"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Profile = { userId: string | number; email: string } & Record<string, any>

type AuthState = {
  accessToken: string | null
  profile: Profile | null
  hydrated: boolean
  setAccessToken: (token: string | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => void
  setHydrated: (b: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      profile: null,
      hydrated: false,
      setAccessToken: (accessToken) => set({ accessToken }),
      setProfile: (profile) => set({ profile }),
      logout: () => set({ accessToken: null, profile: null }),
      setHydrated: (b) => set({ hydrated: b }),
    }),
    {
      name: "askify-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, profile: state.profile }),
      onRehydrateStorage: () => (state, error) => {
        // After rehydration completes, mark hydrated
        state?.setHydrated(true)
      },
    }
  )
)
