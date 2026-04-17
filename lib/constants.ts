/**
 * Application Constants
 * 
 * This file contains constant values used throughout the application,
 * such as LLM model configurations, prompt templates, and default values.
 */

import type { LLMModelConfig, PromptTemplate } from '@/types'

// ============================================================================
// LLM Models Configuration
// ============================================================================

export const LLM_MODELS: LLMModelConfig[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    enabled: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    enabled: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    enabled: true,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    enabled: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    enabled: true,
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'google',
    enabled: true,
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    provider: 'meta',
    enabled: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    enabled: true,
  },
]

// ============================================================================
// Prompt Templates
// ============================================================================

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'informative-what-is',
    type: 'informative',
    baseTemplate: 'What is {brand}? What does it do?',
    variables: ['brand'],
    description: 'Basic informational question about the brand',
    example: 'What is Acme Corporation? What does it do?',
  },
  {
    id: 'informative-description',
    type: 'informative',
    baseTemplate: 'Describe {brand} and its main products or services.',
    variables: ['brand'],
    description: 'Detailed description request',
    example: 'Describe Acme Corporation and its main products or services.',
  },
  {
    id: 'comparative-direct',
    type: 'comparative',
    baseTemplate: 'Compare {brand} with {competitor}. What are the main differences?',
    variables: ['brand', 'competitor'],
    description: 'Direct comparison between brand and competitor',
    example: 'Compare Acme Corporation with Competitor X. What are the main differences?',
  },
  {
    id: 'comparative-alternatives',
    type: 'comparative',
    baseTemplate: 'What are alternatives to {brand}? How do they compare?',
    variables: ['brand'],
    description: 'Find alternatives and compare',
    example: 'What are alternatives to Acme Corporation? How do they compare?',
  },
  {
    id: 'opinion-reviews',
    type: 'opinion',
    baseTemplate: 'What do people think about {brand}? What are the reviews saying?',
    variables: ['brand'],
    description: 'Opinion and review analysis',
    example: 'What do people think about Acme Corporation? What are the reviews saying?',
  },
  {
    id: 'opinion-reputation',
    type: 'opinion',
    baseTemplate: 'What is the reputation of {brand} in the {industry} industry?',
    variables: ['brand', 'industry'],
    description: 'Industry reputation inquiry',
    example: 'What is the reputation of Acme Corporation in the technology industry?',
  },
  {
    id: 'recommendation-product',
    type: 'recommendation',
    baseTemplate: 'Recommend the best {productType} for {useCase}.',
    variables: ['productType', 'useCase'],
    description: 'Product recommendation request',
    example: 'Recommend the best email marketing tools for small businesses.',
  },
  {
    id: 'recommendation-brand',
    type: 'recommendation',
    baseTemplate: 'Should I use {brand} for {useCase}? Why or why not?',
    variables: ['brand', 'useCase'],
    description: 'Brand-specific recommendation',
    example: 'Should I use Acme Corporation for email marketing? Why or why not?',
  },
]

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_AUDIT_CONFIG = {
  rankingDepth: 5,
  models: ['gpt-4', 'claude-3-opus', 'gemini-pro'] as const,
  promptTypes: ['informative', 'comparative'] as const,
  useCases: [] as string[],
  competitors: [] as string[],
  sourceRequirements: [] as string[],
}

// ============================================================================
// Industries
// ============================================================================

export const INDUSTRIES = [
  'Tecnología',
  'E-commerce',
  'Finanzas',
  'Salud',
  'Educación',
  'Marketing',
  'Retail',
  'SaaS',
  'Consultoría',
  'Otro',
]

// ============================================================================
// Regions
// ============================================================================

export const REGIONS = [
  'Global',
  'América Latina',
  'Estados Unidos',
  'Europa',
  'Asia',
  'España',
  'México',
  'Argentina',
]

// ============================================================================
// Use Cases
// ============================================================================

export const USE_CASES = [
  'Product Search',
  'Market Research',
  'Customer Support',
  'Content Generation',
  'Competitive Analysis',
  'Brand Reputation',
]

// ============================================================================
// Source Types
// ============================================================================

export const SOURCE_TYPES = [
  { value: 'official-website', label: 'Official Website' },
  { value: 'blog', label: 'Blog' },
  { value: 'product-page', label: 'Product Page' },
  { value: 'review', label: 'Review' },
  { value: 'news-article', label: 'News Article' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' },
] as const
