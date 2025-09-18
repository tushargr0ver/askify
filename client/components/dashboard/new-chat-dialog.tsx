"use client"

import * as React from "react"
import { FileText, GitBranch, Upload, Link2, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChatStore } from "@/hooks/useChatStore"
import { cn } from "@/lib/utils"

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const [selectedType, setSelectedType] = React.useState<"DOCUMENT" | "REPOSITORY" | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [repoUrl, setRepoUrl] = React.useState("")
  const [processing, setProcessing] = React.useState(false)
  const { createChat } = useChatStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleCreate = async () => {
    if (!selectedType) return

    setProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (selectedType === "DOCUMENT" && file) {
      createChat(file.name, "DOCUMENT")
    } else if (selectedType === "REPOSITORY" && repoUrl) {
      const repoName = repoUrl.split("/").pop() || "repository"
      createChat(repoName, "REPOSITORY")
    }

    // Reset form
    setSelectedType(null)
    setFile(null)
    setRepoUrl("")
    setProcessing(false)
    onOpenChange(false)
  }

  const handleClose = () => {
    if (!processing) {
      setSelectedType(null)
      setFile(null)
      setRepoUrl("")
      onOpenChange(false)
    }
  }

  const canCreate = (selectedType === "DOCUMENT" && file) || (selectedType === "REPOSITORY" && repoUrl)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to start your chat
            </p>
            <div className="grid gap-3">
              <button
                onClick={() => setSelectedType("DOCUMENT")}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">Upload Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with PDF, DOC, or DOCX files
                  </p>
                </div>
              </button>
              <button
                onClick={() => setSelectedType("REPOSITORY")}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <GitBranch className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-medium">Fetch Repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with code from a GitHub repository(Public)
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : selectedType === "DOCUMENT" ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedType(null)}
              className="self-start"
            >
              ← Back
            </Button>
            <div>
              <Label htmlFor="file-upload">Upload Document</Label>
              <div className="mt-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    file ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950" : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  {file ? (
                    <>
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Drop files here or click to upload
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedType(null)}
              className="self-start"
            >
              ← Back
            </Button>
            <div>
              <Label htmlFor="repo-url">Repository URL</Label>
              <div className="mt-2 relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="repo-url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {selectedType && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate || processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
