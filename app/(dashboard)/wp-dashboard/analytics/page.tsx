"use client";

import { useState, useEffect } from "react";
import { AnalyticsOverview } from "@/components/wordpress/analytics/analytics-overview";
import { UserAnalyticsCard } from "@/components/wordpress/analytics/user-analytics-card";
import { ContentAnalyticsCard } from "@/components/wordpress/analytics/content-analytics-card";
import { ApiStatusCard } from "@/components/wordpress/analytics/api-status-card";
import { WooCommerceCard } from "@/components/wordpress/analytics/woocommerce-card";
import { analyticsService } from "@/wordpress/services/analyticsService";
import { AnalyticsResponse } from "@/wordpress/types/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await analyticsService.getAnalytics();
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export analytics data");
  };

  if (loading && !refreshing) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">Error: {error}</div>
            <Button onClick={() => fetchAnalytics()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your site analytics and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Timeframe Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-sm text-muted-foreground">Timeframe: </span>
              <span className="text-sm font-medium">
                {analyticsService.getTimeframeDisplay(data.timeframe)}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Last Updated:{" "}
              </span>
              <span className="text-sm font-medium">
                {analyticsService.formatDate(data.generated_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <AnalyticsOverview data={data.data} />

      {/* Detailed Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserAnalyticsCard userAnalytics={data.data.user_analytics} />
        </div>
        <ContentAnalyticsCard contentAnalytics={data.data.content_analytics} />
        <ApiStatusCard apiAnalytics={data.data.api_analytics} />
        <WooCommerceCard
          woocommerceAnalytics={data.data.woocommerce_analytics}
        />
        <SiteInfoCard siteInfo={data.data.site_info} />
      </div>
    </div>
  );
}

// Site Info Card Component
function SiteInfoCard({ siteInfo }: { siteInfo: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Information</CardTitle>
        <CardDescription>Technical details about your site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Site Name:</span>
            <span className="text-sm font-medium">{siteInfo.site_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Site URL:</span>
            <span className="text-sm font-medium truncate max-w-[200px]">
              {siteInfo.site_url}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">WordPress:</span>
            <span className="text-sm font-medium">
              {siteInfo.wordpress_version}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Plugin Version:
            </span>
            <span className="text-sm font-medium">
              {siteInfo.plugin_version}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
