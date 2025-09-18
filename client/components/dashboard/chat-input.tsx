"use client"

import * as React from "react"
import { Send, Loader2, FileText, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/hooks/useChatStore"
import { cn } from "@/lib/utils"

export function ChatInput() {
  const [message, setMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const { activeChat, addMessage, processing } = useChatStore()

  const handleSend = async () => {
    if (!message.trim() || !activeChat || sending || processing) return

    const userMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      role: "USER" as const,
      createdAt: new Date().toISOString()
    }

    addMessage(userMessage)
    setMessage("")
    setSending(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${message.trim()}". Based on the ${activeChat.type === "DOCUMENT" ? "document" : "repository"} you've provided, I can help you with that. This is a simulated response - in the real application, this would be generated using the actual AI service with the processed content.`,
        role: "ASSISTANT" as const,
        createdAt: new Date().toISOString()
      }
      addMessage(aiMessage)
      setSending(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = !activeChat || sending || processing

  return (
    <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto p-4">
        {activeChat && processing && (
          <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing {activeChat.type === "DOCUMENT" ? "document" : "repository"}...</span>
            <div className="ml-auto flex items-center gap-1 text-muted-foreground">
              {activeChat.type === "DOCUMENT" ? (
                <FileText className="h-3 w-3" />
              ) : (
                <GitBranch className="h-3 w-3" />
              )}
              <span className="text-xs">{activeChat.title}</span>
            </div>
          </div>
        )}
        
        <div className="relative">
          <Textarea
            placeholder={
              !activeChat 
                ? "Select a chat to start messaging..."
                : processing 
                ? "Please wait while we process your content..."
                : `Ask about ${activeChat.title}...`
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            className="min-h-[60px] max-h-[200px] pr-12 resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={isDisabled || !message.trim()}
            size="sm"
            className="absolute right-2 bottom-2 h-8 w-8 p-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span className="hidden sm:block">Press Enter to send, Shift+Enter for new line</span>
          {activeChat && (
            <div className="flex items-center gap-1">
              {activeChat.type === "DOCUMENT" ? (
                <FileText className="h-3 w-3" />
              ) : (
                <GitBranch className="h-3 w-3" />
              )}
              <span>{activeChat.title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
