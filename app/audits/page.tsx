"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { DEFAULT_BRAND_CONTEXT } from "@/lib/defaults"
import type { BrandContext, PromptType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Target, Globe2, Zap, ArrowRight, Play,
  Plus, X, Users, ChevronDown, ChevronUp, Eye, EyeOff, Info,
  Layers, Search, TrendingUp, MessageCircle, Star, Lightbulb,
  CheckCircle2, CloudOff, Loader2, ChevronRight,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalysisDepth = "quick" | "standard" | "deep"

type FocusArea = {
  id: PromptType
  label: string
  description: string
  icon: React.ReactNode
  promptCount: { quick: number; standard: number; deep: number }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const FOCUS_AREAS: FocusArea[] = [
  {
    id: "informative",
    label: "Brand Awareness",
    description: "How LLMs describe and explain your brand",
    icon: <Search className="h-4 w-4" />,
    promptCount: { quick: 1, standard: 2, deep: 3 },
  },
  {
    id: "comparative",
    label: "Competitive Intel",
    description: "Head-to-head comparisons with competitors",
    icon: <Users className="h-4 w-4" />,
    promptCount: { quick: 1, standard: 2, deep: 3 },
  },
  {
    id: "recommendation",
    label: "Market Position",
    description: "Where LLMs rank you when making recommendations",
    icon: <TrendingUp className="h-4 w-4" />,
    promptCount: { quick: 1, standard: 1, deep: 2 },
  },
  {
    id: "opinion",
    label: "Sentiment & Perception",
    description: "What LLMs think people feel about your brand",
    icon: <MessageCircle className="h-4 w-4" />,
    promptCount: { quick: 0, standard: 1, deep: 2 },
  },
]

const DEPTH_OPTIONS: { id: AnalysisDepth; label: string; description: string; badge: string }[] = [
  { id: "quick", label: "Quick Scan", description: "3–5 prompts, ~60 seconds", badge: "Fast" },
  { id: "standard", label: "Standard Audit", description: "7–9 prompts, ~2 minutes", badge: "Recommended" },
  { id: "deep", label: "Deep Dive", description: "12+ prompts, ~4 minutes", badge: "Thorough" },
]

const USE_CASE_OPTIONS = [
  "Enterprise software buyers",
  "SMB customers",
  "Technical teams",
  "Non-technical decision makers",
  "Procurement managers",
  "Healthcare professionals",
  "E-commerce businesses",
  "Logistics & supply chain",
  "Regulatory compliance officers",
  "Investors & analysts",
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function countPrompts(focusAreas: PromptType[], depth: AnalysisDepth, competitors: string[], useCases: string[]): number {
  let count = 0
  for (const area of FOCUS_AREAS) {
    if (focusAreas.includes(area.id)) count += area.promptCount[depth]
  }
  if (competitors.length > 0 && focusAreas.includes("comparative") && depth === "deep") count += 1
  if (useCases.length > 0 && focusAreas.includes("recommendation")) {
    count += Math.min(useCases.length, depth === "quick" ? 1 : depth === "standard" ? 2 : 3)
  }
  return Math.max(count, 1)
}

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onAdd, onRemove, placeholder, id }: {
  tags: string[]; onAdd: (t: string) => void; onRemove: (t: string) => void; placeholder: string; id: string
}) {
  const [value, setValue] = useState("")
  const commit = () => {
    const t = value.trim()
    if (t && !tags.includes(t)) onAdd(t)
    setValue("")
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-medium text-primary">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-destructive transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input id={id} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
          className="bg-secondary/50 border-border/50 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() } }} />
        <Button type="button" variant="outline" size="sm" onClick={commit} className="shrink-0"><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

// ─── Collapsible Section ─────────────────────────────────────────────────────

function Section({ icon, title, description, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; description?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <button type="button" className="w-full text-left" onClick={() => setOpen(!open)}>
        <CardHeader className="pb-3 hover:bg-secondary/20 transition-colors">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><span className="text-primary">{icon}</span>{title}</span>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          {description && <p className="text-xs text-muted-foreground mt-0.5 text-left">{description}</p>}
        </CardHeader>
      </button>
      {open && <CardContent className="pt-0 pb-5">{children}</CardContent>}
    </Card>
  )
}

// ─── Supabase types ────────────────────────────────────────────────────────────

type SavedBrand = {
  id: string; company_name: string; industry: string; region: string
  description: string; website: string | null; keywords: string[]
  competitors: string[]; source_urls: string[]; updated_at: string
}
type SaveStatus = "idle" | "saving" | "saved" | "error"

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null
  return (
    <span className="flex items-center gap-1 text-xs">
      {status === "saving" && <><Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Saving…</span></>}
      {status === "saved"  && <><CheckCircle2 className="h-3 w-3 text-green-500" /><span className="text-green-500">Saved to cloud</span></>}
      {status === "error"  && <><CloudOff className="h-3 w-3 text-amber-500" /><span className="text-amber-500">Saved locally</span></>}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "llm_brand_context"

export default function AuditsPage() {
  const router = useRouter()

  const [brand, setBrand] = useState<BrandContext>(DEFAULT_BRAND_CONTEXT)
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_BRAND_CONTEXT.keywords ?? [])
  const [competitors, setCompetitors] = useState<string[]>([])
  const [depth, setDepth] = useState<AnalysisDepth>("standard")
  const [focusAreas, setFocusAreas] = useState<PromptType[]>(["informative", "comparative", "recommendation", "opinion"])
  const [useCases, setUseCases] = useState<string[]>([])
  const [sourceUrls, setSourceUrls] = useState<string[]>([])
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Supabase state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([])
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from Supabase on mount, fallback localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setBrand(p.brand ?? DEFAULT_BRAND_CONTEXT)
        setKeywords(p.keywords ?? [])
        setCompetitors(p.competitors ?? [])
      } catch { /* ignore */ }
    }
    const k = localStorage.getItem("gemini_api_key")
    if (k) setApiKey(k)

    fetch("/api/brands")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setSavedBrands(json.data)
          if (!saved) loadBrandData(json.data[0])
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadBrandData = (b: SavedBrand) => {
    setBrand({ companyName: b.company_name, industry: b.industry ?? "", region: b.region ?? "",
      description: b.description ?? "", website: b.website ?? "",
      keywords: b.keywords ?? [], sourceUrls: b.source_urls ?? [], preferredCitations: b.source_urls ?? [] })
    setKeywords(b.keywords ?? [])
    setCompetitors(b.competitors ?? [])
    setSourceUrls(b.source_urls ?? [])
    setShowBrandPicker(false)
    setSaveStatus("idle")
  }

  const triggerSave = useCallback(
    (nextBrand: BrandContext, nextKeywords: string[], nextCompetitors: string[], nextSourceUrls: string[]) => {
      if (!nextBrand.companyName.trim()) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: nextBrand, keywords: nextKeywords, competitors: nextCompetitors }))
      setSaveStatus("saving")
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyName: nextBrand.companyName, industry: nextBrand.industry,
              region: nextBrand.region, description: nextBrand.description, website: nextBrand.website,
              keywords: nextKeywords, competitors: nextCompetitors, sourceUrls: nextSourceUrls }),
          })
          const json = await res.json()
          if (json.success) {
            setSaveStatus("saved")
            setSavedBrands((prev) => {
              const exists = prev.find((b) => b.id === json.data.id)
              return exists ? prev.map((b) => b.id === json.data.id ? json.data : b) : [json.data, ...prev]
            })
            setTimeout(() => setSaveStatus("idle"), 3000)
          } else { setSaveStatus("error") }
        } catch { setSaveStatus("error") }
      }, 1500)
    }, []
  )

  const updateBrand = (updates: Partial<BrandContext>) => {
    const next = { ...brand, ...updates }
    setBrand(next)
    triggerSave(next, keywords, competitors, sourceUrls)
  }

  const saveTagState = (kw: string[], comp: string[], urls?: string[]) => {
    triggerSave(brand, kw, comp, urls ?? sourceUrls)
  }

  const toggleFocusArea = (id: PromptType) =>
    setFocusAreas((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  const toggleUseCase = (uc: string) =>
    setUseCases((prev) => prev.includes(uc) ? prev.filter((u) => u !== uc) : [...prev, uc])

  const estimatedPrompts = countPrompts(focusAreas, depth, competitors, useCases)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRunError(null)
    if (!brand.companyName.trim()) { setRunError("Please enter a company name."); return }
    if (!apiKey.trim()) { setRunError("Please enter your Gemini API key."); return }

    const brandContext: BrandContext = { ...brand, keywords, sourceUrls, preferredCitations: sourceUrls }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand, keywords, competitors }))
    localStorage.setItem("gemini_api_key", apiKey.trim())
    sessionStorage.setItem("businessContext", JSON.stringify(brandContext))

    setIsRunning(true)
    try {
      const response = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-key": apiKey.trim() },
        body: JSON.stringify({
          brandContext,
          auditConfig: {
            models: ["gemini-2.5-flash"],
            promptTypes: focusAreas,
            competitors,
            useCases,
            depth,
            rankingDepth: depth === "quick" ? 3 : depth === "standard" ? 5 : 10,
            sourceRequirements: sourceUrls.map((url) => ({ url, type: "other", required: false })),
          },
        }),
      })
      const json = await response.json()
      if (!json.success) { setRunError(json.error?.message || "Audit failed."); setIsRunning(false); return }

      const existing = JSON.parse(localStorage.getItem("auditHistory") || "[]")
      existing.unshift(json.data)
      localStorage.setItem("auditHistory", JSON.stringify(existing.slice(0, 10)))
      router.push("/dashboard")
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Network error.")
      setIsRunning(false)
    }
  }

  return (
    <SidebarLayout title="New Audit" description="Configure and run a brand perception audit">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1.5 text-primary border-primary/40"><Play className="h-3 w-3" />New Audit</Badge>
            <Badge variant="secondary" className="gap-1.5">~{estimatedPrompts} prompts</Badge>
            <SaveIndicator status={saveStatus} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Audit Configuration</h1>
          <p className="text-muted-foreground mt-1">Every field here feeds directly into Gemini. What you set is what gets analyzed.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-12">

            {/* ── LEFT ─────────────────────────────────────────────────── */}
            <div className="space-y-5 lg:col-span-7">

              {/* Brand */}
              <Section icon={<Building2 className="h-5 w-5" />} title="Brand to Analyze" description="Injected into every prompt — fills [brand], [industry], [region] variables">
                <div className="space-y-4">
                  {/* Brand picker */}
                  {savedBrands.length > 1 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowBrandPicker(!showBrandPicker)}
                        className="w-full flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground">Switch brand:</span>
                          <span className="font-medium">{brand.companyName || "—"}</span>
                        </span>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showBrandPicker ? "rotate-90" : ""}`} />
                      </button>
                      {showBrandPicker && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                          {savedBrands.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => loadBrandData(b)}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-secondary/60 transition-colors text-left border-b border-border/30 last:border-0"
                            >
                              <span>
                                <span className="font-medium text-foreground">{b.company_name}</span>
                                {b.industry && <span className="text-xs text-muted-foreground ml-2">{b.industry}</span>}
                              </span>
                              {brand.companyName === b.company_name && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                      <Input id="companyName" placeholder="e.g. Verifarma" value={brand.companyName}
                        onChange={(e) => updateBrand({ companyName: e.target.value })} className="bg-secondary/50 border-border/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" placeholder="e.g. SaaS, Healthcare, Fintech" value={brand.industry}
                        onChange={(e) => updateBrand({ industry: e.target.value })} className="bg-secondary/50 border-border/50" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="region">Primary Market</Label>
                      <Input id="region" placeholder="e.g. Latin America" value={brand.region}
                        onChange={(e) => updateBrand({ region: e.target.value })} className="bg-secondary/50 border-border/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" placeholder="https://..." value={brand.website ?? ""}
                        onChange={(e) => updateBrand({ website: e.target.value })} className="bg-secondary/50 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Value Proposition</Label>
                    <Textarea id="description" placeholder="Elevator pitch — what does your company do and why does it matter? This shapes how Gemini frames its analysis."
                      value={brand.description} onChange={(e) => updateBrand({ description: e.target.value })}
                      className="min-h-[80px] bg-secondary/50 border-border/50 resize-none text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Keywords <span className="text-xs text-muted-foreground ml-1">— press Enter or comma</span></Label>
                    <TagInput id="keywords" tags={keywords} placeholder="e.g. trazabilidad, farma, compliance"
                      onAdd={(t) => { const n = [...keywords, t]; setKeywords(n); saveTagState(n, competitors) }}
                      onRemove={(t) => { const n = keywords.filter((k) => k !== t); setKeywords(n); saveTagState(n, competitors) }} />
                  </div>
                </div>
              </Section>

              {/* Depth */}
              <Section icon={<Layers className="h-5 w-5" />} title="Analysis Depth" description="Controls how many prompts are sent per focus area">
                <div className="grid gap-3 sm:grid-cols-3">
                  {DEPTH_OPTIONS.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => setDepth(opt.id)}
                      className={`relative text-left rounded-xl border p-4 transition-all ${depth === opt.id ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" : "border-border/50 bg-secondary/30 hover:border-border"}`}>
                      {opt.id === "standard" && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{opt.badge}</span>
                      )}
                      <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Focus Areas */}
              <Section icon={<Target className="h-5 w-5" />} title="Focus Areas" description="Each maps to specific Gemini prompts — select what matters for your audit">
                <div className="grid gap-3 sm:grid-cols-2">
                  {FOCUS_AREAS.map((area) => {
                    const selected = focusAreas.includes(area.id)
                    const count = area.promptCount[depth]
                    return (
                      <button key={area.id} type="button" onClick={() => toggleFocusArea(area.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${selected ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/30 hover:border-border"}`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={selected ? "text-primary" : "text-muted-foreground"}>{area.icon}</span>
                          <Badge variant={selected ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 shrink-0">
                            {count} prompt{count !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <p className="font-semibold text-sm text-foreground">{area.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{area.description}</p>
                      </button>
                    )
                  })}
                </div>
              </Section>

              {/* Use Cases */}
              <Section icon={<Lightbulb className="h-5 w-5" />} title="Target Audiences" description="Added to recommendation prompts — 'Recommend a solution for [audience]'" defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                  {USE_CASE_OPTIONS.map((uc) => (
                    <button key={uc} type="button" onClick={() => toggleUseCase(uc)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${useCases.includes(uc) ? "border-primary bg-primary/15 text-primary" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground"}`}>
                      {uc}
                    </button>
                  ))}
                </div>
                {useCases.length > 0 && (
                  <p className="text-xs text-primary mt-3">✓ {useCases.length} audience{useCases.length > 1 ? "s" : ""} selected</p>
                )}
              </Section>
            </div>

            {/* ── RIGHT ────────────────────────────────────────────────── */}
            <div className="space-y-5 lg:col-span-5">

              {/* Competitors */}
              <Section icon={<Users className="h-5 w-5" />} title="Competitors" description="Used in all comparative & recommendation prompts">
                <TagInput id="competitors" tags={competitors} placeholder="e.g. WinFarma, Zafiro Farmacias"
                  onAdd={(t) => { const n = [...competitors, t]; setCompetitors(n); saveTagState(keywords, n) }}
                  onRemove={(t) => { const n = competitors.filter((c) => c !== t); setCompetitors(n); saveTagState(keywords, n) }} />
                {competitors.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Without competitors, comparative prompts will use general market framing.</p>
                )}
              </Section>

              {/* Source URLs */}
              <Section icon={<Globe2 className="h-5 w-5" />} title="Brand URLs" description="URLs Gemini should reference when discussing your brand" defaultOpen={false}>
                <div className="space-y-2">
                  {sourceUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={url} onChange={(e) => { const n = [...sourceUrls]; n[i] = e.target.value; setSourceUrls(n) }}
                        placeholder="https://..." type="url" className="bg-secondary/50 border-border/50 text-sm" />
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0"
                        onClick={() => setSourceUrls(sourceUrls.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="w-full gap-2"
                    onClick={() => setSourceUrls([...sourceUrls, ""])}><Plus className="h-4 w-4" />Add URL</Button>
                </div>
              </Section>

              {/* Summary */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />Audit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    { label: "Brand", value: brand.companyName || "—" },
                    { label: "Depth", value: <Badge variant="outline" className="capitalize">{depth}</Badge> },
                    { label: "Focus areas", value: `${focusAreas.length} / ${FOCUS_AREAS.length}` },
                    { label: "Competitors", value: competitors.length > 0 ? competitors.length : "none" },
                    { label: "Audiences", value: useCases.length > 0 ? useCases.length : "none" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                    <span className="text-muted-foreground">Est. prompts</span>
                    <span className="text-xl font-black text-primary">{estimatedPrompts}</span>
                  </div>

                  {/* API Key */}
                  <div className="border-t border-border/50 pt-3 space-y-2">
                    <Label htmlFor="apiKey" className="text-xs font-medium flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />Gemini API Key
                    </Label>
                    <div className="relative">
                      <Input id="apiKey" type={showApiKey ? "text" : "password"} placeholder="AIza..."
                        value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                        className="bg-secondary/50 border-border/50 font-mono text-xs pr-9" />
                      <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Free key at{" "}<a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">aistudio.google.com</a>
                    </p>
                  </div>

                  {runError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">{runError}</div>
                  )}

                  <div className="space-y-2 pt-1">
                    <Button type="submit" className="w-full gap-2" size="lg"
                      disabled={isRunning || !apiKey.trim() || !brand.companyName.trim() || focusAreas.length === 0}>
                      {isRunning ? (
                        <><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Running {estimatedPrompts} prompts...</>
                      ) : (
                        <>Run Audit<ArrowRight className="h-4 w-4" /></>
                      )}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => setShowPreview(!showPreview)}>
                      {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPreview ? "Hide" : "Preview"} prompts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Prompt Preview */}
          {showPreview && (
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4 text-primary" />What Gemini will receive</CardTitle>
                <p className="text-sm text-muted-foreground">Generated dynamically based on your configuration above</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FOCUS_AREAS.filter((a) => focusAreas.includes(a.id)).map((area) => {
                    const count = area.promptCount[depth]
                    if (count === 0) return null
                    return (
                      <div key={area.id} className="rounded-lg border border-border/50 bg-background/50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary">{area.icon}</span>
                          <span className="text-sm font-semibold text-foreground">{area.label}</span>
                          <Badge variant="secondary" className="text-[10px]">{count} prompts</Badge>
                        </div>
                        <div className="space-y-1">
                          {area.id === "informative" && <>
                            <p className="text-xs text-muted-foreground font-mono">→ &quot;What is {brand.companyName || "[brand]"}?&quot;</p>
                            {count >= 2 && <p className="text-xs text-muted-foreground font-mono">→ &quot;What is {brand.companyName || "[brand]"}&apos;s reputation?&quot;</p>}
                            {count >= 3 && <p className="text-xs text-muted-foreground font-mono">→ &quot;Market leadership in {brand.industry || "[industry]"}&quot;</p>}
                          </>}
                          {area.id === "comparative" && (competitors.length > 0 ? <>
                            <p className="text-xs text-muted-foreground font-mono">→ &quot;Compare {brand.companyName || "[brand]"} with {competitors.slice(0,2).join(", ")}&quot;</p>
                            {count >= 2 && <p className="text-xs text-muted-foreground font-mono">→ &quot;Strengths & weaknesses vs {competitors[0]}&quot;</p>}
                          </> : <p className="text-xs text-amber-500 font-mono">→ ⚠ Add competitors to enable direct comparisons</p>)}
                          {area.id === "recommendation" && <>
                            <p className="text-xs text-muted-foreground font-mono">→ &quot;Best {brand.industry || "[industry]"} solution — ranked&quot;</p>
                            {useCases.slice(0, count - 1).map((uc) => (
                              <p key={uc} className="text-xs text-muted-foreground font-mono">→ &quot;Recommend a solution for {uc}&quot;</p>
                            ))}
                          </>}
                          {area.id === "opinion" && <>
                            <p className="text-xs text-muted-foreground font-mono">→ &quot;Market sentiment on {brand.companyName || "[brand]"}&quot;</p>
                            {count >= 2 && <p className="text-xs text-muted-foreground font-mono">→ &quot;User reviews & feedback on {brand.companyName || "[brand]"}&quot;</p>}
                          </>}
                        </div>
                      </div>
                    )
                  })}
                  {focusAreas.length === 0 && <p className="text-sm text-muted-foreground">Select at least one focus area.</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </SidebarLayout>
  )
}
