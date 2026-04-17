/**
 * Prompts Module
 * 
 * Main entry point for prompt building functionality.
 * Exports all prompt-related utilities and classes.
 */

export { PromptBuilder, buildPrompt, previewPrompt } from './prompt-builder'
export { TemplateEngine, extractVariables, formatPrompt } from './template-engine'
export {
  SourceInjector,
  createSourceInjector,
  injectSources,
} from './source-injector'

// Re-export types for convenience
export type {
  BrandContext,
  PromptTemplate,
  CustomPrompt,
  SourceRequirement,
  PromptType,
} from '@/types'
