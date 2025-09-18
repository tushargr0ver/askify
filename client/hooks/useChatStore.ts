"use client"

import { create } from "zustand"

export type ChatType = "DOCUMENT" | "REPOSITORY"

export type Chat = {
  id: string
  title: string
  type: ChatType
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
}

export type Message = {
  id: string
  content: string
  role: "USER" | "ASSISTANT"
  createdAt: string
}

export type ChatState = {
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  loading: boolean
  processing: boolean
  uploadProgress: number
  setChats: (chats: Chat[]) => void
  setActiveChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setProcessing: (processing: boolean) => void
  setUploadProgress: (progress: number) => void
  addMessage: (message: Message) => void
  createChat: (title: string, type: ChatType) => void
  createChatWithFile: (file: File) => Promise<void>
  createChatWithRepository: (repoUrl: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  loadChats: () => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  sendMessage: (content: string, model?: string) => Promise<void>
}

// Mock data
const mockChats: Chat[] = [
  {
    id: "1",
    title: "React Documentation.pdf",
    type: "DOCUMENT",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:22:00Z",
    messageCount: 4,
    lastMessage: "Thanks for explaining the useEffect hook!"
  },
  {
    id: "2", 
    title: "askify-repo",
    type: "REPOSITORY",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    messageCount: 3,
    lastMessage: "How does the authentication work?"
  },
  {
    id: "3",
    title: "TypeScript Guide.pdf",
    type: "DOCUMENT", 
    createdAt: "2024-01-13T11:20:00Z",
    updatedAt: "2024-01-13T12:30:00Z",
    messageCount: 2,
    lastMessage: "What are the benefits of using TypeScript?"
  }
]

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  processing: false,
  uploadProgress: 0,
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setProcessing: (processing) => set({ processing }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  loadChats: async () => {
    const { getJson } = await import("@/lib/api")
    try {
      set({ loading: true })
      const response = await getJson<any[]>("/chat")
      
      // Transform backend response to frontend format
      const chats: Chat[] = response.map(chat => ({
        id: chat.id,
        title: chat.title,
        type: chat.type,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat._count?.messages || 0,
        lastMessage: chat.messages?.[0]?.content || undefined
      }))
      
      set({ chats, loading: false })
    } catch (error) {
      console.error("Failed to load chats:", error)
      set({ loading: false })
    }
  },
  
  loadChatMessages: async (chatId: string) => {
    const { getJson } = await import("@/lib/api")
    try {
      set({ loading: true })
      const response = await getJson<any>(`/chat/${chatId}`)
      
      // Transform backend response to frontend format
      const messages: Message[] = response.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt
      }))
      
      set({ messages, loading: false })
    } catch (error) {
      console.error("Failed to load chat messages:", error)
      set({ loading: false, messages: [] })
    }
  },
  
  sendMessage: async (content: string, model?: string) => {
    const { postJson } = await import("@/lib/api")
    const { activeChat } = get()
    
    if (!activeChat) {
      throw new Error("No active chat selected")
    }
    
    try {
      set({ loading: true })
      
      // Optimistically add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "USER",
        createdAt: new Date().toISOString()
      }
      
      set((state) => ({
        messages: [...state.messages, userMessage]
      }))
      
      // Prepare request body with optional model
      const requestBody: { content: string; model?: string } = { content }
      if (model) {
        requestBody.model = model
      }
      
      // Send message to backend
      const response = await postJson<typeof requestBody, { userMessage: any; assistantMessage: any }>(`/chat/${activeChat.id}/messages`, requestBody)
      
      // Replace optimistic message with real ones from backend
      set((state) => {
        const messagesWithoutOptimistic = state.messages.slice(0, -1)
        return {
          messages: [
            ...messagesWithoutOptimistic,
            {
              id: response.userMessage.id,
              content: response.userMessage.content,
              role: response.userMessage.role,
              createdAt: response.userMessage.createdAt
            },
            {
              id: response.assistantMessage.id,
              content: response.assistantMessage.content,
              role: response.assistantMessage.role,
              createdAt: response.assistantMessage.createdAt
            }
          ],
          loading: false
        }
      })
      
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove optimistic message on error
      set((state) => ({
        messages: state.messages.slice(0, -1),
        loading: false
      }))
      throw error
    }
  },

  createChat: (title, type) => {
    // This is now only used for basic chat creation without files/repos
    // The actual API call happens in createChatWithFile/createChatWithRepository
    const newChat: Chat = {
      id: Date.now().toString(),
      title,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    }
    set((state) => ({ 
      chats: [newChat, ...state.chats],
      activeChat: newChat,
      messages: []
    }))
  },
  createChatWithFile: async (file: File) => {
    const { postJson, uploadFile } = await import("@/lib/api")
    
    try {
      set({ processing: true, uploadProgress: 0 })
      
      // First create the chat
      const newChat = await postJson<{ title?: string; type: ChatType }, Chat>("/chat", {
        title: file.name,
        type: "DOCUMENT"
      })
      
      // Update state with new chat
      set((state) => ({
        chats: [newChat, ...state.chats],
        activeChat: newChat,
        messages: [],
        uploadProgress: 25
      }))
      
      // Then upload the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("chatId", newChat.id)
      
      const uploadResponse = await uploadFile<{ jobId: string }>("/file-upload", formData)
      
      set({ uploadProgress: 50 })
      
      // Poll for job completion (similar to repository processing)
      const jobId = uploadResponse.jobId
      let completed = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout
      
      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        try {
          const { getJson } = await import("@/lib/api")
          const statusResponse = await getJson<{ status: string }>(`/file-upload/job/${jobId}`)
          const progress = Math.min(75 + (attempts * 2), 95)
          set({ uploadProgress: progress })
          
          if (statusResponse.status === 'completed') {
            completed = true
            set({ uploadProgress: 100 })
          } else if (statusResponse.status === 'failed') {
            throw new Error('Document processing failed')
          }
        } catch (statusError) {
          console.warn('Status check failed:', statusError)
        }
        
        attempts++
      }
      
      if (!completed) {
        console.warn('Document processing timed out, but chat was created')
      }
      
      // Wait a bit to show completion
      setTimeout(() => {
        set({ processing: false, uploadProgress: 0 })
        // Reload chats to update the list
        get().loadChats()
      }, 500)
      
    } catch (error) {
      console.error("File upload failed:", error)
      set({ processing: false, uploadProgress: 0 })
      throw error
    }
  },
  createChatWithRepository: async (repoUrl: string) => {
    const { postJson } = await import("@/lib/api")
    
    try {
      set({ processing: true, uploadProgress: 0 })
      
      // Extract repository name from URL
      const repoName = repoUrl.split('/').pop() || 'repository'
      
      // First create the chat
      const newChat = await postJson<{ title?: string; type: ChatType }, Chat>("/chat", {
        title: repoName,
        type: "REPOSITORY"
      })
      
      // Update state with new chat
      set((state) => ({
        chats: [newChat, ...state.chats],
        activeChat: newChat,
        messages: [],
        uploadProgress: 25
      }))
      
      // Then process the repository
      const processResponse = await postJson<{ url: string; chatId: string }, { jobId: string }>("/repository/process", {
        url: repoUrl,
        chatId: newChat.id
      })
      
      set({ uploadProgress: 50 })
      
      // Poll for job completion (simplified polling)
      const jobId = processResponse.jobId
      let completed = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout
      
      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        try {
          const { getJson } = await import("@/lib/api")
          const statusResponse = await getJson<{ status: string }>(`/repository/job/${jobId}`)
          const progress = Math.min(75 + (attempts * 2), 95)
          set({ uploadProgress: progress })
          
          if (statusResponse.status === 'completed') {
            completed = true
            set({ uploadProgress: 100 })
          } else if (statusResponse.status === 'failed') {
            throw new Error('Repository processing failed')
          }
        } catch (statusError) {
          console.warn('Status check failed:', statusError)
        }
        
        attempts++
      }
      
      if (!completed) {
        console.warn('Repository processing timed out, but chat was created')
      }
      
      // Wait a bit to show completion
      setTimeout(() => {
        set({ processing: false, uploadProgress: 0 })
        // Reload chats to update the list
        get().loadChats()
      }, 500)
      
    } catch (error) {
      console.error("Repository processing failed:", error)
      set({ processing: false, uploadProgress: 0 })
      throw error
    }
  },
  deleteChat: async (chatId: string) => {
    const { deleteJson } = await import("@/lib/api")
    try {
      await deleteJson(`/chat/${chatId}`)
      
      set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
        messages: state.activeChat?.id === chatId ? [] : state.messages
      }))
    } catch (error) {
      console.error("Failed to delete chat:", error)
      throw error
    }
  }
}))
