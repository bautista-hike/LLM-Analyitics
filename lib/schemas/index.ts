/**
 * Zod Validation Schemas
 * 
 * This file contains all Zod schemas for data validation.
 * These schemas are used for form validation, API request validation, and type inference.
 */

import { z } from 'zod'
import type {
  LLMModel,
  LLMProvider,
  PromptType,
  SourceType,
} from '@/types'

// ============================================================================
// LLM Model Schemas
// ============================================================================

export const llmProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'meta',
  'mistral',
])

export const llmModelSchema = z.enum([
  'gpt-4',
  'gpt-4-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'gemini-pro',
  'gemini-ultra',
  'llama-3',
  'mistral-large',
])

export const llmModelConfigSchema = z.object({
  id: llmModelSchema,
  name: z.string().min(1),
  provider: llmProviderSchema,
  enabled: z.boolean().default(true),
})

// ============================================================================
// Brand Context Schema
// ============================================================================

export const brandContextSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long'),
  
  website: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry name is too long'),
  
  region: z
    .string()
    .min(1, 'Region is required')
    .max(100, 'Region name is too long'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long'),
  
  keywords: z
    .array(z.string().min(1))
    .default([])
    .or(
      z
        .string()
        .transform((val) =>
          val
            .split(',')
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        )
    ),
  
  sourceUrls: z
    .array(
      z
        .string()
        .url('Invalid URL format')
        .min(1, 'URL cannot be empty')
    )
    .default([]),
  
  preferredCitations: z
    .array(z.string().min(1))
    .default([]),
  
  notes: z.string().max(1000).optional(),
})

// ============================================================================
// Prompt System Schemas
// ============================================================================

export const promptTypeSchema = z.enum([
  'informative',
  'comparative',
  'opinion',
  'recommendation',
  'custom',
])

export const promptTemplateSchema = z.object({
  id: z.string().min(1),
  type: promptTypeSchema,
  baseTemplate: z.string().min(1),
  variables: z.array(z.string()).default([]),
  sourceRequirements: z.array(z.string().url()).optional(),
  description: z.string().min(1),
  example: z.string().optional(),
})

export const customPromptSchema = z.object({
  text: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(1000, 'Prompt is too long'),
  type: promptTypeSchema,
  variables: z.array(z.string()).optional(),
  sourceRequirements: z.array(z.string().url()).optional(),
})

// ============================================================================
// Source Requirements Schema
// ============================================================================

export const sourceTypeSchema = z.enum([
  'official-website',
  'blog',
  'product-page',
  'review',
  'news-article',
  'documentation',
  'other',
])

export const sourceRequirementSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .min(1, 'URL is required'),
  type: sourceTypeSchema,
  label: z.string().optional(),
  required: z.boolean().default(true),
})

// ============================================================================
// Audit Configuration Schema
// ============================================================================

export const auditConfigSchema = z.object({
  models: z
    .array(llmModelSchema)
    .min(1, 'At least one model must be selected'),
  
  promptTypes: z
    .array(promptTypeSchema)
    .min(1, 'At least one prompt type must be selected'),
  
  customPrompts: z.array(customPromptSchema).optional(),
  
  rankingDepth: z
    .number()
    .int('Ranking depth must be an integer')
    .min(3, 'Ranking depth must be at least 3')
    .max(20, 'Ranking depth cannot exceed 20')
    .default(5),
  
  competitors: z
    .array(z.string().min(1))
    .default([])
    .or(
      z
        .string()
        .transform((val) =>
          val
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0)
        )
    ),
  
  brandDiscovery: z.string().max(2000).optional(),
  
  useCases: z.array(z.string().min(1)).default([]),
  
  sourceRequirements: z.array(sourceRequirementSchema).default([]),
  
  options: z
    .object({
      temperature: z.number().min(0).max(1).optional(),
      maxTokens: z.number().int().min(1).max(4000).optional(),
      includeCitations: z.boolean().default(true),
    })
    .optional(),
})

// ============================================================================
// LLM Response Schema
// ============================================================================

export const llmResponseSchema = z.object({
  model: llmModelSchema,
  prompt: z.string().min(1),
  response: z.string().min(1),
  timestamp: z.date().default(() => new Date()),
  metadata: z
    .object({
      tokensUsed: z.number().int().positive().optional(),
      responseTime: z.number().int().positive().optional(),
      modelVersion: z.string().optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
})

// ============================================================================
// Analysis Result Schemas
// ============================================================================

export const mentionSchema = z.object({
  text: z.string().min(1),
  context: z.string(),
  position: z.number().int().nonnegative(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  type: z.enum(['direct', 'indirect']),
})

export const rankingInfoSchema = z.object({
  position: z.number().int().positive(),
  totalItems: z.number().int().positive(),
  context: z.string(),
  entryText: z.string(),
})

export const sourceComplianceSchema = z.object({
  required: z.array(z.string().url()),
  mentioned: z.array(z.string().url()),
  missing: z.array(z.string().url()),
  compliancePercentage: z.number().min(0).max(100),
})

export const competitorComparisonSchema = z.object({
  competitor: z.string().min(1),
  comparison: z.enum(['better', 'worse', 'equal', 'not-compared']),
  context: z.string(),
})

export const analysisResultSchema = z.object({
  id: z.string().uuid(),
  response: llmResponseSchema,
  perceptionScore: z.number().min(0).max(100),
  ranking: rankingInfoSchema.optional(),
  mentions: z.array(mentionSchema).default([]),
  sourceCompliance: sourceComplianceSchema,
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  keyConcepts: z.array(z.string()).default([]),
  competitorComparison: z.array(competitorComparisonSchema).default([]),
  analyzedAt: z.date().default(() => new Date()),
})

// ============================================================================
// Audit Result Schema
// ============================================================================

export const auditResultSchema = z.object({
  id: z.string().uuid(),
  brandContext: brandContextSchema,
  auditConfig: auditConfigSchema,
  results: z.array(analysisResultSchema).default([]),
  overallMetrics: z.object({
    averagePerceptionScore: z.number().min(0).max(100),
    bestPerceptionScore: z.number().min(0).max(100),
    worstPerceptionScore: z.number().min(0).max(100),
    averageRankingPosition: z.number().int().positive().optional(),
    totalMentions: z.number().int().nonnegative(),
    averageSourceCompliance: z.number().min(0).max(100),
  }),
  createdAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
})

// ============================================================================
// API Request/Response Schemas
// ============================================================================

export const auditRunRequestSchema = z.object({
  brandContext: brandContextSchema,
  auditConfig: auditConfigSchema,
})

export const auditRunResponseSchema = z.object({
  auditId: z.string().uuid(),
  status: z.enum(['pending', 'running']),
  estimatedCompletionTime: z.number().int().positive().optional(),
})

export const auditStatusResponseSchema = z.object({
  auditId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z
    .object({
      completed: z.number().int().nonnegative(),
      total: z.number().int().positive(),
      percentage: z.number().min(0).max(100),
    })
    .optional(),
  results: auditResultSchema.optional(),
})

// ============================================================================
// Type Inference from Schemas
// ============================================================================

export type BrandContextInput = z.input<typeof brandContextSchema>
export type BrandContextOutput = z.output<typeof brandContextSchema>

export type AuditConfigInput = z.input<typeof auditConfigSchema>
export type AuditConfigOutput = z.output<typeof auditConfigSchema>

export type AuditRunRequestInput = z.input<typeof auditRunRequestSchema>
export type AuditRunRequestOutput = z.output<typeof auditRunRequestSchema>
