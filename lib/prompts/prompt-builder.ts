/**
 * Prompt Builder
 * 
 * This module provides functionality to build and customize prompts dynamically.
 * It handles variable substitution, template selection, and source requirement injection.
 */

import type {
  BrandContext,
  PromptTemplate,
  CustomPrompt,
  SourceRequirement,
  PromptType,
} from '@/types'
import { PROMPT_TEMPLATES } from '@/lib/constants'

// ============================================================================
// Prompt Builder Class
// ============================================================================

export class PromptBuilder {
  private brandContext: BrandContext
  private sourceRequirements: SourceRequirement[]

  constructor(brandContext: BrandContext, sourceRequirements: SourceRequirement[] = []) {
    this.brandContext = brandContext
    this.sourceRequirements = sourceRequirements
  }

  /**
   * Build a prompt from a template
   */
  buildFromTemplate(template: PromptTemplate, variables: Record<string, string> = {}): string {
    let prompt = template.baseTemplate

    // Replace variables in the template
    template.variables.forEach((variable) => {
      const value = variables[variable] || this.getDefaultVariableValue(variable)
      prompt = prompt.replace(new RegExp(`\\{${variable}\\}`, 'gi'), value)
    })

    // Also check for any other variables in the template that might not be in the variables array
    const variableRegex = /\{(\w+)\}/g
    let match
    while ((match = variableRegex.exec(template.baseTemplate)) !== null) {
      const variable = match[1].toLowerCase()
      if (!template.variables.includes(variable)) {
        const value = variables[variable] || this.getDefaultVariableValue(variable)
        prompt = prompt.replace(new RegExp(`\\{${variable}\\}`, 'gi'), value)
      }
    }

    // Inject source requirements if needed
    if (this.sourceRequirements.length > 0 && template.sourceRequirements !== undefined) {
      prompt = this.injectSourceRequirements(prompt)
    }

    return prompt.trim()
  }

  /**
   * Build a prompt from a custom user prompt
   */
  buildFromCustom(customPrompt: CustomPrompt, variables: Record<string, string> = {}): string {
    let prompt = customPrompt.text

    // Extract all variables from the prompt text automatically
    const variableRegex = /\{(\w+)\}/g
    const foundVariables = new Set<string>()
    let match
    while ((match = variableRegex.exec(prompt)) !== null) {
      foundVariables.add(match[1].toLowerCase())
    }

    // Replace all found variables
    foundVariables.forEach((variable) => {
      const value = variables[variable] || this.getDefaultVariableValue(variable)
      prompt = prompt.replace(new RegExp(`\\{${variable}\\}`, 'gi'), value)
    })

    // Also replace variables explicitly provided (for backwards compatibility)
    if (customPrompt.variables) {
      customPrompt.variables.forEach((variable) => {
        const value = variables[variable] || this.getDefaultVariableValue(variable)
        prompt = prompt.replace(new RegExp(`\\{${variable}\\}`, 'gi'), value)
      })
    }

    // Inject source requirements if they exist (always inject if sourceRequirements array has items)
    if (this.sourceRequirements.length > 0) {
      prompt = this.injectSourceRequirements(prompt)
    }

    return prompt.trim()
  }

  /**
   * Get default value for a variable based on brand context
   */
  private getDefaultVariableValue(variable: string): string {
    const variableMap: Record<string, string> = {
      brand: this.brandContext.companyName,
      company: this.brandContext.companyName,
      industry: this.brandContext.industry,
      region: this.brandContext.region,
      website: this.brandContext.website || '',
    }

    return variableMap[variable.toLowerCase()] || `{${variable}}`
  }

  /**
   * Inject source requirements into a prompt
   */
  private injectSourceRequirements(prompt: string): string {
    const requiredSources = this.sourceRequirements
      .filter((sr) => sr.required)
      .map((sr) => sr.url)

    if (requiredSources.length === 0) {
      return prompt
    }

    const sourceInstruction = this.buildSourceInstruction(requiredSources)
    
    // Append source requirements to the prompt
    return `${prompt}\n\n${sourceInstruction}`
  }

  /**
   * Build source instruction text
   */
  private buildSourceInstruction(urls: string[]): string {
    if (urls.length === 0) return ''

    if (urls.length === 1) {
      return `Please mention or cite this source when relevant: ${urls[0]}`
    }

    return `Please mention or cite these sources when relevant:\n${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}`
  }

  /**
   * Get available templates for a prompt type
   */
  static getTemplatesForType(type: PromptType): PromptTemplate[] {
    return PROMPT_TEMPLATES.filter((template) => template.type === type)
  }

  /**
   * Get all available templates
   */
  static getAllTemplates(): PromptTemplate[] {
    return PROMPT_TEMPLATES
  }

  /**
   * Find a template by ID
   */
  static findTemplateById(id: string): PromptTemplate | undefined {
    return PROMPT_TEMPLATES.find((template) => template.id === id)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build a complete prompt with all context
 */
export function buildPrompt(
  brandContext: BrandContext,
  templateOrCustom: PromptTemplate | CustomPrompt,
  sourceRequirements: SourceRequirement[] = [],
  additionalVariables: Record<string, string> = {}
): string {
  const builder = new PromptBuilder(brandContext, sourceRequirements)

  if ('baseTemplate' in templateOrCustom) {
    // It's a PromptTemplate
    return builder.buildFromTemplate(templateOrCustom, additionalVariables)
  } else {
    // It's a CustomPrompt
    return builder.buildFromCustom(templateOrCustom, additionalVariables)
  }
}

/**
 * Preview a prompt before building it
 */
export function previewPrompt(
  brandContext: BrandContext,
  templateOrCustom: PromptTemplate | CustomPrompt,
  sourceRequirements: SourceRequirement[] = [],
  additionalVariables: Record<string, string> = {}
): {
  prompt: string
  variables: Record<string, string>
  hasSourceRequirements: boolean
} {
  const builder = new PromptBuilder(brandContext, sourceRequirements)
  
  let prompt: string
  if ('baseTemplate' in templateOrCustom) {
    prompt = builder.buildFromTemplate(templateOrCustom, additionalVariables)
  } else {
    prompt = builder.buildFromCustom(templateOrCustom, additionalVariables)
  }

  // Extract all variables used
  const variables: Record<string, string> = {}
  if ('baseTemplate' in templateOrCustom) {
    templateOrCustom.variables.forEach((variable) => {
      variables[variable] = additionalVariables[variable] || builder['getDefaultVariableValue'](variable)
    })
  } else if (templateOrCustom.variables) {
    templateOrCustom.variables.forEach((variable) => {
      variables[variable] = additionalVariables[variable] || builder['getDefaultVariableValue'](variable)
    })
  }

  return {
    prompt,
    variables,
    hasSourceRequirements: sourceRequirements.length > 0,
  }
}
