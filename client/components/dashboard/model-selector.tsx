"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Clock, DollarSign } from "lucide-react";
import { getJson, patchJson } from "@/lib/api";

interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
  description: string;
  tier: "standard" | "advanced" | "premium";
  capabilities: {
    reasoning: number;
    coding: number;
    multimodal: boolean;
    longContext: boolean;
  };
  pricing: {
    inputTokens: number;
    outputTokens: number;
  };
  contextWindow: number;
  maxOutputTokens: number;
  recommended?: boolean;
}

interface UserPreferences {
  preferredModel: string | null;
  availableModels: ModelConfig[];
  defaultModel: ModelConfig;
}

export function ModelSelector() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await getJson<UserPreferences>("/users/preferences");
      setPreferences(response);
      setSelectedModel(response.preferredModel || response.defaultModel.id);
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedModel) return;
    
    setSaving(true);
    try {
      await patchJson("/users/preferences", {
        preferredModel: selectedModel,
      });
      
      // Update local state
      if (preferences) {
        setPreferences({
          ...preferences,
          preferredModel: selectedModel,
        });
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "standard":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "premium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "openai":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "gemini":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getReasoningIcon = (reasoning: number) => {
    if (reasoning >= 5) return <Brain className="h-4 w-4 text-purple-500" />;
    if (reasoning >= 4) return <Zap className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Model Preferences</CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Model Preferences</CardTitle>
          <CardDescription>Failed to load preferences</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedModelConfig = preferences.availableModels.find(m => m.id === selectedModel);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Model Preferences
        </CardTitle>
        <CardDescription>
          Choose your preferred AI model for conversations. You can override this for individual messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {preferences.availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{model.name}</span>
                    {model.recommended && (
                      <Badge variant="secondary" className="ml-2">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModelConfig && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{selectedModelConfig.name}</h4>
              <div className="flex items-center gap-2">
                <Badge className={getTierColor(selectedModelConfig.tier)}>
                  {selectedModelConfig.tier}
                </Badge>
                <Badge className={getProviderColor(selectedModelConfig.provider)}>
                  {selectedModelConfig.provider}
                </Badge>
                {getReasoningIcon(selectedModelConfig.capabilities.reasoning)}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {selectedModelConfig.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-medium">Cost per 1M tokens</span>
                </div>
                <div className="text-muted-foreground">
                  Input: ${selectedModelConfig.pricing.inputTokens}
                </div>
                <div className="text-muted-foreground">
                  Output: ${selectedModelConfig.pricing.outputTokens}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="font-medium">Context window</span>
                <div className="text-muted-foreground">
                  {selectedModelConfig.contextWindow.toLocaleString()}
                </div>
                <span className="font-medium">Max output</span>
                <div className="text-muted-foreground">
                  {selectedModelConfig.maxOutputTokens.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-medium text-sm">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  Reasoning: {selectedModelConfig.capabilities.reasoning}/5
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Coding: {selectedModelConfig.capabilities.coding}/5
                </Badge>
                {selectedModelConfig.capabilities.multimodal && (
                  <Badge variant="outline" className="text-xs">
                    Multimodal
                  </Badge>
                )}
                {selectedModelConfig.capabilities.longContext && (
                  <Badge variant="outline" className="text-xs">
                    Long Context
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={loadPreferences} disabled={loading}>
            Reset to Current
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || selectedModel === preferences.preferredModel}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
