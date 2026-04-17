"use client"

import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, Eye, MoreVertical, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const reports = [
  {
    id: 1,
    name: "Monthly Brand Analysis - January 2026",
    date: "Jan 31, 2026",
    type: "Monthly",
    status: "completed",
    pages: 24,
  },
  {
    id: 2,
    name: "Competitor Comparison Report",
    date: "Jan 15, 2026",
    type: "Custom",
    status: "completed",
    pages: 18,
  },
  {
    id: 3,
    name: "Q4 2025 Performance Summary",
    date: "Dec 31, 2025",
    type: "Quarterly",
    status: "completed",
    pages: 32,
  },
  {
    id: 4,
    name: "LLM Perception Trends Analysis",
    date: "Dec 15, 2025",
    type: "Custom",
    status: "completed",
    pages: 15,
  },
]

const scheduledReports = [
  { name: "Monthly Brand Analysis", frequency: "Monthly", nextRun: "Feb 28, 2026" },
  { name: "Weekly Mention Digest", frequency: "Weekly", nextRun: "Feb 9, 2026" },
]

export default function ReportsPage() {
  return (
    <SidebarLayout title="Reports" description="Generated reports and analytics">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reports</h2>
            <p className="text-muted-foreground">View and download your analysis reports</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Reports List */}
          <div className="lg:col-span-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{report.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {report.date}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {report.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{report.pages} pages</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Report</DropdownMenuItem>
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6 lg:col-span-4">
            {/* Scheduled Reports */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Scheduled Reports</span>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map((report, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-medium text-foreground text-sm">{report.name}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{report.frequency}</span>
                        <span>Next: {report.nextRun}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Stats */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total reports</span>
                    <span className="font-semibold text-foreground">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This month</span>
                    <span className="font-semibold text-foreground">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Downloads</span>
                    <span className="font-semibold text-foreground">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
