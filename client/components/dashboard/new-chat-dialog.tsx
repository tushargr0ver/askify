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
  const [repoUrlError, setRepoUrlError] = React.useState("")
  const { createChatWithFile, createChatWithRepository, uploadProgress } = useChatStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a PDF, DOC, or DOCX file.')
        return
      }
      
      const maxSize = 5 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        alert('File size must be less than 5MB.')
        return
      }
      
      setFile(selectedFile)
    }
  }

  const validateRepoUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/
    if (!url) {
      setRepoUrlError("")
      return false
    }
    if (!githubUrlPattern.test(url)) {
      setRepoUrlError("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)")
      return false
    }
    setRepoUrlError("")
    return true
  }

  const handleRepoUrlChange = (value: string) => {
    setRepoUrl(value)
    if (value) {
      validateRepoUrl(value)
    } else {
      setRepoUrlError("")
    }
  }

  const handleCreate = async () => {
    if (!selectedType) return

    try {
      if (selectedType === "DOCUMENT" && file) {
        await createChatWithFile(file)
      } else if (selectedType === "REPOSITORY" && repoUrl) {
        await createChatWithRepository(repoUrl)
      }

      setSelectedType(null)
      setFile(null)
      setRepoUrl("")
      setRepoUrlError("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const handleClose = () => {
    const isProcessing = useChatStore.getState().processing
    if (!isProcessing) {
      setSelectedType(null)
      setFile(null)
      setRepoUrl("")
      setRepoUrlError("")
      onOpenChange(false)
    }
  }

  const canCreate = (selectedType === "DOCUMENT" && file) || (selectedType === "REPOSITORY" && repoUrl && !repoUrlError)
  const isProcessing = useChatStore.getState().processing

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you&apos;d like to start your chat
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
                    Chat with code from a GitHub repository (Public)
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
            {file && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
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
                  onChange={(e) => handleRepoUrlChange(e.target.value)}
                  className={cn("pl-10", repoUrlError && "border-red-500")}
                />
              </div>
              {repoUrlError && (
                <p className="text-sm text-red-500 mt-1">{repoUrlError}</p>
              )}
              {repoUrl && !repoUrlError && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-sm">
                    <span>Processing repository...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedType && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedType === "DOCUMENT" ? "Uploading..." : "Processing..."}
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
