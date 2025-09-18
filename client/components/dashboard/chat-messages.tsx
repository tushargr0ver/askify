"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { useChatStore } from "@/hooks/useChatStore"
import { cn } from "@/lib/utils"

export function ChatMessages() {
  const { messages, activeChat } = useChatStore()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to Askify</h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 group",
              message.role === "USER" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "ASSISTANT" && (
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                AI
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3",
                message.role === "USER"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-muted"
              )}
            >
              <MarkdownRenderer 
                content={message.content}
                className={cn(
                  message.role === "USER" 
                    ? "prose-invert" 
                    : ""
                )}
              />
              <div className={cn(
                "text-xs mt-2 opacity-70",
                message.role === "USER" ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
            {message.role === "USER" && (
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
