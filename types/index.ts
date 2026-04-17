/**
 * Core Types for LLM Analytics Platform
 * 
 * This file contains all TypeScript type definitions for the application.
 * These types form the foundation for data validation, API contracts, and UI components.
 */

// ============================================================================
// LLM Models
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral'

export type LLMModel = 
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'gemini-pro'
  | 'gemini-ultra'
  | 'llama-3'
  | 'mistral-large'

export interface LLMModelConfig {
  id: LLMModel
  name: string
  provider: LLMProvider
  enabled: boolean
}

// ============================================================================
// Brand Context
// ============================================================================

export interface BrandContext {
  /** Company or brand name */
  companyName: string
  
  /** Official website URL */
  website?: string
  
  /** Industry or business category */
  industry: string
  
  /** Primary market or region */
  region: string
  
  /** Brand description and value proposition */
  description: string
  
  /** Key concepts and keywords associated with the brand */
  keywords: string[]
  
  /** URLs that the LLM should mention or cite when discussing the brand */
  sourceUrls: string[]
  
  /** Specific pages or content that should be referenced */
  preferredCitations: string[]
  
  /** Additional context or notes */
  notes?: string
}

// ============================================================================
// Prompt System
// ============================================================================

export type PromptType = 
  | 'informative'      // "What is [brand]?"
  | 'comparative'      // "Compare [brand] with [competitor]"
  | 'opinion'          // "What do people think about [brand]?"
  | 'recommendation'   // "Recommend a [product/service]"
  | 'custom'          // User-defined prompts

export interface PromptTemplate {
  /** Unique identifier for the template */
  id: string
  
  /** Type of prompt */
  type: PromptType
  
  /** Base template with variables (e.g., "What is {brand}?") */
  baseTemplate: string
  
  /** Variables that can be injected into the template */
  variables: string[]
  
  /** URLs that must be mentioned in the response */
  sourceRequirements?: string[]
  
  /** Description of what this prompt tests */
  description: string
  
  /** Example of the prompt */
  example?: string
}

export interface CustomPrompt {
  /** User-defined prompt text */
  text: string
  
  /** Type classification */
  type: PromptType
  
  /** Variables to replace (e.g., {brand}, {competitor}) */
  variables?: string[]
  
  /** Required sources to mention */
  sourceRequirements?: string[]
}

// ============================================================================
// Source Requirements
// ============================================================================

export type SourceType = 
  | 'official-website'
  | 'blog'
  | 'product-page'
  | 'review'
  | 'news-article'
  | 'documentation'
  | 'other'

export interface SourceRequirement {
  /** URL that should be mentioned */
  url: string
  
  /** Type/category of source */
  type: SourceType
  
  /** Label/description for this source */
  label?: string
  
  /** Whether this source is required (must be mentioned) or optional */
  required: boolean
}

// ============================================================================
// Audit Configuration
// ============================================================================

export interface AuditConfig {
  /** Selected LLM models to test */
  models: LLMModel[]
  
  /** Types of prompts to use */
  promptTypes: PromptType[]
  
  /** Custom prompts defined by the user */
  customPrompts?: CustomPrompt[]
  
  /** How many positions to analyze in rankings (e.g., top 5, top 10) */
  rankingDepth: number
  
  /** Competitor names for comparative analysis */
  competitors: string[]
  
  /** Brand discovery scenarios to test */
  brandDiscovery?: string
  
  /** Use cases to analyze */
  useCases: string[]
  
  /** Source requirements for all prompts */
  sourceRequirements: SourceRequirement[]
  
  /** Additional configuration options */
  options?: {
    /** Temperature for LLM responses (0-1) */
    temperature?: number
    
    /** Maximum tokens in response */
    maxTokens?: number
    
    /** Whether to include source citations in analysis */
    includeCitations?: boolean
  }
}

// ============================================================================
// LLM Responses
// ============================================================================

export interface LLMResponse {
  /** ID of the LLM model used */
  model: LLMModel
  
  /** The prompt that was sent */
  prompt: string
  
  /** The response from the LLM */
  response: string
  
  /** Timestamp of when the response was generated */
  timestamp: Date
  
  /** Metadata about the response */
  metadata?: {
    /** Token usage */
    tokensUsed?: number
    
    /** Response time in milliseconds */
    responseTime?: number
    
    /** Model version used */
    modelVersion?: string
  }
  
  /** Error if the request failed */
  error?: {
    code: string
    message: string
  }
}

// ============================================================================
// Analysis Results
// ============================================================================

export interface Mention {
  /** The text where the brand was mentioned */
  text: string
  
  /** Context around the mention */
  context: string
  
  /** Position in the response (character index) */
  position: number
  
  /** Sentiment of the mention */
  sentiment?: 'positive' | 'neutral' | 'negative'
  
  /** Whether it's a direct mention or indirect reference */
  type: 'direct' | 'indirect'
}

export interface RankingInfo {
  /** Position in the ranking (1-based) */
  position: number
  
  /** Total number of items in the ranking */
  totalItems: number
  
  /** Context of the ranking (e.g., "top 5 email marketing tools") */
  context: string
  
  /** Full text of the ranking entry */
  entryText: string
}

export interface SourceCompliance {
  /** URLs that were required to be mentioned */
  required: string[]
  
  /** URLs that were actually mentioned in the response */
  mentioned: string[]
  
  /** URLs that were required but not mentioned */
  missing: string[]
  
  /** Compliance percentage (0-100) */
  compliancePercentage: number
}

export interface CompetitorComparison {
  /** Competitor name */
  competitor: string
  
  /** How the brand compares (better, worse, equal, not compared) */
  comparison: 'better' | 'worse' | 'equal' | 'not-compared'
  
  /** Context of the comparison */
  context: string
}

export interface AnalysisResult {
  /** Unique identifier for this analysis */
  id: string
  
  /** The LLM response that was analyzed */
  response: LLMResponse
  
  /** Overall perception score (0-100) */
  perceptionScore: number
  
  /** Ranking information if the brand appeared in a ranking */
  ranking?: RankingInfo
  
  /** All mentions of the brand in the response */
  mentions: Mention[]
  
  /** Source compliance analysis */
  sourceCompliance: SourceCompliance
  
  /** Overall sentiment */
  sentiment: 'positive' | 'neutral' | 'negative'
  
  /** Key concepts extracted from the response */
  keyConcepts: string[]
  
  /** Competitor comparisons found */
  competitorComparison: CompetitorComparison[]
  
  /** Timestamp of analysis */
  analyzedAt: Date
}

// ============================================================================
// Audit Results
// ============================================================================

export interface AuditResult {
  /** Unique identifier for this audit */
  id: string
  
  /** Brand context used */
  brandContext: BrandContext
  
  /** Audit configuration */
  auditConfig: AuditConfig
  
  /** Analysis results for each model and prompt combination */
  results: AnalysisResult[]
  
  /** Overall metrics aggregated across all results */
  overallMetrics: {
    /** Average perception score */
    averagePerceptionScore: number
    
    /** Best perception score */
    bestPerceptionScore: number
    
    /** Worst perception score */
    worstPerceptionScore: number
    
    /** Average ranking position (if applicable) */
    averageRankingPosition?: number
    
    /** Total mentions across all responses */
    totalMentions: number
    
    /** Average source compliance percentage */
    averageSourceCompliance: number
  }
  
  /** Timestamp when audit was created */
  createdAt: Date
  
  /** Timestamp when audit was completed */
  completedAt?: Date
  
  /** Status of the audit */
  status: 'pending' | 'running' | 'completed' | 'failed'
}

// ============================================================================
// UI State Types
// ============================================================================

export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
}

// ============================================================================
// API Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface AuditRunRequest {
  brandContext: BrandContext
  auditConfig: AuditConfig
}

export interface AuditRunResponse {
  auditId: string
  status: 'pending' | 'running'
  estimatedCompletionTime?: number
}

export interface AuditStatusResponse {
  auditId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: {
    completed: number
    total: number
    percentage: number
  }
  results?: AuditResult
}
