"use client";

import { TrendingUp, TrendingDown, Users, DollarSign, Package, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { discountService, type DiscountAnalytics } from "@/lib/services/plans/discount.service";

interface DiscountAnalyticsCardProps {
  analytics: DiscountAnalytics;
}

export function DiscountAnalyticsCard({ analytics }: DiscountAnalyticsCardProps) {
  const { overall, byType, topPerforming, usageTrends, campaigns } = analytics;

  return (
    <div className="grid gap-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountService.formatCurrency(overall.totalOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {discountService.formatCurrency(overall.totalDiscountAmount)} in discounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.totalUses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overall.utilizationRate.toFixed(1)}% utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.activeDiscounts}</div>
            <p className="text-xs text-muted-foreground">
              of {overall.totalDiscounts} total discounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Discount Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountService.formatCurrency(overall.averageDiscountValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {discountService.formatCurrency(overall.savings)} total savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Types Performance</CardTitle>
          <CardDescription>
            Breakdown by discount type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {byType.map((type) => (
              <div key={type._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {discountService.getDiscountTypeLabel(type._id)}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium">{type.count} discounts</div>
                    <div className="text-xs text-muted-foreground">
                      {type.totalUses} total uses
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {discountService.formatCurrency(type.totalDiscountAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {discountService.formatCurrency(type.averageValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Discounts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Discounts</CardTitle>
          <CardDescription>
            Highest usage and revenue impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerforming.slice(0, 5).map((discount, index) => {
              const usageRate = discountService.calculateUsageRate(discount);
              const performanceLevel = discountService.getDiscountPerformanceLevel(discount);
              
              return (
                <div key={discount._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium font-mono">{discount.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {discount.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant={performanceLevel === 'excellent' ? 'default' : 
                               performanceLevel === 'good' ? 'secondary' : 'outline'}
                    >
                      {performanceLevel}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {discount.analytics.totalUses} uses
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {discountService.formatCurrency(discount.analytics.totalDiscountAmount)}
                      </div>
                    </div>
                    <div className="w-16">
                      <Progress value={usageRate} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {usageRate}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Marketing campaign effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{campaign._id || 'Unknown Campaign'}</div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.count} discount{campaign.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {campaign.totalUses} uses
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {discountService.formatCurrency(campaign.totalDiscountAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {campaign.averageUsage.toFixed(1)} uses per discount
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Trends */}
      {usageTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>
              Recent usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageTrends.slice(0, 7).map((trend, index) => (
                <div key={trend._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{trend._id}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {trend.totalUses} uses
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {discountService.formatCurrency(trend.totalDiscount)} saved
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {discountService.formatCurrency(trend.totalOrder)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        total revenue
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}