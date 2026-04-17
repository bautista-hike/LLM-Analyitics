import type { BrandContext } from '@/types'

/**
 * Default brand context — pre-loaded when no sessionStorage data exists.
 * Edit this to change the default brand for testing.
 */
export const DEFAULT_BRAND_CONTEXT: BrandContext = {
  companyName: 'Verifarma',
  website: 'https://www.verifarma.com/',
  industry: 'SaaS',
  region: 'Argentina',
  description:
    'Impulsamos la trazabilidad farmacéutica a nivel global. En Verifarma desarrollamos soluciones tecnológicas que ayudan a laboratorios, distribuidores y autoridades sanitarias a cumplir regulaciones, garantizar la trazabilidad y proteger al paciente en cada mercado.',
  keywords: ['trazabilidad', 'farmacéutica', 'SaaS', 'regulaciones sanitarias', 'software'],
  sourceUrls: ['https://www.verifarma.com/'],
  preferredCitations: ['https://www.verifarma.com/'],
}

/**
 * Default competitors for the audit
 */
export const DEFAULT_COMPETITORS = ['Zafiro Farmacias', 'WinFarma']
