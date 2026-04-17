"use client"

import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Brain, Target, AlertTriangle, CheckCircle } from "lucide-react"

const insights = [
  {
    title: "Strong Technical Reputation",
    description: "Your brand is consistently mentioned as a leader in technical innovation across GPT-4 and Claude responses.",
    trend: "up",
    impact: "high",
    score: 89,
  },
  {
    title: "Customer Support Recognition",
    description: "LLMs frequently cite your customer support as a differentiator when recommending solutions.",
    trend: "up",
    impact: "medium",
    score: 76,
  },
  {
    title: "Pricing Perception Gap",
    description: "There's a notable gap between perceived value and actual pricing in LLM comparisons.",
    trend: "down",
    impact: "medium",
    score: 45,
  },
  {
    title: "Limited Regional Awareness",
    description: "Brand mentions significantly decrease in LATAM-specific queries.",
    trend: "neutral",
    impact: "low",
    score: 52,
  },
]

const topKeywords = [
  { word: "Innovation", count: 147, change: 12 },
  { word: "Reliable", count: 123, change: 8 },
  { word: "Enterprise", count: 98, change: -3 },
  { word: "Scalable", count: 87, change: 15 },
  { word: "Secure", count: 76, change: 5 },
]

export default function InsightsPage() {
  return (
    <SidebarLayout title="Insights" description="Deep analysis of your brand perception">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Brand Insights</h2>
          <p className="text-muted-foreground">Key findings from your LLM brand analysis</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Insights */}
          <div className="space-y-4 lg:col-span-8">
            {insights.map((insight, index) => (
              <Card key={index} className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      insight.trend === "up" ? "bg-accent/10" : 
                      insight.trend === "down" ? "bg-destructive/10" : "bg-muted"
                    }`}>
                      {insight.trend === "up" ? (
                        <TrendingUp className="h-5 w-5 text-accent" />
                      ) : insight.trend === "down" ? (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{insight.title}</h3>
                        <Badge variant={
                          insight.impact === "high" ? "default" :
                          insight.impact === "medium" ? "secondary" : "outline"
                        }>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-3">
                        <Progress value={insight.score} className="h-2 flex-1" />
                        <span className="text-sm font-medium text-foreground">{insight.score}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Side Panel */}
          <div className="space-y-6 lg:col-span-4">
            {/* Quick Stats */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  Perception Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Positive signals</span>
                  </div>
                  <span className="font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-chart-3" />
                    <span className="text-sm text-muted-foreground">Areas to improve</span>
                  </div>
                  <span className="font-semibold text-foreground">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Opportunities</span>
                  </div>
                  <span className="font-semibold text-foreground">7</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Keywords */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-xs font-medium text-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">{keyword.word}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{keyword.count}</span>
                        <span className={`text-xs ${keyword.change > 0 ? "text-accent" : "text-destructive"}`}>
                          {keyword.change > 0 ? "+" : ""}{keyword.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
