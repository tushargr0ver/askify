"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { getJson } from "@/lib/api";

interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
  tier: "standard" | "advanced" | "premium";
  recommended?: boolean;
}

interface ModelSelectorProps {
  value?: string;
  onChange: (modelId: string | undefined) => void;
  compact?: boolean;
}

export function QuickModelSelector({ value, onChange, compact = false }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [defaultModel, setDefaultModel] = useState<ModelConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModels = useCallback(async () => {
    try {
      const response = await getJson<{
        availableModels: ModelConfig[];
        defaultModel: ModelConfig;
        preferredModel: string | null;
      }>("/users/preferences");
      
      setModels(response.availableModels);
      setDefaultModel(response.defaultModel);
      
      if (!value) {
        const initialModel = response.preferredModel || response.defaultModel.id;
        onChange(initialModel);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setLoading(false);
    }
  }, [value, onChange]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const selectedModel = models.find(m => m.id === value) || defaultModel;

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

  if (loading || !selectedModel) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={compact ? "h-6 px-2 text-xs" : "h-8"}
      >
        <Brain className="h-3 w-3 mr-1" />
        Loading...
      </Button>
    );
  }

  if (compact) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-6 w-auto min-w-[80px] px-2 text-xs border-dashed">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span className="truncate max-w-[60px]">
              {selectedModel.name.replace('GPT-', '').replace('OpenAI ', '')}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs">{model.name}</span>
                <div className="flex items-center gap-1 ml-2">
                  <Badge className={`text-xs ${getTierColor(model.tier)}`}>
                    {model.tier}
                  </Badge>
                  {model.recommended && (
                    <Badge variant="secondary" className="text-xs">
                      ⭐
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>{selectedModel.name}</span>
          {selectedModel.recommended && (
            <Badge variant="secondary" className="text-xs">
              Recommended
            </Badge>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center justify-between w-full">
              <span>{model.name}</span>
              <div className="flex items-center gap-1 ml-2">
                <Badge className={getTierColor(model.tier)}>
                  {model.tier}
                </Badge>
                {model.recommended && (
                  <Badge variant="secondary">
                    Recommended
                  </Badge>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
