export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "")

export type ApiError = {
  status: number
  message: string
  data?: unknown
}

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

function pickErrorMessage(data: any): string | undefined {
  if (!data) return undefined
  if (typeof data === "string") return data
  if (typeof data.message === "string") return data.message
  if (Array.isArray(data.message) && data.message.length) return String(data.message[0])
  if (typeof data.error === "string") return data.error
  return undefined
}

async function request<TResp = unknown>(path: string, init?: RequestInit): Promise<TResp> {
  const { useAuthStore } = await import("@/hooks/useAuthStore")
  const token = useAuthStore.getState().accessToken

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(buildUrl(path), { ...init, headers })

  let data: any = null
  const text = await res.text()
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.replace("/login")
      }
    }
    const message = pickErrorMessage(data) || `Request failed with ${res.status}`
    const err: ApiError = { status: res.status, message, data }
    throw err
  }

  return data as TResp
}

export async function postJson<TBody extends object, TResp = unknown>(path: string, body: TBody, init?: RequestInit): Promise<TResp> {
  return request<TResp>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  })
}

export async function getJson<TResp = unknown>(path: string, init?: RequestInit): Promise<TResp> {
  return request<TResp>(path, { method: "GET", ...init })
}

export async function putJson<TBody extends object, TResp = unknown>(path: string, body: TBody, init?: RequestInit): Promise<TResp> {
  return request<TResp>(path, { method: "PUT", body: JSON.stringify(body), ...init })
}

export async function patchJson<TBody extends object, TResp = unknown>(path: string, body: TBody, init?: RequestInit): Promise<TResp> {
  return request<TResp>(path, { method: "PATCH", body: JSON.stringify(body), ...init })
}

export async function deleteJson<TResp = unknown>(path: string, init?: RequestInit): Promise<TResp> {
  return request<TResp>(path, { method: "DELETE", ...init })
}

export async function uploadFile<TResp = unknown>(path: string, formData: FormData, init?: RequestInit): Promise<TResp> {
  const { useAuthStore } = await import("@/hooks/useAuthStore")
  const token = useAuthStore.getState().accessToken

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(buildUrl(path), { 
    method: "POST",
    body: formData,
    headers,
    ...init
  })

  let data: any = null
  const text = await res.text()
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.replace("/login")
      }
    }
    const message = pickErrorMessage(data) || `Request failed with ${res.status}`
    const err: ApiError = { status: res.status, message, data }
    throw err
  }

  return data as TResp
}
