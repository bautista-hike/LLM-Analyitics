import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AuditResult } from '@/types'

// GET /api/audits — returns audit history from Supabase
export async function GET() {
  try {
    const { data: audits, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    if (!audits || audits.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Fetch all results for these audits in one query
    const auditIds = audits.map((a) => a.id)
    const { data: results, error: resultsError } = await supabase
      .from('audit_results')
      .select('*')
      .in('audit_id', auditIds)
      .order('analyzed_at', { ascending: true })

    if (resultsError) throw resultsError

    // Reconstruct AuditResult objects
    const auditResults: AuditResult[] = audits.map((audit) => {
      const auditPromptResults = (results ?? [])
        .filter((r) => r.audit_id === audit.id)
        .map((r) => ({
          id: r.id,
          response: r.response,
          perceptionScore: r.perception_score,
          sentiment: r.sentiment,
          mentions: r.mentions ?? [],
          ranking: r.ranking ?? null,
          sourceCompliance: r.source_compliance ?? {
            required: [],
            mentioned: [],
            missing: [],
            compliancePercentage: 100,
          },
          competitorComparison: r.competitor_comparison ?? [],
          keyConcepts: r.key_concepts ?? [],
          analyzedAt: new Date(r.analyzed_at),
          // extra display fields
          promptLabel: r.prompt_label,
          promptType: r.prompt_type,
          sentimentReasoning: r.sentiment_reasoning,
          scoreReasoning: r.score_reasoning,
          mentionCount: r.mention_count,
        }))

      return {
        id: audit.id,
        brandContext: audit.brand_context,
        auditConfig: audit.audit_config,
        results: auditPromptResults,
        overallMetrics: audit.overall_metrics,
        createdAt: new Date(audit.created_at),
        completedAt: audit.completed_at ? new Date(audit.completed_at) : undefined,
        status: audit.status,
      } as AuditResult
    })

    return NextResponse.json({ success: true, data: auditResults })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('GET /api/audits error:', msg)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: msg } },
      { status: 500 }
    )
  }
}
