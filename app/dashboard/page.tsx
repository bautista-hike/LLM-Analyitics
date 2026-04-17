"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, LabelList,
} from "recharts"
import {
  TrendingUp, TrendingDown, Minus, Trophy, MessageCircle,
  Link2, ChevronDown, ChevronUp, RefreshCw, Sparkles,
  AlertCircle, Swords, Brain, Star, Zap, Target,
} from "lucide-react"
import type { AuditResult, AnalysisResult } from "@/types"

// ─── helpers ────────────────────────────────────────────────────────────────

type ExtendedResult = AnalysisResult & {
  promptLabel?: string
  promptType?: string
  sentimentReasoning?: string
  scoreReasoning?: string
  mentionCount?: number
}

function scoreColor(s: number) {
  if (s >= 70) return "#22c55e"
  if (s >= 45) return "#f59e0b"
  return "#ef4444"
}
function scoreLabel(s: number) {
  if (s >= 80) return "Excellent"
  if (s >= 65) return "Strong"
  if (s >= 50) return "Moderate"
  if (s >= 30) return "Weak"
  return "Poor"
}
function scoreBg(s: number) {
  if (s >= 70) return "from-green-500/20 to-green-500/5 border-green-500/30"
  if (s >= 45) return "from-amber-500/20 to-amber-500/5 border-amber-500/30"
  return "from-red-500/20 to-red-500/5 border-red-500/30"
}
const typeColors: Record<string, string> = {
  informative: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  comparative: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  opinion: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  recommendation: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  custom: "bg-pink-500/10 text-pink-400 border-pink-500/30",
}
const sentimentColors: Record<string, string> = {
  positive: "text-green-400 bg-green-500/10 border-green-500/30",
  neutral: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  negative: "text-red-400 bg-red-500/10 border-red-500/30",
}
const SentimentIcon = ({ s }: { s: string }) =>
  s === "positive" ? <TrendingUp className="h-3 w-3" /> :
  s === "negative" ? <TrendingDown className="h-3 w-3" /> :
  <Minus className="h-3 w-3" />

// ─── Score Arc ───────────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const c = scoreColor(score)
  return (
    <div className="flex flex-col items-center gap-0 w-full">
      {/* Arc — overflow visible so the chart isn't clipped */}
      <div className="relative overflow-hidden" style={{ width: 200, height: 106 }}>
        <ResponsiveContainer width={200} height={200}>
          <RadialBarChart
            cx="50%" cy="100%" innerRadius="65%" outerRadius="95%"
            startAngle={180} endAngle={0} barSize={18}
            data={[{ value: score }]}
          >
            <RadialBar background={{ fill: "rgba(255,255,255,0.06)" }} dataKey="value" cornerRadius={10} fill={c} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      {/* Score lives BELOW the arc — no overlap */}
      <div className="flex flex-col items-center -mt-1">
        <span className="text-5xl font-black leading-none" style={{ color: c }}>{score}</span>
        <span className="text-xs font-semibold text-muted-foreground mt-1">{scoreLabel(score)}</span>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color = "text-primary", accent = "bg-primary/10" }: {
  label: string; value: React.ReactNode; sub?: string
  icon: React.ReactNode; color?: string; accent?: string
}) {
  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/60 hover:border-border transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`shrink-0 h-10 w-10 rounded-xl ${accent} flex items-center justify-center`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Competitor Battle Card ───────────────────────────────────────────────────

function CompetitorBattle({ results }: { results: ExtendedResult[] }) {
  // Aggregate competitor mentions across all results
  const map: Record<string, { better: number; worse: number; equal: number; total: number }> = {}
  for (const r of results) {
    for (const c of r.competitorComparison) {
      if (!map[c.competitor]) map[c.competitor] = { better: 0, worse: 0, equal: 0, total: 0 }
      map[c.competitor].total++
      if (c.comparison === "better") map[c.competitor].better++
      else if (c.comparison === "worse") map[c.competitor].worse++
      else map[c.competitor].equal++
    }
  }

  const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  if (entries.length === 0) return null

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Swords className="h-4 w-4 text-purple-400" />
          Competitive Positioning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([competitor, counts]) => {
          const winRate = counts.total > 0 ? Math.round((counts.better / counts.total) * 100) : 0
          const loseRate = counts.total > 0 ? Math.round((counts.worse / counts.total) * 100) : 0
          const eqRate = 100 - winRate - loseRate
          return (
            <div key={competitor} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{competitor}</span>
                <div className="flex gap-3 text-xs font-semibold">
                  {counts.better > 0 && (
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      {counts.better} ahead
                    </span>
                  )}
                  {counts.equal > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      {counts.equal} tied
                    </span>
                  )}
                  {counts.worse > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                      {counts.worse} behind
                    </span>
                  )}
                </div>
              </div>
              {/* stacked bar */}
              <div className="h-4 rounded-full bg-secondary/70 overflow-hidden flex">
                {winRate > 0 && (
                  <div
                    className="h-full bg-green-500 flex items-center justify-center transition-all"
                    style={{ width: `${winRate}%` }}
                  >
                    {winRate >= 15 && <span className="text-[10px] font-bold text-white">{winRate}%</span>}
                  </div>
                )}
                {eqRate > 0 && (
                  <div
                    className="h-full bg-amber-500 flex items-center justify-center transition-all"
                    style={{ width: `${eqRate}%` }}
                  >
                    {eqRate >= 15 && <span className="text-[10px] font-bold text-white">{eqRate}%</span>}
                  </div>
                )}
                {loseRate > 0 && (
                  <div
                    className="h-full bg-red-500 flex items-center justify-center transition-all"
                    style={{ width: `${loseRate}%` }}
                  >
                    {loseRate >= 15 && <span className="text-[10px] font-bold text-white">{loseRate}%</span>}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="text-green-400 font-medium">▲ Ahead {winRate}%</span>
                <span className="text-amber-400 font-medium">= Tied {eqRate}%</span>
                <span className="text-red-400 font-medium">▼ Behind {loseRate}%</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Prompt Detail Card ───────────────────────────────────────────────────────

function PromptCard({ r, index }: { r: ExtendedResult; index: number }) {
  const [open, setOpen] = useState(false)
  const sc = scoreColor(r.perceptionScore)
  const mc = (r as any).mentionCount ?? r.mentions.length

  return (
    <Card className={`border bg-gradient-to-r ${scoreBg(r.perceptionScore)} transition-all hover:shadow-md`}>
      <CardContent className="pt-4 pb-3">
        {/* Header row */}
        <button
          className="w-full text-left flex items-start gap-3"
          onClick={() => setOpen(!open)}
        >
          {/* Score pill */}
          <div className="shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-2 bg-black/20 min-w-[56px]">
            <span className="text-2xl font-black leading-none" style={{ color: sc }}>{r.perceptionScore}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">score</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${typeColors[r.promptType || "custom"]}`}>
                {r.promptType || "prompt"}
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex items-center gap-1 ${sentimentColors[r.sentiment]}`}>
                <SentimentIcon s={r.sentiment} />
                {r.sentiment}
              </Badge>
              {r.ranking && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-400 bg-amber-500/10 border-amber-500/30">
                  <Trophy className="h-2.5 w-2.5 mr-1" />#{r.ranking.position} of {r.ranking.totalItems}
                </Badge>
              )}
              {r.competitorComparison.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-purple-400 bg-purple-500/10 border-purple-500/30">
                  <Swords className="h-2.5 w-2.5 mr-1" />{r.competitorComparison.length} competitor{r.competitorComparison.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {/* Label */}
            <p className="text-sm font-semibold text-foreground leading-snug">
              {r.promptLabel || r.response.prompt}
            </p>
            {/* Meta */}
            <p className="text-[11px] text-muted-foreground mt-1">
              {mc} mention{mc !== 1 ? "s" : ""} · {r.response.metadata?.tokensUsed ?? "—"} tokens · {r.response.metadata?.responseTime ? `${r.response.metadata.responseTime}ms` : ""}
            </p>
          </div>

          <div className="shrink-0 text-muted-foreground mt-1">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {/* Expanded */}
        {open && (
          <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
            {/* Reasonings */}
            {(r.sentimentReasoning || r.scoreReasoning) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {r.sentimentReasoning && (
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Sentiment Reasoning</p>
                    <p className="text-xs text-foreground/80">{r.sentimentReasoning}</p>
                  </div>
                )}
                {r.scoreReasoning && (
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Score Reasoning</p>
                    <p className="text-xs text-foreground/80">{r.scoreReasoning}</p>
                  </div>
                )}
              </div>
            )}

            {/* Prompt */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Prompt Sent</p>
              <p className="text-xs bg-black/30 border border-white/10 rounded-lg p-3 text-foreground/80 italic">"{r.response.prompt}"</p>
            </div>

            {/* LLM Response */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Gemini Response</p>
              <div className="text-sm bg-black/20 border border-white/10 rounded-lg p-4 text-foreground/90 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {r.response.response}
              </div>
            </div>

            {/* Ranking */}
            {r.ranking && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Ranking Detected</p>
                <p className="text-sm font-bold text-amber-400">#{r.ranking.position} of {r.ranking.totalItems} · <span className="font-normal text-xs text-muted-foreground">{r.ranking.context}</span></p>
                {r.ranking.entryText && <p className="text-xs text-muted-foreground mt-1 font-mono">"{r.ranking.entryText}"</p>}
              </div>
            )}

            {/* Competitor comparisons */}
            {r.competitorComparison.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">vs Competitors</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {r.competitorComparison.map((c) => (
                    <div key={c.competitor} className={`rounded-lg border p-2.5 text-xs ${
                      c.comparison === "better" ? "bg-green-500/10 border-green-500/30" :
                      c.comparison === "worse" ? "bg-red-500/10 border-red-500/30" :
                      "bg-secondary/50 border-border/50"
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                        <span className={
                          c.comparison === "better" ? "text-green-400" :
                          c.comparison === "worse" ? "text-red-400" : "text-amber-400"
                        }>
                          {c.comparison === "better" ? "▲ Better" : c.comparison === "worse" ? "▼ Worse" : "= Equal"}
                        </span>
                        <span className="text-muted-foreground font-normal">vs {c.competitor}</span>
                      </div>
                      <p className="text-muted-foreground">{c.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Compliance */}
            {r.sourceCompliance.required.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Source Compliance — {r.sourceCompliance.compliancePercentage}%
                </p>
                <div className="space-y-1">
                  {r.sourceCompliance.required.map((url) => {
                    const cited = r.sourceCompliance.mentioned.includes(url)
                    return (
                      <div key={url} className={`flex items-center gap-2 text-xs rounded-md px-2.5 py-1.5 border ${cited ? "text-green-400 bg-green-500/5 border-green-500/20" : "text-red-400 bg-red-500/5 border-red-500/20"}`}>
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${cited ? "bg-green-500" : "bg-red-400"}`} />
                        <span className="truncate">{url}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [history, setHistory] = useState<AuditResult[]>([])
  const [historyIdx, setHistoryIdx] = useState(0)

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("auditHistory") || "[]") as AuditResult[]
    setHistory(h)
    if (h.length > 0) setAuditResult(h[0])
  }, [])

  if (!auditResult) {
    return (
      <SidebarLayout title="Dashboard" description="Brand perception analysis">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No audit results yet</h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Run your first audit to see how AI models perceive your brand and get actionable insights.
          </p>
          <Button onClick={() => router.push("/audits")} className="gap-2 mt-2">
            <Sparkles className="h-4 w-4" />
            Run first audit
          </Button>
        </div>
      </SidebarLayout>
    )
  }

  const { brandContext, overallMetrics, results } = auditResult
  const rs = results as ExtendedResult[]

  const sentimentData = [
    { name: "Positive", value: rs.filter(r => r.sentiment === "positive").length, fill: "#22c55e" },
    { name: "Neutral",  value: rs.filter(r => r.sentiment === "neutral").length,  fill: "#f59e0b" },
    { name: "Negative", value: rs.filter(r => r.sentiment === "negative").length, fill: "#ef4444" },
  ].filter(d => d.value > 0)

  const barData = rs.map((r, i) => ({
    name: (r.promptLabel ?? `P${i+1}`).slice(0, 22) + ((r.promptLabel?.length ?? 0) > 22 ? "…" : ""),
    score: r.perceptionScore,
    fill: scoreColor(r.perceptionScore),
  }))

  // Radar per prompt type
  const typeMap: Record<string, number[]> = {}
  for (const r of rs) {
    const t = r.promptType || "custom"
    if (!typeMap[t]) typeMap[t] = []
    typeMap[t].push(r.perceptionScore)
  }
  const radarData = Object.entries(typeMap).map(([type, scores]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }))

  const allConcepts = Array.from(new Set(rs.flatMap(r => r.keyConcepts))).slice(0, 24)
  const hasRankings = rs.some(r => r.ranking)
  const avgRank = overallMetrics.averageRankingPosition
  const topResult = rs.reduce((a, b) => a.perceptionScore > b.perceptionScore ? a : b, rs[0])

  return (
    <SidebarLayout title="Dashboard" description="Brand perception analysis">
      <div className="p-6 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" /> Gemini 2.5 Flash
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(auditResult.completedAt || auditResult.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground">{brandContext.companyName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {brandContext.industry} · {brandContext.region} · {rs.length} prompts analyzed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 1 && (
              <select
                className="text-xs bg-secondary/60 border border-border/50 rounded-lg px-3 py-2"
                value={historyIdx}
                onChange={e => {
                  const i = Number(e.target.value)
                  setHistoryIdx(i)
                  setAuditResult(history[i])
                }}
              >
                {history.map((a, i) => (
                  <option key={a.id} value={i}>
                    {new Date(a.createdAt).toLocaleDateString()} — {a.brandContext.companyName}
                  </option>
                ))}
              </select>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push("/audits")} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> New Audit
            </Button>
          </div>
        </div>

        {/* ── KPI row ─────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Avg. Perception Score"
            value={overallMetrics.averagePerceptionScore}
            sub={scoreLabel(overallMetrics.averagePerceptionScore)}
            icon={<Target className="h-5 w-5 text-primary" />}
            color={`font-black`}
            accent="bg-primary/10"
          />
          <StatCard
            label="Brand Mentions"
            value={overallMetrics.totalMentions}
            sub={`across ${rs.length} prompts`}
            icon={<MessageCircle className="h-5 w-5 text-blue-400" />}
            color="text-blue-400"
            accent="bg-blue-500/10"
          />
          <StatCard
            label="Best Score"
            value={overallMetrics.bestPerceptionScore}
            sub={topResult.promptLabel?.slice(0, 28) ?? "—"}
            icon={<Star className="h-5 w-5 text-amber-400" />}
            color="text-amber-400"
            accent="bg-amber-500/10"
          />
          <StatCard
            label="Avg. Ranking"
            value={hasRankings ? `#${avgRank}` : "N/A"}
            sub={hasRankings ? "in detected rankings" : "no rankings found"}
            icon={<Trophy className="h-5 w-5 text-emerald-400" />}
            color="text-emerald-400"
            accent="bg-emerald-500/10"
          />
        </div>

        {/* ── Score + Bar chart ────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Overall Perception
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <ScoreArc score={overallMetrics.averagePerceptionScore} />
              <div className="w-full grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Best</p>
                  <p className="text-lg font-black text-green-400">{overallMetrics.bestPerceptionScore}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Avg</p>
                  <p className="text-lg font-black" style={{ color: scoreColor(overallMetrics.averagePerceptionScore) }}>{overallMetrics.averagePerceptionScore}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Worst</p>
                  <p className="text-lg font-black" style={{ color: scoreColor(overallMetrics.worstPerceptionScore) }}>{overallMetrics.worstPerceptionScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/60 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Score by Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 24, right: 8, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} width={28} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [v, "Score"]}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="score"
                      position="top"
                      style={{ fontSize: 11, fontWeight: 700, fill: "#e2e8f0" }}
                    />
                    {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Sentiment + Competitive + Radar ─────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sentiment */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Sentiment Split</CardTitle>
            </CardHeader>
            <CardContent>
              {sentimentData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="value" paddingAngle={3}>
                        {sentimentData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {sentimentData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Competitive positioning */}
          <CompetitorBattle results={rs} />

          {/* Radar by type */}
          {radarData.length >= 3 ? (
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Score by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
                    <PolarAngleAxis
                      dataKey="type"
                      tick={{ fontSize: 11, fill: "#e2e8f0", fontWeight: 600 }}
                    />
                    <Radar
                      dataKey="score"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.3}
                      dot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
                    />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v: number) => [v, "Score"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Key Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allConcepts.map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                  {allConcepts.length === 0 && <p className="text-sm text-muted-foreground">No concepts detected</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Key Concepts (when radar is shown) ──────────────────────── */}
        {radarData.length >= 3 && allConcepts.length > 0 && (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Key Concepts Detected by Gemini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allConcepts.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Prompt Results ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-foreground">Prompt Analysis</h2>
            <Badge variant="outline" className="text-xs">{rs.length} prompts</Badge>
          </div>
          <div className="space-y-3">
            {rs.map((r, i) => <PromptCard key={r.id} r={r} index={i} />)}
          </div>
        </div>

      </div>
    </SidebarLayout>
  )
}
