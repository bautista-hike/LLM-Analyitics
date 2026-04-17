"use client"

import React from "react"

import { useState, useEffect }from "react"
import { useRouter } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { auditConfigSchema, type AuditConfigInput } from "@/lib/schemas"
import { LLM_MODELS, USE_CASES, PROMPT_TEMPLATES } from "@/lib/constants"
import type { LLMModel, PromptType, CustomPrompt } from "@/types"
import { PromptBuilder, previewPrompt } from "@/lib/prompts"
import type { BrandContext } from "@/types"
import { DEFAULT_BRAND_CONTEXT, DEFAULT_COMPETITORS } from "@/lib/defaults"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  MessageSquare,
  BarChart,
  Users,
  Zap,
  ArrowRight,
  Play,
  Link as LinkIcon,
  Plus,
  X,
} from "lucide-react"
import { SOURCE_TYPES } from "@/lib/constants"


// Prompt types configuration - using types from constants
const promptTypesConfig = [
  { id: "informative" as PromptType, label: "Informative Questions", description: "What is [brand]? What does it do?" },
  { id: "comparative" as PromptType, label: "Comparative Questions", description: "How does it compare to X?" },
  { id: "opinion" as PromptType, label: "Opinion Questions", description: "Is it recommended to use [brand]?" },
  { id: "recommendation" as PromptType, label: "Recommendation Requests", description: "Recommend a [product/service]" },
]


export default function AuditsPage() {
  const router = useRouter()
  const [selectedModels, setSelectedModels] = useState<LLMModel[]>(["gpt-4", "claude-3-opus", "gemini-pro"])
  const [selectedPromptTypes, setSelectedPromptTypes] = useState<PromptType[]>(["informative", "comparative", "recommendation", "opinion"])
  const [rankingDepth, setRankingDepth] = useState(5)
  const [competitors, setCompetitors] = useState(DEFAULT_COMPETITORS.join(", "))
  const [brandDiscovery, setBrandDiscovery] = useState("")
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([])
  const [sourceRequirements, setSourceRequirements] = useState<Array<{ url: string; type: string; required: boolean }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [openaiKey, setOpenaiKey] = useState("")
  
  // Custom prompts state
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null)
  const [currentPromptText, setCurrentPromptText] = useState("")
  const [currentPromptType, setCurrentPromptType] = useState<PromptType>("custom")
  const [showPreview, setShowPreview] = useState(false)

  // Load saved API key + ensure brand context exists in sessionStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key")
    if (savedKey) setOpenaiKey(savedKey)

    // Seed sessionStorage with default brand context if empty
    if (!sessionStorage.getItem("businessContext")) {
      sessionStorage.setItem("businessContext", JSON.stringify(DEFAULT_BRAND_CONTEXT))
    }
  }, [])
  
  // Get brand context — falls back to DEFAULT_BRAND_CONTEXT if sessionStorage is empty
  const getBrandContext = (): BrandContext => {
    if (typeof window === 'undefined') return DEFAULT_BRAND_CONTEXT
    const stored = sessionStorage.getItem("businessContext")
    if (!stored) return DEFAULT_BRAND_CONTEXT
    try {
      return JSON.parse(stored) as BrandContext
    } catch {
      return DEFAULT_BRAND_CONTEXT
    }
  }

  const toggleModel = (modelId: LLMModel) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    )
  }

  const togglePromptType = (typeId: PromptType) => {
    setSelectedPromptTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    )
  }

  const toggleUseCase = (useCase: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCase)
        ? prev.filter((uc) => uc !== useCase)
        : [...prev, useCase]
    )
  }

  // Custom prompt handlers
  const handleAddCustomPrompt = () => {
    setCurrentPromptText("")
    setCurrentPromptType("custom")
    setEditingPromptIndex(null)
    setShowPromptEditor(true)
  }

  const handleSaveCustomPrompt = () => {
    if (!currentPromptText.trim()) return

    const newPrompt: CustomPrompt = {
      text: currentPromptText.trim(),
      type: currentPromptType,
      sourceRequirements: sourceRequirements.length > 0 ? sourceRequirements.map((sr) => sr.url) : undefined,
    }

    if (editingPromptIndex !== null) {
      const updated = [...customPrompts]
      updated[editingPromptIndex] = newPrompt
      setCustomPrompts(updated)
    } else {
      setCustomPrompts([...customPrompts, newPrompt])
    }

    setShowPromptEditor(false)
    setCurrentPromptText("")
    setEditingPromptIndex(null)
  }

  const handleDeleteCustomPrompt = (index: number) => {
    setCustomPrompts(customPrompts.filter((_, i) => i !== index))
  }

  const handleEditCustomPrompt = (index: number) => {
    const prompt = customPrompts[index]
    setCurrentPromptText(prompt.text)
    setCurrentPromptType(prompt.type)
    setEditingPromptIndex(index)
    setShowPromptEditor(true)
  }

  // Get all prompts for preview
  const getAllPromptsPreview = () => {
    const brandContext = getBrandContext()
    if (!brandContext) return []

    const sourceReqs = sourceRequirements
      .filter((sr) => sr.url.trim().length > 0)
      .map((sr) => ({
        url: sr.url.trim(),
        type: sr.type as any,
        required: sr.required,
        label: sr.type !== 'other' ? SOURCE_TYPES.find((st) => st.value === sr.type)?.label : undefined,
      }))

    const prompts: Array<{ type: string; prompt: string; source: string }> = []

    // Add custom prompts
    customPrompts.forEach((customPrompt) => {
      try {
        const preview = previewPrompt(brandContext, customPrompt, sourceReqs)
        prompts.push({
          type: customPrompt.type,
          prompt: preview.prompt,
          source: 'custom',
        })
      } catch (error) {
        console.error('Error previewing custom prompt:', error)
      }
    })

    // Add template prompts for selected types
    selectedPromptTypes.forEach((promptType) => {
      const templates = PROMPT_TEMPLATES.filter((t) => t.type === promptType)
      templates.forEach((template) => {
        try {
          const preview = previewPrompt(brandContext, template, sourceReqs)
          prompts.push({
            type: template.type,
            prompt: preview.prompt,
            source: 'template',
          })
        } catch (error) {
          console.error('Error previewing template:', error)
        }
      })
    })

    return prompts
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRunError(null)

    if (!openaiKey.trim()) {
      setRunError("Please enter your OpenAI API key to run the audit.")
      return
    }
    
    // Prepare audit config data
    const auditConfigData: AuditConfigInput = {
      models: selectedModels,
      promptTypes: selectedPromptTypes,
      customPrompts: customPrompts.length > 0 ? customPrompts : undefined,
      rankingDepth: rankingDepth,
      competitors: competitors.split(",").map((c) => c.trim()).filter((c) => c.length > 0),
      brandDiscovery,
      useCases: selectedUseCases,
      sourceRequirements: sourceRequirements.map((sr) => ({
        url: sr.url.trim(),
        type: sr.type as any,
        required: sr.required,
      })),
    }
    
    // Validate with Zod schema
    const result = auditConfigSchema.safeParse(auditConfigData)
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          fieldErrors[error.path[0].toString()] = error.message
        }
      })
      setErrors(fieldErrors)
      return
    }
    
    const brandContext = getBrandContext()

    // Save API key for convenience
    localStorage.setItem("gemini_api_key", openaiKey.trim())

    setIsRunning(true)
    try {
      const response = await fetch("/api/audit/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": openaiKey.trim(),
        },
        body: JSON.stringify({
          brandContext,
          auditConfig: result.data,
        }),
      })

      const json = await response.json()

      if (!json.success) {
        setRunError(json.error?.message || "Audit failed. Please try again.")
        setIsRunning(false)
        return
      }

      // Store full audit result in localStorage
      const existing = JSON.parse(localStorage.getItem("auditHistory") || "[]")
      existing.unshift(json.data)
      localStorage.setItem("auditHistory", JSON.stringify(existing.slice(0, 10))) // Keep last 10
      localStorage.setItem("lastAuditResult", JSON.stringify(json.data))
      sessionStorage.setItem("auditConfig", JSON.stringify(result.data))

      router.push("/dashboard")
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Network error. Please try again.")
      setIsRunning(false)
    }
  }

  return (
    <SidebarLayout title="Audits" description="Configure your LLM brand audit">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1">
              <Play className="h-3 w-3" />
              New Audit
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Audit Configuration</h2>
          <p className="text-muted-foreground">Define the technical parameters to analyze your brand in LLMs</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-7">
              {/* LLM Models */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-5 w-5 text-primary" />
                    LLMs to Evaluate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LLM_MODELS.filter((m) => m.enabled).map((model) => (
                      <div
                        key={model.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          selectedModels.includes(model.id)
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-secondary/30 hover:border-border"
                        }`}
                        onClick={() => toggleModel(model.id)}
                        onKeyDown={(e) => e.key === "Enter" && toggleModel(model.id)}
                        role="checkbox"
                        aria-checked={selectedModels.includes(model.id)}
                        tabIndex={0}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow ${
                            selectedModels.includes(model.id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                          aria-hidden="true"
                        >
                          {selectedModels.includes(model.id) && (
                            <CheckIcon className="size-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prompt Types */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Interaction Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {promptTypesConfig.map((type) => (
                      <div
                        key={type.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                          selectedPromptTypes.includes(type.id)
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-secondary/30 hover:border-border"
                        }`}
                        onClick={() => togglePromptType(type.id)}
                        onKeyDown={(e) => e.key === "Enter" && togglePromptType(type.id)}
                        role="checkbox"
                        aria-checked={selectedPromptTypes.includes(type.id)}
                        tabIndex={0}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow ${
                            selectedPromptTypes.includes(type.id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                          aria-hidden="true"
                        >
                          {selectedPromptTypes.includes(type.id) && (
                            <CheckIcon className="size-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Prompts */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Custom Prompts
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomPrompt}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Prompt
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customPrompts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Create custom prompts to test specific scenarios. Click "Add Prompt" to get started.
                      </p>
                    ) : (
                      customPrompts.map((prompt, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {prompt.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">{prompt.text}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCustomPrompt(index)}
                              className="h-8 w-8"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCustomPrompt(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Brand Discovery */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5 text-primary" />
                    Brand Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="brandDiscovery">Specific scenarios or questions</Label>
                    <Textarea
                      id="brandDiscovery"
                      placeholder="Describe specific scenarios you'd like to test. E.g., 'How does the LLM respond when someone looks for alternatives to my product?'"
                      value={brandDiscovery}
                      onChange={(e) => setBrandDiscovery(e.target.value)}
                      className="min-h-[100px] bg-secondary/50 border-border/50 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:col-span-5">
              {/* Ranking Depth */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart className="h-5 w-5 text-primary" />
                    Ranking Depth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Positions to analyze</Label>
                      <Badge variant="secondary">Top {rankingDepth}</Badge>
                    </div>
                    <Slider
                      value={[rankingDepth]}
                      onValueChange={(value) => setRankingDepth(value[0])}
                      min={3}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define how many ranking positions will be analyzed in LLM responses
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Analysis */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-primary" />
                    Comparative Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Competitors to analyze</Label>
                    <Input
                      id="competitors"
                      placeholder="e.g., Competitor A, Competitor B"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      className="bg-secondary/50 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">Separate names with commas</p>
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {USE_CASES.map((useCase) => (
                      <button
                        key={useCase}
                        type="button"
                        onClick={() => toggleUseCase(useCase)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                          selectedUseCases.includes(useCase)
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                        }`}
                      >
                        {useCase}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Source Requirements */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    Required Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      URLs that LLMs must mention or cite when discussing your brand.
                    </p>
                    {sourceRequirements.map((source, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="https://www.example.com/page"
                            value={source.url}
                            onChange={(e) => {
                              const updated = [...sourceRequirements]
                              updated[index].url = e.target.value
                              setSourceRequirements(updated)
                            }}
                            className="bg-secondary/50 border-border/50"
                            type="url"
                          />
                          <div className="flex gap-2">
                            <select
                              value={source.type}
                              onChange={(e) => {
                                const updated = [...sourceRequirements]
                                updated[index].type = e.target.value
                                setSourceRequirements(updated)
                              }}
                              className="flex h-9 w-full rounded-md border border-input bg-secondary/50 px-3 py-1 text-sm"
                            >
                              {SOURCE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={source.required}
                                onChange={(e) => {
                                  const updated = [...sourceRequirements]
                                  updated[index].required = e.target.checked
                                  setSourceRequirements(updated)
                                }}
                                className="rounded border-input"
                              />
                              Required
                            </label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSourceRequirements(sourceRequirements.filter((_, i) => i !== index))
                          }}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSourceRequirements([
                          ...sourceRequirements,
                          { url: "", type: "other", required: true },
                        ])
                      }}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Source URL
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected models</span>
                      <span className="font-medium text-foreground">{selectedModels.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prompt types</span>
                      <span className="font-medium text-foreground">{selectedPromptTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ranking depth</span>
                      <span className="font-medium text-foreground">Top {rankingDepth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Competitors</span>
                      <span className="font-medium text-foreground">
                        {competitors ? competitors.split(",").length : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Key + Submit */}
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
              <Label htmlFor="openaiKey" className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Gemini API Key
              </Label>
              <Input
                id="openaiKey"
                type="password"
                placeholder="AIza..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="bg-secondary/50 border-border/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Get a free key at{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  aistudio.google.com
                </a>. Uses <strong>gemini-2.0-flash</strong>. Your key is stored locally only.
              </p>
            </div>

            {runError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {runError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isRunning || !openaiKey.trim() || selectedModels.length === 0 || (selectedPromptTypes.length === 0 && customPrompts.length === 0)}
                className="gap-2 min-w-[140px]"
              >
                {isRunning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Running...
                  </>
                ) : (
                  <>
                    Run Audit
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Prompt Preview */}
          {showPreview && (
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Prompt Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This is how your prompts will look when sent to the LLMs
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAllPromptsPreview().length > 0 ? (
                    <>
                      <div className="space-y-4">
                        <Label>Preview Prompts ({getAllPromptsPreview().length}):</Label>
                        {getAllPromptsPreview().map((preview, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {preview.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {preview.source}
                              </Badge>
                            </div>
                            <div className="rounded-lg border border-border/50 bg-background p-4 text-sm">
                              <pre className="whitespace-pre-wrap font-mono text-foreground">
                                {preview.prompt}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                      {sourceRequirements.filter((sr) => sr.url.trim().length > 0).length > 0 && (
                        <div className="space-y-2">
                          <Label>Source Requirements:</Label>
                          <div className="rounded-lg border border-border/50 bg-background p-3 text-sm">
                            <div className="space-y-2">
                              {sourceRequirements
                                .filter((sr) => sr.url.trim().length > 0)
                                .map((sr, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${sr.required ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{sr.url}</span>
                                        {sr.required && (
                                          <Badge variant="outline" className="text-xs">Required</Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {SOURCE_TYPES.find((st) => st.value === sr.type)?.label || sr.type}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="rounded-lg border border-accent/50 bg-accent/5 p-3 text-xs text-muted-foreground">
                        <strong>Note:</strong> Source requirements are automatically injected at the end of prompts.
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete the form above to see a preview. Make sure you've filled in the Brand Context on the home page.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Custom Prompt Editor Dialog */}
        <Dialog open={showPromptEditor} onOpenChange={setShowPromptEditor}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromptIndex !== null ? "Edit Custom Prompt" : "Create Custom Prompt"}
              </DialogTitle>
              <DialogDescription>
                Write a custom prompt to test specific scenarios. Use variables like {"{brand}"}, {"{industry}"}, {"{competitor}"} to inject dynamic content.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="promptType">Prompt Type</Label>
                <Select
                  value={currentPromptType}
                  onValueChange={(value) => {
                    const validTypes: PromptType[] = ['informative', 'comparative', 'opinion', 'recommendation', 'custom']
                    if (validTypes.includes(value as PromptType)) {
                      setCurrentPromptType(value as PromptType)
                    }
                  }}
                >
                  <SelectTrigger id="promptType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="comparative">Comparative</SelectItem>
                    <SelectItem value="opinion">Opinion</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promptText">Prompt Text</Label>
                <Textarea
                  id="promptText"
                  placeholder='e.g., "What are the main features of {brand}? How does it compare to {competitor}?"'
                  value={currentPromptText}
                  onChange={(e) => setCurrentPromptText(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{brand}"}, {"{company}"}, {"{industry}"}, {"{region}"}, {"{website}"}, {"{competitor}"}
                </p>
              </div>
              {getBrandContext() && currentPromptText && (
                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                  <Label className="text-xs text-muted-foreground">Live Preview:</Label>
                  <div className="mt-2 rounded bg-background p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-foreground">
                      {(() => {
                        try {
                          const brandContext = getBrandContext()!
                          const sourceReqs = sourceRequirements
                            .filter((sr) => sr.url.trim().length > 0)
                            .map((sr) => ({
                              url: sr.url.trim(),
                              type: sr.type as any,
                              required: sr.required,
                              label: undefined,
                            }))
                          const customPrompt: CustomPrompt = {
                            text: currentPromptText,
                            type: currentPromptType,
                          }
                          const preview = previewPrompt(brandContext, customPrompt, sourceReqs)
                          return preview.prompt
                        } catch (error) {
                          return "Error generating preview"
                        }
                      })()}
                    </pre>
                  </div>
                  {sourceRequirements.filter((sr) => sr.url.trim().length > 0).length > 0 && (
                    <div className="mt-2 rounded border border-accent/30 bg-accent/5 p-2 text-xs text-muted-foreground">
                      <strong>Note:</strong> Source requirements will be automatically appended to this prompt.
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPromptEditor(false)
                  setCurrentPromptText("")
                  setEditingPromptIndex(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveCustomPrompt}
                disabled={!currentPromptText.trim()}
              >
                {editingPromptIndex !== null ? "Save Changes" : "Add Prompt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}
