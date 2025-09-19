"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModelSelector } from "./model-selector";
import { UsageDisplay } from "./usage-display";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account preferences, AI model settings, and view usage statistics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AI Model Preferences</h3>
            <ModelSelector />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            <UsageDisplay />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
