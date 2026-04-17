"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { brandContextSchema, type BrandContextInput } from "@/lib/schemas"
import { INDUSTRIES, REGIONS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe, Building2, Tag, ArrowRight, Sparkles, TrendingUp, BarChart3, Users } from "lucide-react"


export default function HomePage() {
  const router = useRouter()
  
  // Initialize with empty values to avoid hydration mismatch
  const [formData, setFormData] = useState<BrandContextInput>({
    companyName: "",
    website: "",
    industry: "",
    region: "",
    description: "",
    keywords: [],
    sourceUrls: [],
    preferredCitations: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Raw input values for fields that need special handling
  const [keywordsRaw, setKeywordsRaw] = useState("")
  const [sourceUrlsRaw, setSourceUrlsRaw] = useState("")
  const [preferredCitationsRaw, setPreferredCitationsRaw] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  
  // Load from sessionStorage only after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)
    const stored = sessionStorage.getItem("businessContext")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BrandContextInput
        setFormData(parsed)
        setKeywordsRaw(Array.isArray(parsed.keywords) ? parsed.keywords.join(", ") : "")
        setSourceUrlsRaw(Array.isArray(parsed.sourceUrls) ? parsed.sourceUrls.join("\n") : "")
        setPreferredCitationsRaw(Array.isArray(parsed.preferredCitations) ? parsed.preferredCitations.join("\n") : "")
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate with Zod schema
    const result = brandContextSchema.safeParse(formData)
    
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
    
    // Convert keywords string to array if needed
    const validatedData = result.data
    
    sessionStorage.setItem("businessContext", JSON.stringify(validatedData))
    router.push("/audits")
  }

  const isFormValid = formData.companyName && formData.industry && formData.description

  return (
    <SidebarLayout title="Welcome" description="Start your brand analysis">
      <div className="p-6">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            Understand How AI Perceives Your Brand
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Analyze your brand positioning across the most important language models. 
            Discover what LLMs say about your company and optimize your digital presence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">8+</p>
                  <p className="text-sm text-muted-foreground">LLM Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Real-time</p>
                  <p className="text-sm text-muted-foreground">Analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Competitor</p>
                  <p className="text-sm text-muted-foreground">Benchmarking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl">Business Context</CardTitle>
            <p className="text-sm text-muted-foreground">Tell us about your brand to personalize the analysis</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Acme Corporation"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value })
                      if (errors.companyName) {
                        setErrors({ ...errors, companyName: "" })
                      }
                    }}
                    className={`bg-secondary/50 border-border/50 ${errors.companyName ? "border-destructive" : ""}`}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-xs text-destructive">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry / Category</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger id="industry" className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Primary Market</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger id="region" className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brand Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what your company does, its value proposition, and what differentiates it from the competition..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value })
                      if (errors.description) {
                        setErrors({ ...errors, description: "" })
                      }
                    }}
                    className={`min-h-[120px] bg-secondary/50 border-border/50 resize-none ${errors.description ? "border-destructive" : ""}`}
                    required
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description}</p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords" className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Key Concepts
                </Label>
                <Input
                  id="keywords"
                  placeholder="e.g., innovation, sustainability, premium quality, advanced technology"
                  value={keywordsRaw}
                  onChange={(e) => {
                    setKeywordsRaw(e.target.value)
                    // Update formData on blur or when user types comma
                    const keywords = e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0)
                    setFormData({ ...formData, keywords })
                  }}
                  onBlur={(e) => {
                    const keywords = e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0)
                    setFormData({ ...formData, keywords })
                    setKeywordsRaw(keywords.join(", "))
                  }}
                  className={`bg-secondary/50 border-border/50 ${errors.keywords ? "border-destructive" : ""}`}
                />
                {errors.keywords && (
                  <p className="text-xs text-destructive">{errors.keywords}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Separate concepts with commas. These are topics you want LLMs to associate with your brand.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrls" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Source URLs (Required Mentions)
                </Label>
                <Textarea
                  id="sourceUrls"
                  placeholder="https://www.example.com/product&#10;https://blog.example.com/article&#10;One URL per line"
                  value={sourceUrlsRaw}
                  onChange={(e) => {
                    setSourceUrlsRaw(e.target.value)
                    // Update formData in real-time but keep raw value
                    const urls = e.target.value
                      .split("\n")
                      .map((url) => url.trim())
                      .filter((url) => url.length > 0)
                    setFormData({ ...formData, sourceUrls: urls })
                  }}
                  onBlur={(e) => {
                    const urls = e.target.value
                      .split("\n")
                      .map((url) => url.trim())
                      .filter((url) => url.length > 0)
                    setFormData({ ...formData, sourceUrls: urls })
                    setSourceUrlsRaw(urls.join("\n"))
                  }}
                  className="min-h-[100px] bg-secondary/50 border-border/50 resize-none"
                />
                {errors.sourceUrls && (
                  <p className="text-xs text-destructive">{errors.sourceUrls}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URLs that LLMs should mention or cite when discussing your brand. One URL per line.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredCitations" className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Preferred Citations
                </Label>
                <Textarea
                  id="preferredCitations"
                  placeholder="Specific pages or content that should be referenced&#10;e.g., /product-features, /about-us/values"
                  value={preferredCitationsRaw}
                  onChange={(e) => {
                    setPreferredCitationsRaw(e.target.value)
                    const citations = e.target.value
                      .split("\n")
                      .map((c) => c.trim())
                      .filter((c) => c.length > 0)
                    setFormData({ ...formData, preferredCitations: citations })
                  }}
                  onBlur={(e) => {
                    const citations = e.target.value
                      .split("\n")
                      .map((c) => c.trim())
                      .filter((c) => c.length > 0)
                    setFormData({ ...formData, preferredCitations: citations })
                    setPreferredCitationsRaw(citations.join("\n"))
                  }}
                  className="min-h-[80px] bg-secondary/50 border-border/50 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Specific pages or content paths that should be referenced. One per line.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFormValid}
                  className="gap-2"
                >
                  Start Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}
