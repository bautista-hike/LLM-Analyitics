/**
 * Source Injector
 * 
 * Handles injection of source requirements into prompts.
 * Ensures LLMs are instructed to mention or cite specific URLs.
 */

import type { SourceRequirement } from '@/types'

// ============================================================================
// Source Injector Class
// ============================================================================

export class SourceInjector {
  private sourceRequirements: SourceRequirement[]

  constructor(sourceRequirements: SourceRequirement[] = []) {
    this.sourceRequirements = sourceRequirements
  }

  /**
   * Inject source requirements into a prompt
   */
  inject(prompt: string, style: 'explicit' | 'subtle' | 'minimal' = 'explicit'): string {
    const requiredSources = this.sourceRequirements.filter((sr) => sr.required)
    const optionalSources = this.sourceRequirements.filter((sr) => !sr.required)

    if (requiredSources.length === 0 && optionalSources.length === 0) {
      return prompt
    }

    const instruction = this.buildInstruction(requiredSources, optionalSources, style)
    return `${prompt}\n\n${instruction}`
  }

  /**
   * Build instruction text based on style
   */
  private buildInstruction(
    required: SourceRequirement[],
    optional: SourceRequirement[],
    style: 'explicit' | 'subtle' | 'minimal'
  ): string {
    switch (style) {
      case 'explicit':
        return this.buildExplicitInstruction(required, optional)
      case 'subtle':
        return this.buildSubtleInstruction(required, optional)
      case 'minimal':
        return this.buildMinimalInstruction(required, optional)
      default:
        return this.buildExplicitInstruction(required, optional)
    }
  }

  /**
   * Explicit instruction style - very clear about requirements
   */
  private buildExplicitInstruction(
    required: SourceRequirement[],
    optional: SourceRequirement[]
  ): string {
    const parts: string[] = []

    if (required.length > 0) {
      if (required.length === 1) {
        parts.push(
          `IMPORTANT: You must mention or cite this source when discussing the brand: ${required[0].url}`
        )
      } else {
        parts.push('IMPORTANT: You must mention or cite these sources when discussing the brand:')
        required.forEach((sr, index) => {
          const label = sr.label ? ` (${sr.label})` : ''
          parts.push(`${index + 1}. ${sr.url}${label}`)
        })
      }
    }

    if (optional.length > 0) {
      if (parts.length > 0) {
        parts.push('')
      }
      parts.push('Additionally, you may reference these sources if relevant:')
      optional.forEach((sr, index) => {
        const label = sr.label ? ` (${sr.label})` : ''
        parts.push(`${index + 1}. ${sr.url}${label}`)
      })
    }

    return parts.join('\n')
  }

  /**
   * Subtle instruction style - more natural language
   */
  private buildSubtleInstruction(
    required: SourceRequirement[],
    optional: SourceRequirement[]
  ): string {
    const parts: string[] = []

    if (required.length > 0) {
      if (required.length === 1) {
        parts.push(
          `Please reference ${required[0].url} when providing information about this brand.`
        )
      } else {
        parts.push('Please reference the following sources when providing information:')
        required.forEach((sr) => {
          const label = sr.label ? ` - ${sr.label}` : ''
          parts.push(`- ${sr.url}${label}`)
        })
      }
    }

    if (optional.length > 0) {
      if (parts.length > 0) {
        parts.push('')
      }
      parts.push('You may also find these resources helpful:')
      optional.forEach((sr) => {
        const label = sr.label ? ` - ${sr.label}` : ''
        parts.push(`- ${sr.url}${label}`)
      })
    }

    return parts.join('\n')
  }

  /**
   * Minimal instruction style - brief and concise
   */
  private buildMinimalInstruction(
    required: SourceRequirement[],
    optional: SourceRequirement[]
  ): string {
    const urls: string[] = []
    
    required.forEach((sr) => urls.push(sr.url))
    optional.forEach((sr) => urls.push(sr.url))

    if (urls.length === 1) {
      return `Reference: ${urls[0]}`
    }

    return `References:\n${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}`
  }

  /**
   * Get source requirements summary
   */
  getSummary(): {
    required: number
    optional: number
    total: number
    urls: string[]
  } {
    const required = this.sourceRequirements.filter((sr) => sr.required)
    const optional = this.sourceRequirements.filter((sr) => !sr.required)

    return {
      required: required.length,
      optional: optional.length,
      total: this.sourceRequirements.length,
      urls: this.sourceRequirements.map((sr) => sr.url),
    }
  }

  /**
   * Check if a URL is in the requirements
   */
  hasUrl(url: string): boolean {
    return this.sourceRequirements.some((sr) => sr.url === url)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a source injector instance
 */
export function createSourceInjector(
  sourceRequirements: SourceRequirement[]
): SourceInjector {
  return new SourceInjector(sourceRequirements)
}

/**
 * Quick inject sources into a prompt
 */
export function injectSources(
  prompt: string,
  sourceRequirements: SourceRequirement[],
  style: 'explicit' | 'subtle' | 'minimal' = 'explicit'
): string {
  const injector = new SourceInjector(sourceRequirements)
  return injector.inject(prompt, style)
}
