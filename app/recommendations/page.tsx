"use client"

import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, ArrowRight, Clock, Zap, Target, FileText, Users, MessageSquare } from "lucide-react"

const recommendations = [
  {
    id: 1,
    title: "Increase Content on Innovation Topics",
    description: "Create more blog posts and case studies highlighting your innovative features. This will help LLMs better understand and recommend your product for innovation-related queries.",
    priority: "high",
    effort: "medium",
    impact: "+15% mentions",
    icon: FileText,
    category: "Content",
  },
  {
    id: 2,
    title: "Expand Customer Success Stories",
    description: "Publish more customer testimonials and case studies. LLMs frequently cite real customer experiences when making recommendations.",
    priority: "high",
    effort: "high",
    impact: "+20% trust signals",
    icon: Users,
    category: "Social Proof",
  },
  {
    id: 3,
    title: "Optimize FAQ and Documentation",
    description: "Expand your FAQ section with common questions about pricing, features, and comparisons. This helps LLMs provide accurate information.",
    priority: "medium",
    effort: "low",
    impact: "+8% accuracy",
    icon: MessageSquare,
    category: "Documentation",
  },
  {
    id: 4,
    title: "Engage in Industry Publications",
    description: "Contribute guest posts to industry blogs and publications. This increases your brand's authority in LLM training data.",
    priority: "medium",
    effort: "medium",
    impact: "+12% authority",
    icon: Target,
    category: "PR",
  },
]

const quickWins = [
  "Update meta descriptions with key value propositions",
  "Add structured data markup to product pages",
  "Create comparison pages vs top competitors",
  "Publish a comprehensive pricing FAQ",
]

export default function RecommendationsPage() {
  return (
    <SidebarLayout title="Recommendations" description="Action items to improve your brand perception">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recommended Actions</h2>
            <p className="text-muted-foreground">Strategic recommendations based on your analysis</p>
          </div>
          <Badge className="gap-1 bg-primary/20 text-primary hover:bg-primary/30">
            <Sparkles className="h-3 w-3" />
            AI Generated
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Recommendations */}
          <div className="space-y-4 lg:col-span-8">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      rec.priority === "high" ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <rec.icon className={`h-6 w-6 ${
                        rec.priority === "high" ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={rec.priority === "high" ? "default" : "secondary"}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.effort} effort
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-accent border-accent/30">
                          <Zap className="h-3 w-3" />
                          {rec.impact}
                        </Badge>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button size="sm" variant="ghost" className="gap-1">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Side Panel */}
          <div className="space-y-6 lg:col-span-4">
            {/* Quick Wins */}
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-accent" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickWins.map((win, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Checkbox id={`quick-win-${index}`} />
                      <label
                        htmlFor={`quick-win-${index}`}
                        className="text-sm text-foreground cursor-pointer leading-tight"
                      >
                        {win}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Summary */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Priority Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High priority</span>
                    <span className="font-semibold text-foreground">2 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium priority</span>
                    <span className="font-semibold text-foreground">2 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quick wins</span>
                    <span className="font-semibold text-foreground">4 items</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button className="w-full gap-2">
                    Export Action Plan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
