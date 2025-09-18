"use client"

import * as React from "react"
import { ProfileMenu } from "@/components/dashboard/profile-menu"
import { useChatStore } from "@/hooks/useChatStore"
import { useSidebarStore } from "@/hooks/useSidebarStore"
import { FileText, GitBranch, Menu, PanelLeftClose, PanelLeftOpen, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/ui/theme-toggle"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ChatHeader() {
  const { activeChat, deleteChat } = useChatStore()
  const { toggle, isOpen } = useSidebarStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const handleDeleteChat = async () => {
    if (!activeChat) return
    try {
      await deleteChat(activeChat.id)
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  return (
    <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-8 w-8 p-0"
          >
            {isOpen ? (
              <PanelLeftClose className="h-4 w-4 hidden lg:block" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 hidden lg:block" />
            )}
            <Menu className="h-4 w-4 lg:hidden" />
          </Button>
          {activeChat ? (
            <>
              {activeChat.type === "DOCUMENT" ? (
                <FileText className="h-5 w-5 text-blue-500" />
              ) : (
                <GitBranch className="h-5 w-5 text-green-500" />
              )}
              <div>
                <h1 className="font-semibold">{activeChat.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {activeChat.type === "DOCUMENT" ? "Document Chat" : "Repository Chat"}
                  {activeChat.messageCount > 0 && ` • ${activeChat.messageCount} messages`}
                </p>
              </div>
            </>
          ) : (
            <div>
              <h1 className="font-semibold">Askify</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered document and code assistant
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeChat && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ThemeSwitch />
          <ProfileMenu />
        </div>
      </div>

      {activeChat && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Chat"
          description={`Are you sure you want to delete "${activeChat.title}"? This action cannot be undone and will remove all messages and associated data.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleDeleteChat}
        />
      )}
    </div>
  )
}
