"use client"

import * as React from "react"
import { Send, Loader2, FileText, GitBranch, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/hooks/useChatStore"
import { useUsageStore } from "@/hooks/useUsageStore"
import { QuickModelSelector } from "./quick-model-selector"

export function ChatInput() {
  const [message, setMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [selectedModel, setSelectedModel] = React.useState<string | undefined>()
  const [usageError, setUsageError] = React.useState<string | null>(null)
  const { activeChat, sendMessage: sendChatMessage, processing, loading } = useChatStore()
  const { usage } = useUsageStore()

  const handleSend = async () => {
    if (!message.trim() || !activeChat || sending || processing) return

    const messageContent = message.trim()
    setMessage("")
    setSending(true)
    setUsageError(null)

    try {
      await sendChatMessage(messageContent, selectedModel)
    } catch (error: unknown) {
      console.error("Failed to send message:", error)
      
      const err = error as { name?: string; message?: string }
      if (err.name === 'UsageLimitError') {
        setUsageError(err.message || 'Usage limit reached')
      } else {
        setMessage(messageContent)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isNearLimit = usage && (
    (usage.daily.percentage >= 80) || 
    (usage.monthly.percentage >= 80)
  )

  const isDisabled = !activeChat || sending || processing || loading

  return (
    <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto p-4">
        {/* Usage Error Display */}
        {usageError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Message Limit Reached</p>
              <p className="text-sm text-destructive/80 mt-1">{usageError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUsageError(null)}
              className="text-destructive hover:text-destructive"
            >
              ×
            </Button>
          </div>
        )}

        {/* Processing State */}
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

        {/* Usage Warning */}
        {isNearLimit && !usageError && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Approaching Usage Limit
              </p>
              <p className="text-orange-700 dark:text-orange-300 mt-1">
                {usage.daily.percentage >= 80 
                  ? `Daily: ${usage.daily.used}/${usage.daily.limit} messages used (${usage.daily.remaining} remaining)`
                  : `Monthly: ${usage.monthly.used}/${usage.monthly.limit} messages used (${usage.monthly.remaining} remaining)`
                }
              </p>
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
            {sending || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">Press Enter to send, Shift+Enter for new line</span>
            {activeChat && (
              <QuickModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                compact
              />
            )}
          </div>
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
