"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Globe, Tag, Save, Bell, Mail, Shield } from "lucide-react"

export default function SettingsPage() {
  const [brandData, setBrandData] = useState({
    companyName: "Acme Corporation",
    website: "https://www.acme.com",
    industry: "Technology",
    region: "Global",
    description: "Acme Corporation is a leading provider of innovative solutions...",
    keywords: "innovation, technology, enterprise, scalable",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    mentionAlerts: false,
    competitorAlerts: true,
  })

  return (
    <SidebarLayout title="Brand Settings" description="Configure your brand profile and preferences">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Brand Settings</h2>
          <p className="text-muted-foreground">Manage your brand profile and notification preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Settings */}
          <div className="space-y-6 lg:col-span-8">
            {/* Brand Profile */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-5 w-5 text-primary" />
                  Brand Profile
                </CardTitle>
                <CardDescription>Basic information about your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={brandData.companyName}
                      onChange={(e) => setBrandData({ ...brandData, companyName: e.target.value })}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={brandData.website}
                      onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={brandData.industry}
                      onValueChange={(value) => setBrandData({ ...brandData, industry: value })}
                    >
                      <SelectTrigger id="industry" className="bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Primary Market</Label>
                    <Select
                      value={brandData.region}
                      onValueChange={(value) => setBrandData({ ...brandData, region: value })}
                    >
                      <SelectTrigger id="region" className="bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Global">Global</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="LATAM">Latin America</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Brand Description</Label>
                  <Textarea
                    id="description"
                    value={brandData.description}
                    onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                    className="min-h-[100px] bg-secondary/50 border-border/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Key Concepts
                  </Label>
                  <Input
                    id="keywords"
                    value={brandData.keywords}
                    onChange={(e) => setBrandData({ ...brandData, keywords: e.target.value })}
                    className="bg-secondary/50 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email Alerts</p>
                      <p className="text-xs text-muted-foreground">Receive important updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                    <p className="text-xs text-muted-foreground">Summary of your brand performance</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mention Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when your brand is mentioned</p>
                  </div>
                  <Switch
                    checked={notifications.mentionAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, mentionAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Competitor Alerts</p>
                    <p className="text-xs text-muted-foreground">Updates on competitor activity</p>
                  </div>
                  <Switch
                    checked={notifications.competitorAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, competitorAlerts: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6 lg:col-span-4">
            {/* Account Status */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge>Professional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">LLM Credits</span>
                  <span className="font-semibold text-foreground">847 / 1000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renewal</span>
                  <span className="text-sm text-foreground">Mar 1, 2026</span>
                </div>
                <Button variant="outline" className="w-full mt-2 bg-transparent">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Export Brand Data
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  API Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive bg-transparent">
                  Delete Brand Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
