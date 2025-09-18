"use client"

import * as React from "react"
import { MessageSquarePlus, Search, Trash2, FileText, GitBranch, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/hooks/useChatStore"
import { useSidebarStore } from "@/hooks/useSidebarStore"
import { SearchDialog } from "@/components/ui/search-dialog"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onNewChat: () => void
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { chats, activeChat, setActiveChat, deleteChat } = useChatStore()
  const { isOpen, close } = useSidebarStore()

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

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
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
        "bg-background lg:bg-muted/30 border-r flex flex-col h-full transition-all duration-200 ease-in-out",
        // Mobile: fixed positioned, slide in/out
        "fixed inset-y-0 left-0 z-50 w-64 transform lg:relative lg:z-auto",
        // Desktop: show/hide with width
        "lg:static lg:transform-none",
        isOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:w-0 lg:border-r-0"
      )}>
        <div className={cn(
          "w-64 flex flex-col h-full",
          !isOpen && "lg:hidden"
        )}>
          {/* Header */}
          <div className="p-4 border-b">
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
        <div className="p-4 border-b">
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
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No chats yet. Create your first chat!
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors group",
                    "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring",
                    activeChat?.id === chat.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
