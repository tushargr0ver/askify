"use client"

import * as React from "react"
import { BarChart3, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useUsageStore } from "@/hooks/useUsageStore"
import { useAuthStore } from "@/hooks/useAuthStore"

interface UsageDisplayProps {
  compact?: boolean
}

export function UsageDisplay({ compact = false }: UsageDisplayProps) {
  const { usage, isLoading, error, fetchUsage } = useUsageStore()
  const { profile } = useAuthStore()

  React.useEffect(() => {
    if (profile) {
      fetchUsage()
    }
  }, [profile, fetchUsage])

  if (isLoading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-2xl"}>
        <CardHeader className={compact ? "pb-4" : ""}>
          <CardTitle className={compact ? "text-base" : "text-lg"}>Usage Statistics</CardTitle>
          {!compact && (
            <CardDescription>Track your daily and monthly message usage</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-2xl"}>
        <CardContent className={compact ? "pt-4" : "pt-6"}>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getUsageVariant = (percentage: number) => {
    if (percentage >= 90) return "destructive"
    if (percentage >= 75) return "secondary"
    return "outline"
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <Badge variant={getUsageVariant(usage.daily.percentage)}>
              {usage.daily.used}/{usage.daily.limit}
            </Badge>
          </div>
          <Progress 
            value={usage.daily.percentage} 
            className="h-2"
          />
          {usage.daily.breakdown && (
            <div className="text-xs text-muted-foreground">
              {usage.daily.breakdown.messages}m • {usage.daily.breakdown.uploads}u • {usage.daily.breakdown.repos}r
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <Badge variant={getUsageVariant(usage.monthly.percentage)}>
              {usage.monthly.used}/{usage.monthly.limit}
            </Badge>
          </div>
          <Progress 
            value={usage.monthly.percentage} 
            className="h-2"
          />
          {usage.monthly.breakdown && (
            <div className="text-xs text-muted-foreground">
              {usage.monthly.breakdown.messages}m • {usage.monthly.breakdown.uploads}u • {usage.monthly.breakdown.repos}r
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Usage
            </CardTitle>
            <CardDescription>
              Messages sent today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{usage.daily.used}</span>
                <Badge variant={getUsageVariant(usage.daily.percentage)}>
                  {usage.daily.percentage}%
                </Badge>
              </div>
              <Progress 
                value={usage.daily.percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage.daily.remaining} remaining</span>
                <span>Limit: {usage.daily.limit}</span>
              </div>
              {usage.daily.breakdown && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                  <div className="flex justify-between">
                    <span>Messages: {usage.daily.breakdown.messages}</span>
                    <span>Uploads: {usage.daily.breakdown.uploads}</span>
                    <span>Repos: {usage.daily.breakdown.repos}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monthly Usage
            </CardTitle>
            <CardDescription>
              Messages sent this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{usage.monthly.used}</span>
                <Badge variant={getUsageVariant(usage.monthly.percentage)}>
                  {usage.monthly.percentage}%
                </Badge>
              </div>
              <Progress 
                value={usage.monthly.percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{usage.monthly.remaining} remaining</span>
                <span>Limit: {usage.monthly.limit}</span>
              </div>
              {usage.monthly.breakdown && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                  <div className="flex justify-between">
                    <span>Messages: {usage.monthly.breakdown.messages}</span>
                    <span>Uploads: {usage.monthly.breakdown.uploads}</span>
                    <span>Repos: {usage.monthly.breakdown.repos}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {usage.weekly && usage.weekly.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Messages sent over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {usage.weekly.map((day, index) => {
                const maxActions = Math.max(...usage.weekly.map(d => d.total), 1)
                const height = (day.total / maxActions) * 100
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all duration-300"
                      style={{ height: `${height}%` }}
                      title={`${day.total} actions on ${getDayName(day.date)} (${day.breakdown.messages}m, ${day.breakdown.uploads}u, ${day.breakdown.repos}r)`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {getDayName(day.date)}
                    </div>
                    <div className="text-xs font-medium">
                      {day.total}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(usage.daily.percentage >= 80 || usage.monthly.percentage >= 80) && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Usage Warning
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {usage.daily.percentage >= 90 || usage.monthly.percentage >= 90 
                    ? "You're approaching your message limits. Consider upgrading your plan for unlimited access."
                    : "You're using a significant portion of your message allowance. Monitor your usage to avoid hitting limits."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
