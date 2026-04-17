import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '@/lib/supabase'
import type {
  BrandContext,
  AuditConfig,
  AuditResult,
  AnalysisResult,
  LLMResponse,
  SourceCompliance,
  CompetitorComparison,
  RankingInfo,
  Mention,
} from '@/types'

// gemini-2.5-flash: fast, supports JSON mode + large context
const GEMINI_MODEL = 'gemini-2.5-flash'

// ============================================================================
// Structured JSON schema the LLM must return
// ============================================================================

interface LLMStructuredResponse {
  /** Natural language answer — what a real user would read */
  natural_response: string

  analysis: {
    brand_mentioned: boolean
    mention_count: number
    sentiment: 'positive' | 'neutral' | 'negative'
    sentiment_reasoning: string

    ranking: {
      found: boolean
      position: number | null
      total_items: number | null
      context: string | null
      entry_text: string | null
    }

    sources_cited: string[]
    key_concepts: string[]

    competitor_mentions: Array<{
      competitor: string
      comparison: 'better' | 'worse' | 'equal' | 'not_compared'
      context: string
    }>

    /**
     * 0–30: brand absent or negative
     * 31–50: weak presence
     * 51–70: neutral / average
     * 71–85: positive, recommended
     * 86–100: top of rankings, strongly praised
     */
    perception_score: number
    score_reasoning: string
  }
}

// ============================================================================
// System prompt
// ============================================================================

function buildSystemPrompt(
  brand: BrandContext,
  requiredUrls: string[],
  competitors: string[]
): string {
  const sourceSection =
    requiredUrls.length > 0
      ? `\n\nSOURCE TRACKING: After answering, check if you cited any of these URLs:\n${requiredUrls.map((u) => `- ${u}`).join('\n')}`
      : ''

  const competitorSection =
    competitors.length > 0
      ? `\n\nCOMPETITOR TRACKING: Note any comparisons you make with: ${competitors.join(', ')}.`
      : ''

  return `You are an AI brand perception analyst. Your job is twofold:
1. Answer the user's question naturally and helpfully — as if you were a knowledgeable assistant.
2. Analyze your own response from a brand analytics perspective and return both together as JSON.

BRAND CONTEXT:
- Brand name: ${brand.companyName}
- Industry: ${brand.industry}
- Region: ${brand.region}
- Description: ${brand.description}
- Keywords: ${brand.keywords?.join(', ') || 'N/A'}
${sourceSection}
${competitorSection}

You MUST respond with a single valid JSON object matching this exact structure — no markdown, no code fences, pure JSON:

{
  "natural_response": "<your full, natural answer to the user's question>",
  "analysis": {
    "brand_mentioned": <true|false>,
    "mention_count": <integer>,
    "sentiment": "<positive|neutral|negative>",
    "sentiment_reasoning": "<one sentence explaining sentiment>",
    "ranking": {
      "found": <true|false>,
      "position": <integer or null>,
      "total_items": <integer or null>,
      "context": "<string describing the ranking context, or null>",
      "entry_text": "<exact text of the brand's list entry, or null>"
    },
    "sources_cited": ["<only URLs from the provided list that you actually referenced>"],
    "key_concepts": ["<up to 8 key concepts, technologies, or themes from the response>"],
    "competitor_mentions": [
      {
        "competitor": "<name>",
        "comparison": "<better|worse|equal|not_compared>",
        "context": "<one sentence>"
      }
    ],
    "perception_score": <integer 0-100>,
    "score_reasoning": "<one sentence explaining the score>"
  }
}

RULES:
- natural_response must be a genuinely helpful answer, not a summary of the analysis.
- The analysis must reflect what you actually wrote in natural_response.
- Only list competitors in competitor_mentions if they appear in your natural_response.
- Only list URLs in sources_cited if you actually referenced them.
- If the brand is not mentioned in natural_response, set brand_mentioned: false and perception_score ≤ 30.
- Respond ONLY with the JSON object. No extra text outside the JSON.`
}

// ============================================================================
// Prompt question builder
// ============================================================================

function buildAuditPrompts(
  brand: BrandContext,
  config: AuditConfig
): Array<{ question: string; label: string; type: string }> {
  const prompts: Array<{ question: string; label: string; type: string }> = []

  const competitorList =
    config.competitors?.length > 0
      ? config.competitors.join(', ')
      : 'its main competitors in the market'

  const hasCompetitors = config.competitors?.length > 0

  // ── INFORMATIVE ──────────────────────────────────────────────────────────
  if (!config.promptTypes || config.promptTypes.includes('informative')) {
    prompts.push({
      question: `What is ${brand.companyName} and what does it do in the ${brand.industry} industry? Provide a comprehensive overview of its products, services, value proposition, and market position in ${brand.region}.`,
      label: `What is ${brand.companyName}?`,
      type: 'informative',
    })
    prompts.push({
      question: `Describe ${brand.companyName}'s reputation and track record in the ${brand.industry} space in ${brand.region}. What are they most recognized for? What do customers and industry analysts say about them?`,
      label: `${brand.companyName} reputation & track record`,
      type: 'informative',
    })
    prompts.push({
      question: `Who are the key players and market leaders in the ${brand.industry} sector in ${brand.region}? Where does ${brand.companyName} stand among them? Is it well known in this space?`,
      label: `Market leadership in ${brand.industry}`,
      type: 'informative',
    })
  }

  // ── COMPARATIVE ───────────────────────────────────────────────────────────
  if (!config.promptTypes || config.promptTypes.includes('comparative')) {
    prompts.push({
      question: `Compare ${brand.companyName} with ${competitorList} in the ${brand.industry} market in ${brand.region}. Cover: key features, pricing, ease of use, compliance capabilities, customer support, and market presence. Who is best suited for which use case?`,
      label: `${brand.companyName} vs ${config.competitors?.slice(0, 2).join(' & ') ?? 'competitors'}`,
      type: 'comparative',
    })
    if (hasCompetitors) {
      prompts.push({
        question: `What are the main strengths and weaknesses of ${brand.companyName} compared to ${competitorList}? In what scenarios would a company choose ${brand.companyName} over its competitors, and vice versa?`,
        label: `Strengths & weaknesses vs competition`,
        type: 'comparative',
      })
    }
  }

  // ── RECOMMENDATION ────────────────────────────────────────────────────────
  if (!config.promptTypes || config.promptTypes.includes('recommendation')) {
    prompts.push({
      question: `A company in ${brand.region} needs a ${brand.industry} solution. Considering options like ${brand.companyName}${hasCompetitors ? `, ${competitorList}` : ''} and any other relevant providers, which would you recommend and why? Please provide a ranked list with justification.`,
      label: `Best ${brand.industry} solution — ranked`,
      type: 'recommendation',
    })
  }

  // ── OPINION ───────────────────────────────────────────────────────────────
  if (!config.promptTypes || config.promptTypes.includes('opinion')) {
    prompts.push({
      question: `What is the general market sentiment around ${brand.companyName}? What are its most praised features according to users and experts? What are the most commonly mentioned pain points or limitations?`,
      label: `Market sentiment on ${brand.companyName}`,
      type: 'opinion',
    })
  }

  // ── CUSTOM ────────────────────────────────────────────────────────────────
  if (config.customPrompts?.length) {
    for (const custom of config.customPrompts) {
      const text = custom.text
        .replace(/{brand}/gi, brand.companyName)
        .replace(/{industry}/gi, brand.industry)
        .replace(/{region}/gi, brand.region)
        .replace(/{competitors}/gi, competitorList)

      prompts.push({
        question: text,
        label: `Custom: ${text.slice(0, 50)}${text.length > 50 ? '…' : ''}`,
        type: 'custom',
      })
    }
  }

  return prompts
}

// ============================================================================
// Map parsed JSON → AnalysisResult
// ============================================================================

function mapToAnalysisResult(
  parsed: LLMStructuredResponse,
  promptQuestion: string,
  promptLabel: string,
  promptType: string,
  requiredUrls: string[],
  responseTime: number,
  tokensUsed: number | undefined
): AnalysisResult & Record<string, unknown> {
  const { natural_response, analysis } = parsed

  const mentions: Mention[] = analysis.brand_mentioned
    ? [
        {
          text: natural_response,
          context: natural_response.slice(0, 200),
          position: 0,
          sentiment: analysis.sentiment,
          type: 'direct',
        },
      ]
    : []

  const mentioned = analysis.sources_cited || []
  const missing = requiredUrls.filter((u) => !mentioned.includes(u))
  const sourceCompliance: SourceCompliance = {
    required: requiredUrls,
    mentioned,
    missing,
    compliancePercentage:
      requiredUrls.length > 0 ? Math.round((mentioned.length / requiredUrls.length) * 100) : 100,
  }

  let ranking: RankingInfo | undefined
  if (analysis.ranking.found && analysis.ranking.position != null) {
    ranking = {
      position: analysis.ranking.position,
      totalItems: analysis.ranking.total_items ?? 0,
      context: analysis.ranking.context ?? '',
      entryText: analysis.ranking.entry_text ?? '',
    }
  }

  const competitorComparison: CompetitorComparison[] = (analysis.competitor_mentions || []).map(
    (cm) => ({
      competitor: cm.competitor,
      comparison: cm.comparison === 'not_compared' ? 'not-compared' : cm.comparison,
      context: cm.context,
    })
  )

  const llmResponse: LLMResponse = {
    model: 'gemini-pro',
    prompt: promptQuestion,
    response: natural_response,
    timestamp: new Date(),
    metadata: { tokensUsed, responseTime, modelVersion: GEMINI_MODEL },
  }

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    response: llmResponse,
    perceptionScore: Math.max(0, Math.min(100, analysis.perception_score)),
    ranking,
    mentions,
    sourceCompliance,
    sentiment: analysis.sentiment,
    keyConcepts: analysis.key_concepts || [],
    competitorComparison,
    analyzedAt: new Date(),
    // Extra display fields
    promptLabel,
    promptType,
    sentimentReasoning: analysis.sentiment_reasoning,
    scoreReasoning: analysis.score_reasoning,
    mentionCount: analysis.mention_count,
  }
}

// ============================================================================
// JSON extractor — handles Gemini 2.5 thinking mode
// ============================================================================

/**
 * Gemini 2.5 Flash (thinking mode) sometimes prepends internal reasoning text
 * before the actual JSON output, even when responseMimeType='application/json'.
 * This function finds the first complete top-level JSON object in the string.
 */
function extractJson(text: string): string {
  // Fast path: already valid JSON
  const trimmed = text.trim()
  if (trimmed.startsWith('{')) return trimmed

  // Find first '{' and match to its closing '}'
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in response')

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  throw new Error('Unbalanced JSON object in response')
}

// ============================================================================
// Main API handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { brandContext, auditConfig }: { brandContext: BrandContext; auditConfig: AuditConfig } =
      await request.json()

    // Priority: header from browser → env var (requires server restart) → MVP dev fallback
    const apiKey =
      request.headers.get('x-gemini-key')?.trim() ||
      process.env.GEMINI_API_KEY ||
      ''
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_API_KEY',
            message: 'Gemini API key is required. Get one free at aistudio.google.com',
          },
        },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompts = buildAuditPrompts(brandContext, auditConfig)
    if (prompts.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PROMPTS', message: 'No prompts were generated' } },
        { status: 400 }
      )
    }

    const requiredUrls = brandContext.sourceUrls || []
    const competitors = auditConfig.competitors || []
    const systemPrompt = buildSystemPrompt(brandContext, requiredUrls, competitors)

    const analysisResults: (AnalysisResult & Record<string, unknown>)[] = []
    let lastError: string | null = null

    for (const prompt of prompts) {
      try {
        const startTime = Date.now()

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt.question,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
            maxOutputTokens: 3000,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 }, // Disable thinking mode → clean JSON output
          },
        })

        const responseTime = Date.now() - startTime
        const rawText = response.text ?? ''
        const tokensUsed = response.usageMetadata?.totalTokenCount

        // Gemini 2.5 Flash has "thinking" mode that may prepend reasoning text
        // before the JSON. We extract the first complete JSON object from the output.
        let parsed: LLMStructuredResponse
        try {
          // First try direct parse (clean JSON mode response)
          const jsonText = extractJson(rawText)
          parsed = JSON.parse(jsonText) as LLMStructuredResponse
        } catch {
          console.error(`JSON parse error for prompt "${prompt.label}":`, rawText.slice(0, 300))
          lastError = `JSON parse failed for prompt "${prompt.label}"`
          continue
        }

        if (!parsed.natural_response || !parsed.analysis) {
          console.error(`Invalid response shape for prompt "${prompt.label}"`)
          lastError = `Invalid response shape for prompt "${prompt.label}"`
          continue
        }

        const result = mapToAnalysisResult(
          parsed,
          prompt.question,
          prompt.label,
          prompt.type,
          requiredUrls,
          responseTime,
          tokensUsed
        )

        analysisResults.push(result)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`Error running prompt "${prompt.label}":`, msg)
        lastError = msg
      }
    }

    if (analysisResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALL_FAILED',
            message: lastError
              ? `All prompts failed. Last error: ${lastError}`
              : 'All prompts failed to execute',
          },
        },
        { status: 500 }
      )
    }

    const scores = analysisResults.map((r) => r.perceptionScore)
    const complianceValues = analysisResults.map((r) => r.sourceCompliance.compliancePercentage)
    const rankingPositions = analysisResults
      .filter((r) => r.ranking)
      .map((r) => r.ranking!.position)

    const auditResult: AuditResult = {
      id: `audit-${Date.now()}`,
      brandContext,
      auditConfig,
      results: analysisResults as AnalysisResult[],
      overallMetrics: {
        averagePerceptionScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        bestPerceptionScore: Math.max(...scores),
        worstPerceptionScore: Math.min(...scores),
        averageRankingPosition:
          rankingPositions.length > 0
            ? Math.round(rankingPositions.reduce((a, b) => a + b, 0) / rankingPositions.length)
            : undefined,
        totalMentions: analysisResults.reduce(
          (sum, r) => sum + ((r.mentionCount as number) ?? r.mentions.length),
          0
        ),
        averageSourceCompliance: Math.round(
          complianceValues.reduce((a, b) => a + b, 0) / complianceValues.length
        ),
      },
      createdAt: new Date(),
      completedAt: new Date(),
      status: 'completed',
    }

    // ── Persist to Supabase ──────────────────────────────────────────────────
    try {
      // 1. Insert the parent audit row
      const { error: auditError } = await supabase.from('audits').insert({
        id: auditResult.id,
        brand_name: brandContext.companyName,
        brand_context: brandContext as unknown as Record<string, unknown>,
        audit_config: auditConfig as unknown as Record<string, unknown>,
        overall_metrics: auditResult.overallMetrics as unknown as Record<string, unknown>,
        status: 'completed',
        created_at: auditResult.createdAt.toISOString(),
        completed_at: auditResult.completedAt?.toISOString() ?? null,
      })
      if (auditError) throw auditError

      // 2. Insert each prompt result as a child row
      const resultRows = analysisResults.map((r) => ({
        id: r.id,
        audit_id: auditResult.id,
        prompt_label: (r as any).promptLabel ?? null,
        prompt_type: (r as any).promptType ?? null,
        perception_score: r.perceptionScore,
        sentiment: r.sentiment,
        response: r.response as unknown as Record<string, unknown>,
        mentions: r.mentions as unknown,
        ranking: r.ranking ?? null,
        source_compliance: r.sourceCompliance as unknown,
        competitor_comparison: r.competitorComparison as unknown,
        key_concepts: r.keyConcepts,
        sentiment_reasoning: (r as any).sentimentReasoning ?? null,
        score_reasoning: (r as any).scoreReasoning ?? null,
        mention_count: (r as any).mentionCount ?? r.mentions.length,
        analyzed_at: (r.analyzedAt instanceof Date ? r.analyzedAt : new Date()).toISOString(),
      }))

      const { error: resultsError } = await supabase.from('audit_results').insert(resultRows)
      if (resultsError) throw resultsError

      console.log(`✅ Audit ${auditResult.id} saved to Supabase`)
    } catch (dbErr) {
      // DB error is non-fatal — audit result still returned to client
      console.error('Supabase save error (non-fatal):', dbErr instanceof Error ? dbErr.message : dbErr)
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, data: auditResult })
  } catch (error) {
    console.error('Audit run error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    )
  }
}
