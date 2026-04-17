import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton client — works in both browser and Next.js server components/routes
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── DB row types ─────────────────────────────────────────────────────────────

export type AuditRow = {
  id: string
  brand_name: string
  brand_context: Record<string, unknown>
  audit_config: Record<string, unknown>
  overall_metrics: Record<string, unknown>
  status: string
  created_at: string
  completed_at: string | null
}

export type AuditResultRow = {
  id: string
  audit_id: string
  prompt_label: string | null
  prompt_type: string | null
  perception_score: number
  sentiment: string
  response: Record<string, unknown>
  mentions: unknown
  ranking: unknown
  source_compliance: unknown
  competitor_comparison: unknown
  key_concepts: string[]
  sentiment_reasoning: string | null
  score_reasoning: string | null
  mention_count: number | null
  analyzed_at: string
}
