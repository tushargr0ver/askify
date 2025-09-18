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
  setChats: (chats: Chat[]) => void
  setActiveChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setProcessing: (processing: boolean) => void
  addMessage: (message: Message) => void
  createChat: (title: string, type: ChatType) => void
  deleteChat: (chatId: string) => void
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

// Mock messages for each chat
const mockMessagesByChat: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1",
      content: "Hello! I've uploaded the React documentation. Can you help me understand how hooks work?",
      role: "USER",
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "1-2", 
      content: "I'd be happy to help you understand React hooks! Based on the documentation you've uploaded, hooks are functions that let you use state and other React features in functional components. The most commonly used hooks are useState for managing state and useEffect for handling side effects. Would you like me to explain any specific hook in detail?",
      role: "ASSISTANT",
      createdAt: "2024-01-15T10:31:00Z"
    },
    {
      id: "1-3",
      content: "Can you explain useEffect in detail?",
      role: "USER", 
      createdAt: "2024-01-15T10:32:00Z"
    },
    {
      id: "1-4",
      content: "Absolutely! useEffect is a React hook that lets you perform side effects in functional components. It's similar to componentDidMount, componentDidUpdate, and componentWillUnmount combined in class components.\n\nHere's how it works:\n\n1. **Basic syntax**: useEffect(callback, dependencies)\n2. **Effect runs after render**: The callback function runs after the component renders\n3. **Dependencies array**: Controls when the effect runs\n   - No array: runs after every render\n   - Empty array []: runs only once after initial render\n   - With values [dep1, dep2]: runs when dependencies change\n\nCommon use cases include data fetching, setting up subscriptions, and manually changing the DOM.",
      role: "ASSISTANT",
      createdAt: "2024-01-15T10:33:00Z"
    }
  ],
  "2": [
    {
      id: "2-1",
      content: "I'm looking at the askify repository. Can you explain how the authentication system works?",
      role: "USER",
      createdAt: "2024-01-14T09:15:00Z"
    },
    {
      id: "2-2",
      content: "Based on the askify repository code, the authentication system uses JWT tokens with NestJS and Passport. Here's how it works:\n\n1. **Backend**: Uses JWT strategy with bcrypt for password hashing\n2. **Frontend**: Zustand store manages auth state with localStorage persistence\n3. **Protection**: ProtectedRoute component guards authenticated routes\n4. **Flow**: Login → JWT token → Auto-header injection → Route protection\n\nThe system also includes automatic logout on 401 responses and session persistence across browser sessions.",
      role: "ASSISTANT",
      createdAt: "2024-01-14T09:20:00Z"
    },
    {
      id: "2-3",
      content: "How does the authentication work?",
      role: "USER",
      createdAt: "2024-01-14T16:45:00Z"
    }
  ],
  "3": [
    {
      id: "3-1",
      content: "What are the benefits of using TypeScript?",
      role: "USER",
      createdAt: "2024-01-13T11:20:00Z"
    },
    {
      id: "3-2",
      content: "Great question! Based on the TypeScript guide you've uploaded, here are the key benefits:\n\n1. **Type Safety**: Catches errors at compile time rather than runtime\n2. **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation\n3. **Self-Documenting Code**: Types serve as inline documentation\n4. **Easier Refactoring**: Confident code changes with type checking\n5. **Team Collaboration**: Clearer interfaces and contracts between team members\n\nTypeScript essentially adds a powerful type system on top of JavaScript while maintaining full JavaScript compatibility.",
      role: "ASSISTANT",
      createdAt: "2024-01-13T12:30:00Z"
    }
  ]
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: mockChats,
  activeChat: mockChats[0],
  messages: mockMessagesByChat["1"] || [],
  loading: false,
  processing: false,
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ 
    activeChat: chat,
    messages: chat ? (mockMessagesByChat[chat.id] || []) : []
  }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setProcessing: (processing) => set({ processing }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  createChat: (title, type) => {
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
  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter(chat => chat.id !== chatId),
    activeChat: state.activeChat?.id === chatId ? null : state.activeChat
  }))
}))
