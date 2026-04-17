/**
 * Template Engine
 * 
 * Advanced template processing with variable substitution, conditionals, and loops.
 */

import type { BrandContext, PromptTemplate } from '@/types'

// ============================================================================
// Template Engine Class
// ============================================================================

export class TemplateEngine {
  private context: BrandContext
  private variables: Record<string, string> = {}

  constructor(brandContext: BrandContext, additionalVariables: Record<string, string> = {}) {
    this.context = brandContext
    this.variables = {
      brand: brandContext.companyName,
      company: brandContext.companyName,
      industry: brandContext.industry,
      region: brandContext.region,
      website: brandContext.website || '',
      description: brandContext.description,
      ...additionalVariables,
    }
  }

  /**
   * Process a template string with variable substitution
   */
  process(template: string): string {
    let result = template

    // Replace all variables {variableName}
    result = result.replace(/\{(\w+)\}/g, (match, varName) => {
      const lowerVarName = varName.toLowerCase()
      return this.variables[lowerVarName] || this.getVariableValue(lowerVarName) || match
    })

    return result.trim()
  }

  /**
   * Get variable value with fallback
   */
  private getVariableValue(varName: string): string {
    // Direct variable access
    if (this.variables[varName]) {
      return this.variables[varName]
    }

    // Special variable handlers
    switch (varName) {
      case 'keywords':
        return Array.isArray(this.context.keywords)
          ? this.context.keywords.join(', ')
          : this.context.keywords || ''
      
      case 'keywords_list':
        return Array.isArray(this.context.keywords)
          ? this.context.keywords.map((k) => `- ${k}`).join('\n')
          : ''
      
      default:
        return ''
    }
  }

  /**
   * Set a custom variable
   */
  setVariable(name: string, value: string): void {
    this.variables[name.toLowerCase()] = value
  }

  /**
   * Set multiple variables at once
   */
  setVariables(vars: Record<string, string>): void {
    Object.entries(vars).forEach(([key, value]) => {
      this.setVariable(key, value)
    })
  }

  /**
   * Get all available variables
   */
  getAvailableVariables(): string[] {
    return Object.keys(this.variables)
  }

  /**
   * Validate that all variables in template are available
   */
  validateTemplate(template: string): {
    valid: boolean
    missingVariables: string[]
  } {
    const variableRegex = /\{(\w+)\}/g
    const matches = template.matchAll(variableRegex)
    const missingVariables: string[] = []

    for (const match of matches) {
      const varName = match[1].toLowerCase()
      if (!this.variables[varName] && !this.getVariableValue(varName)) {
        if (!missingVariables.includes(varName)) {
          missingVariables.push(varName)
        }
      }
    }

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    }
  }
}

// ============================================================================
// Template Utilities
// ============================================================================

/**
 * Extract all variables from a template string
 */
export function extractVariables(template: string): string[] {
  const variableRegex = /\{(\w+)\}/g
  const matches = template.matchAll(variableRegex)
  const variables: string[] = []

  for (const match of matches) {
    const varName = match[1].toLowerCase()
    if (!variables.includes(varName)) {
      variables.push(varName)
    }
  }

  return variables
}

/**
 * Format a prompt template with proper spacing and structure
 */
export function formatPrompt(prompt: string): string {
  // Remove extra whitespace
  let formatted = prompt.replace(/\s+/g, ' ').trim()

  // Ensure proper sentence ending
  if (!formatted.endsWith('.') && !formatted.endsWith('?') && !formatted.endsWith('!')) {
    formatted += '.'
  }

  return formatted
}
