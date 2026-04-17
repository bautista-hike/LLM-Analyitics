/**
 * ResponseParser - Analiza respuestas de LLMs y extrae insights
 */

import type { AnalysisResult, Mention, RankingInfo, SourceCompliance, CompetitorComparison } from '@/types'
import type { LLMResponse } from '@/types'

// ============================================================================
// Mention Extraction
// ============================================================================

export function extractMentions(response: string, brandName: string): Mention[] {
  const mentions: Mention[] = []
  const lowerResponse = response.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  let searchFrom = 0
  while (true) {
    const idx = lowerResponse.indexOf(lowerBrand, searchFrom)
    if (idx === -1) break

    const contextStart = Math.max(0, idx - 100)
    const contextEnd = Math.min(response.length, idx + lowerBrand.length + 100)
    const context = response.slice(contextStart, contextEnd)

    // Determine sentiment of context
    const sentiment = analyzeSentiment(context)

    mentions.push({
      text: response.slice(idx, idx + brandName.length),
      context,
      position: idx,
      sentiment,
      type: 'direct',
    })

    searchFrom = idx + 1
  }

  return mentions
}

// ============================================================================
// Ranking Analysis
// ============================================================================

export function extractRanking(response: string, brandName: string): RankingInfo | undefined {
  const lowerResponse = response.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  // Look for numbered lists (1. Brand, 2. Brand, etc.)
  const numberedListRegex = /(\d+)[.)]\s+([^\n]+)/gi
  const listItems: { position: number; text: string }[] = []
  let match

  const responseForSearch = response
  const tempRegex = /(\d+)[.)]\s+([^\n]+)/gi
  while ((match = tempRegex.exec(responseForSearch)) !== null) {
    listItems.push({
      position: parseInt(match[1]),
      text: match[2].trim(),
    })
  }

  // Find brand in list items
  for (const item of listItems) {
    if (item.text.toLowerCase().includes(lowerBrand)) {
      const contextStart = Math.max(0, listItems.findIndex(i => i === item) - 2)
      const contextItems = listItems.slice(contextStart, contextStart + 6)
      return {
        position: item.position,
        totalItems: listItems.length,
        context: contextItems.map(i => `${i.position}. ${i.text}`).join('\n'),
        entryText: item.text,
      }
    }
  }

  // Look for "first", "top" mentions
  const topMentionRegex = /(first|#1|number one|top pick|best|leading|primary|top choice)/i
  const brandIdx = lowerResponse.indexOf(lowerBrand)
  if (brandIdx !== -1) {
    const nearContext = lowerResponse.slice(Math.max(0, brandIdx - 50), brandIdx + 50)
    if (topMentionRegex.test(nearContext)) {
      return {
        position: 1,
        totalItems: 1,
        context: response.slice(Math.max(0, brandIdx - 100), brandIdx + 100),
        entryText: response.slice(brandIdx, brandIdx + brandName.length + 50),
      }
    }
  }

  return undefined
}

// ============================================================================
// Source Compliance
// ============================================================================

export function checkSourceCompliance(response: string, requiredUrls: string[]): SourceCompliance {
  if (!requiredUrls || requiredUrls.length === 0) {
    return { required: [], mentioned: [], missing: [], compliancePercentage: 100 }
  }

  const mentioned: string[] = []
  const missing: string[] = []

  for (const url of requiredUrls) {
    // Check for exact URL or domain mention
    const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
    if (response.includes(url) || response.includes(domain)) {
      mentioned.push(url)
    } else {
      missing.push(url)
    }
  }

  return {
    required: requiredUrls,
    mentioned,
    missing,
    compliancePercentage: requiredUrls.length > 0
      ? Math.round((mentioned.length / requiredUrls.length) * 100)
      : 100,
  }
}

// ============================================================================
// Competitor Comparison
// ============================================================================

export function extractCompetitorComparisons(
  response: string,
  brandName: string,
  competitors: string[]
): CompetitorComparison[] {
  const comparisons: CompetitorComparison[] = []
  const lowerResponse = response.toLowerCase()

  for (const competitor of competitors) {
    const lowerComp = competitor.toLowerCase()
    const compIdx = lowerResponse.indexOf(lowerComp)
    if (compIdx === -1) continue

    const contextStart = Math.max(0, compIdx - 150)
    const contextEnd = Math.min(response.length, compIdx + 150)
    const context = response.slice(contextStart, contextEnd)

    // Determine comparison result
    let comparison: 'better' | 'worse' | 'equal' | 'not-compared' = 'not-compared'

    const betterWords = ['better', 'superior', 'preferred', 'recommend', 'best', 'advantage', 'outperforms', 'ahead']
    const worseWords = ['worse', 'inferior', 'lacking', 'behind', 'weaker', 'disadvantage', 'falls short']
    const equalWords = ['similar', 'comparable', 'equal', 'same', 'equivalent', 'both']

    const lowerCtx = context.toLowerCase()
    if (betterWords.some(w => lowerCtx.includes(w))) comparison = 'better'
    else if (worseWords.some(w => lowerCtx.includes(w))) comparison = 'worse'
    else if (equalWords.some(w => lowerCtx.includes(w))) comparison = 'equal'
    else comparison = 'not-compared'

    comparisons.push({ competitor, comparison, context })
  }

  return comparisons
}

// ============================================================================
// Sentiment Analysis
// ============================================================================

export function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    'excellent', 'great', 'outstanding', 'best', 'leading', 'innovative',
    'reliable', 'trusted', 'top', 'popular', 'recommended', 'exceptional',
    'impressive', 'powerful', 'effective', 'efficient', 'advanced', 'strong',
    'superior', 'notable', 'remarkable', 'successful', 'well-known', 'popular',
    'good', 'quality', 'solid', 'robust', 'versatile', 'comprehensive'
  ]

  const negativeWords = [
    'poor', 'bad', 'worse', 'worst', 'terrible', 'disappointing', 'lacking',
    'limited', 'expensive', 'overpriced', 'difficult', 'complex', 'problematic',
    'unreliable', 'complaint', 'issue', 'concern', 'inferior', 'weak', 'failure',
    'avoid', 'not recommended', 'mediocre', 'behind', 'outdated'
  ]

  let positiveCount = 0
  let negativeCount = 0

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++
  }

  if (positiveCount > negativeCount + 1) return 'positive'
  if (negativeCount > positiveCount + 1) return 'negative'
  return 'neutral'
}

// ============================================================================
// Key Concepts Extraction
// ============================================================================

export function extractKeyConcepts(response: string): string[] {
  // Extract capitalized phrases and important terms
  const conceptPatterns = [
    /\b([A-Z][a-z]+ (?:[A-Z][a-z]+ )?(?:Platform|Tool|Solution|Service|Software|System|API|Framework))\b/g,
    /\b((?:machine learning|artificial intelligence|AI|ML|SaaS|API|cloud|automation|analytics|integration|deployment|scalability|enterprise|open.source))\b/gi,
  ]

  const concepts = new Set<string>()
  for (const pattern of conceptPatterns) {
    let match
    const re = new RegExp(pattern.source, pattern.flags)
    while ((match = re.exec(response)) !== null) {
      if (match[1] && match[1].length > 3) {
        concepts.add(match[1].trim())
      }
    }
  }

  return Array.from(concepts).slice(0, 10)
}

// ============================================================================
// Perception Score
// ============================================================================

export function calculatePerceptionScore(params: {
  mentionCount: number
  sentiment: 'positive' | 'neutral' | 'negative'
  ranking?: RankingInfo
  sourceCompliance: SourceCompliance
  hasCompetitors: boolean
}): number {
  let score = 50 // Base score

  // Mention bonus (up to 20 points)
  score += Math.min(params.mentionCount * 5, 20)

  // Sentiment (up to ±20 points)
  if (params.sentiment === 'positive') score += 20
  else if (params.sentiment === 'negative') score -= 20

  // Ranking bonus (up to 15 points)
  if (params.ranking) {
    const rankScore = Math.max(0, 15 - (params.ranking.position - 1) * 3)
    score += rankScore
  }

  // Source compliance (up to 10 points)
  score += Math.round(params.sourceCompliance.compliancePercentage / 10)

  // Penalize if not mentioned at all
  if (params.mentionCount === 0) score -= 30

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// Main Analysis Function
// ============================================================================

export function analyzeResponse(
  llmResponse: LLMResponse,
  brandName: string,
  requiredUrls: string[],
  competitors: string[]
): AnalysisResult {
  const { response } = llmResponse

  const mentions = extractMentions(response, brandName)
  const ranking = extractRanking(response, brandName)
  const sourceCompliance = checkSourceCompliance(response, requiredUrls)
  const competitorComparison = extractCompetitorComparisons(response, brandName, competitors)
  const keyConcepts = extractKeyConcepts(response)
  const sentiment = analyzeSentiment(response)

  const perceptionScore = calculatePerceptionScore({
    mentionCount: mentions.length,
    sentiment,
    ranking,
    sourceCompliance,
    hasCompetitors: competitors.length > 0,
  })

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    response: llmResponse,
    perceptionScore,
    ranking,
    mentions,
    sourceCompliance,
    sentiment,
    keyConcepts,
    competitorComparison,
    analyzedAt: new Date(),
  }
}
