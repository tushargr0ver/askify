export interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'gemini'
  description: string
  tier: 'standard' | 'advanced' | 'premium'
  capabilities: {
    reasoning: number
    coding: number
    multimodal: boolean
    longContext: boolean
  }
  pricing: {
    inputTokens: number
    outputTokens: number
  }
  contextWindow: number
  maxOutputTokens: number
  recommended?: boolean
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    description: 'Latest flagship model with best reasoning, coding, and grounding capabilities',
    tier: 'premium',
    capabilities: {
      reasoning: 5,
      coding: 5,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 25.00,
      outputTokens: 100.00
    },
    contextWindow: 200000,
    maxOutputTokens: 100000
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    description: 'Advanced reasoning model optimized for logic-heavy tasks',
    tier: 'premium',
    capabilities: {
      reasoning: 5,
      coding: 5,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 20.00,
      outputTokens: 80.00
    },
    contextWindow: 250000,
    maxOutputTokens: 100000
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'openai',
    description: 'Optimized reasoning model with good accuracy-cost trade-offs',
    tier: 'advanced',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 5.00,
      outputTokens: 20.00
    },
    contextWindow: 200000,
    maxOutputTokens: 65536
  },
  {
    id: 'o3-pro',
    name: 'o3 Pro',
    provider: 'openai',
    description: 'Professional reasoning model for complex problem-solving',
    tier: 'premium',
    capabilities: {
      reasoning: 5,
      coding: 5,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 30.00,
      outputTokens: 120.00
    },
    contextWindow: 300000,
    maxOutputTokens: 150000
  },
  {
    id: 'o4-mini',
    name: 'o4 Mini',
    provider: 'openai',
    description: 'Smaller reasoning model, cheaper and faster with decent grounding',
    tier: 'standard',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 2.00,
      outputTokens: 8.00
    },
    contextWindow: 128000,
    maxOutputTokens: 32768
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Stronger than GPT-4, efficient with long context, good for mid-scale RAG',
    tier: 'advanced',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 8.00,
      outputTokens: 32.00
    },
    contextWindow: 150000,
    maxOutputTokens: 50000
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Efficient version of GPT-4.1 with good performance-cost balance',
    tier: 'standard',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 3.00,
      outputTokens: 12.00
    },
    contextWindow: 128000,
    maxOutputTokens: 32768
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    description: 'Ultra-efficient micro version for lightweight tasks',
    tier: 'standard',
    capabilities: {
      reasoning: 3,
      coding: 3,
      multimodal: false,
      longContext: false
    },
    pricing: {
      inputTokens: 0.50,
      outputTokens: 2.00
    },
    contextWindow: 32000,
    maxOutputTokens: 8192
  },
  
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'High intelligence model for complex tasks',
    tier: 'advanced',
    capabilities: {
      reasoning: 4,
      coding: 5,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 2.50,
      outputTokens: 10.00
    },
    contextWindow: 128000,
    maxOutputTokens: 16384,
    recommended: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient for most tasks, great balance of performance and cost',
    tier: 'standard',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 0.15,
      outputTokens: 0.60
    },
    contextWindow: 128000,
    maxOutputTokens: 16384,
    recommended: true
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'openai',
    description: 'Advanced reasoning for complex problems',
    tier: 'premium',
    capabilities: {
      reasoning: 5,
      coding: 5,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 15.00,
      outputTokens: 60.00
    },
    contextWindow: 200000,
    maxOutputTokens: 100000
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: 'openai',
    description: 'Reasoning model optimized for STEM',
    tier: 'advanced',
    capabilities: {
      reasoning: 5,
      coding: 5,
      multimodal: false,
      longContext: true
    },
    pricing: {
      inputTokens: 3.00,
      outputTokens: 12.00
    },
    contextWindow: 128000,
    maxOutputTokens: 65536
  },

  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Strong reasoning, multimodal (text, image, audio, video, PDF), long context, high accuracy',
    tier: 'premium',
    capabilities: {
      reasoning: 5,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 3.50,
      outputTokens: 10.50
    },
    contextWindow: 2000000,
    maxOutputTokens: 32768
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Faster, cheaper, still multimodal, good balance for RAG',
    tier: 'advanced',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 0.075,
      outputTokens: 0.30
    },
    contextWindow: 1000000,
    maxOutputTokens: 32768,
    recommended: true
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    description: 'Lightweight, optimized for cost and throughput',
    tier: 'standard',
    capabilities: {
      reasoning: 3,
      coding: 3,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 0.05,
      outputTokens: 0.15
    },
    contextWindow: 500000,
    maxOutputTokens: 16384
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Previous generation flagship model, still very capable',
    tier: 'advanced',
    capabilities: {
      reasoning: 4,
      coding: 4,
      multimodal: true,
      longContext: true
    },
    pricing: {
      inputTokens: 1.25,
      outputTokens: 5.00
    },
    contextWindow: 2000000,
    maxOutputTokens: 32768
  }
]

export function getModelById(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(model => model.id === modelId)
}

export function getModelsByTier(tier: 'standard' | 'advanced' | 'premium'): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.tier === tier)
}

export function getDefaultModel(): ModelConfig {
  return AVAILABLE_MODELS.find(model => model.id === 'gpt-4o-mini')!
}

export function getRecommendedModel(chatType: 'DOCUMENT' | 'REPOSITORY'): ModelConfig {
  if (chatType === 'REPOSITORY') {
    return AVAILABLE_MODELS.find(model => model.id === 'gpt-4o') || 
           AVAILABLE_MODELS.find(model => model.id === 'gemini-1.5-flash') ||
           getDefaultModel()
  } else {
    return AVAILABLE_MODELS.find(model => model.id === 'gpt-4o-mini') || 
           AVAILABLE_MODELS.find(model => model.id === 'gemini-1.5-flash') ||
           getDefaultModel()
  }
}

export function getRecommendedModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.recommended === true)
}
