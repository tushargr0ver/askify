"use client"

import * as React from "react"
import { MessageSquarePlus, Search, Trash2, FileText, GitBranch, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/hooks/useChatStore"
import { useSidebarStore } from "@/hooks/useSidebarStore"
import { SearchDialog } from "@/components/ui/search-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { UsageDisplay } from "./usage-display"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onNewChat: () => void
}

// Simple inline markdown parser for basic formatting in sidebar
const parseSimpleMarkdown = (text: string) => {
  // Escape HTML entities first for security
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  
  // Apply basic markdown formatting
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>') // Inline code
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [chatToDelete, setChatToDelete] = React.useState<string | null>(null)
  const { chats, activeChat, setActiveChat, deleteChat, loadChats, loadChatMessages } = useChatStore()
  const { isOpen, close } = useSidebarStore()

  React.useEffect(() => {
    loadChats()
  }, [loadChats])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getMessageClampClass = (message: string) => {
    return message.length <= 50 ? "line-clamp-1" : "line-clamp-2"
  }

  const handleChatSelect = async (chat: typeof activeChat) => {
    setActiveChat(chat)
    if (chat) {
      await loadChatMessages(chat.id)
    }
  }

  const handleChatKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault()
      setChatToDelete(chatId)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatToDelete(chatId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return
    try {
      await deleteChat(chatToDelete)
    } catch (error) {
      console.error("Failed to delete chat:", error)
    } finally {
      setChatToDelete(null)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}
      
      <div className={cn(
        "bg-background lg:bg-muted/30 border-r flex flex-col transition-all duration-200 ease-in-out",
        "fixed inset-y-0 left-0 z-50 w-64 transform lg:relative lg:z-auto lg:w-64",
        "lg:static lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:border-r-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Askify</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={close}
              className="lg:hidden h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={onNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b flex-shrink-0">
          <Button
            onClick={() => setSearchOpen(true)}
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            Search chats
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No chats yet. Create your first chat!
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    onKeyDown={(e) => handleChatKeyDown(e, chat.id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors group",
                      "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                      activeChat?.id === chat.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {chat.type === "DOCUMENT" ? (
                            <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          ) : (
                            <GitBranch className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm truncate">
                            {chat.title}
                          </span>
                        </div>
                        {chat.lastMessage && (
                          <div 
                            className={cn(
                              "text-xs text-muted-foreground leading-relaxed break-words prose-inline",
                              getMessageClampClass(chat.lastMessage)
                            )}
                            dangerouslySetInnerHTML={{ 
                              __html: parseSimpleMarkdown(chat.lastMessage) 
                            }}
                          />
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(chat.updatedAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chat.messageCount} msgs
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                        title="Delete chat (or press Delete key when focused)"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Usage Display */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground mb-3">Message Usage</div>
          <UsageDisplay compact />
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
      {chatToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Chat"
          description={`Are you sure you want to delete "${chats.find(c => c.id === chatToDelete)?.title}"? This action cannot be undone and will remove all messages and associated data.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={confirmDeleteChat}
        />
      )}
    </>
  )
}
