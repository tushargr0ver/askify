"use client"

import * as React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatHeader } from "@/components/dashboard/chat-header"
import { ChatMessages } from "@/components/dashboard/chat-messages"
import { ChatInput } from "@/components/dashboard/chat-input"
import { NewChatDialog } from "@/components/dashboard/new-chat-dialog"

export default function Dashboard() {
  const [newChatOpen, setNewChatOpen] = React.useState(false)

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar onNewChat={() => setNewChatOpen(true)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  )
}
