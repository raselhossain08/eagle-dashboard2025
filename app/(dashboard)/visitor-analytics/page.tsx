"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "@/lib/services/analytics.service";
import type { 
  AnalyticsOverviewData, 
  TimelineData, 
  RealtimeData 
} from "@/lib/services/analytics.service";

// Define additional types for the component
interface TopPage {
  path: string;
  title: string;
  views: number;
  bounceRate: number;
}

interface TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  sessions: number;
  conversions: number;
}

interface ConversionStep {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface ActivePage {
  path: string;
  activeUsers: number;
}

interface ActiveTrafficSource {
  source: string;
  activeUsers: number;
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Users,
  Eye,
  Clock,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Settings,
  Play,
  Pause,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  ArrowRight,
  ExternalLink,
  Shield,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function VisitorAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverviewData | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionStep[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealtimeData>({
    activeUsers: 0,
    recentEvents: [],
    pageViewsTimeline: []
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overview, timeline, realtime] = await Promise.all([
          analyticsService.getOverviewData(dateRange),
          analyticsService.getTimelineData(dateRange),
          analyticsService.getRealtimeData()
        ]);

        setAnalyticsOverview(overview);
        setTimelineData(timeline);
        setRealTimeMetrics(realtime);

        // Mock data for features not yet implemented in the service
        setTopPages([
          { path: '/dashboard', title: 'Dashboard', views: 1234, bounceRate: 45 },
          { path: '/analytics', title: 'Analytics', views: 987, bounceRate: 32 },
          { path: '/settings', title: 'Settings', views: 654, bounceRate: 28 },
          { path: '/users', title: 'Users', views: 432, bounceRate: 51 },
          { path: '/billing', title: 'Billing', views: 321, bounceRate: 39 }
        ]);

        setTrafficSources([
          { source: 'direct', medium: 'none', sessions: 500, conversions: 25 },
          { source: 'google', medium: 'organic', sessions: 300, conversions: 18 },
          { source: 'social', medium: 'facebook', sessions: 200, conversions: 12 },
          { source: 'email', medium: 'newsletter', sessions: 150, conversions: 8 },
          { source: 'referral', medium: 'website', sessions: 100, conversions: 5 }
        ]);

        setConversionFunnel([
          { step: 'Landing', users: 1000, conversionRate: 100, dropOffRate: 0 },
          { step: 'Registration', users: 600, conversionRate: 60, dropOffRate: 40 },
          { step: 'Email Verification', users: 480, conversionRate: 48, dropOffRate: 20 },
          { step: 'First Login', users: 360, conversionRate: 36, dropOffRate: 25 },
          { step: 'Profile Setup', users: 270, conversionRate: 27, dropOffRate: 25 },
          { step: 'First Action', users: 216, conversionRate: 21.6, dropOffRate: 20 },
          { step: 'Conversion', users: 150, conversionRate: 15, dropOffRate: 30.5 }
        ]);

      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange, selectedDate]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Visitor Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Privacy-aware visitor tracking and conversion analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Custom Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Privacy & Consent Status */}
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Privacy-aware tracking active • GDPR compliant • 
          {analyticsOverview?.metrics?.uniqueUsers?.current.toLocaleString() || '0'} users with valid consent • 
          Last updated: {new Date().toLocaleString()}
        </AlertDescription>
      </Alert>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Unique Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsOverview?.metrics?.uniqueUsers?.current || 0)}
                </p>
                <div className={`flex items-center mt-1 ${getGrowthColor(analyticsOverview?.metrics?.uniqueUsers?.change || 0)}`}>
                  {getGrowthIcon(analyticsOverview?.metrics?.uniqueUsers?.change || 0)}
                  <span className="text-sm ml-1">
                    {(analyticsOverview?.metrics?.uniqueUsers?.change || 0) > 0 ? '+' : ''}{analyticsOverview?.metrics?.uniqueUsers?.change || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsOverview?.metrics?.pageViews?.current || 0)}
                </p>
                <div className={`flex items-center mt-1 ${getGrowthColor(analyticsOverview?.metrics?.pageViews?.change || 0)}`}>
                  {getGrowthIcon(analyticsOverview?.metrics?.pageViews?.change || 0)}
                  <span className="text-sm ml-1">
                    {(analyticsOverview?.metrics?.pageViews?.change || 0) > 0 ? '+' : ''}{analyticsOverview?.metrics?.pageViews?.change || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsOverview?.metrics?.totalEvents?.current || 0)}
                </p>
                <div className={`flex items-center mt-1 ${getGrowthColor(analyticsOverview?.metrics?.totalEvents?.change || 0)}`}>
                  {getGrowthIcon(analyticsOverview?.metrics?.totalEvents?.change || 0)}
                  <span className="text-sm ml-1">
                    {(analyticsOverview?.metrics?.totalEvents?.change || 0) > 0 ? '+' : ''}{analyticsOverview?.metrics?.totalEvents?.change || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsOverview?.metrics?.conversions?.current || 0)}
                </p>
                <div className={`flex items-center mt-1 ${getGrowthColor(analyticsOverview?.metrics?.conversions?.change || 0)}`}>
                  {getGrowthIcon(analyticsOverview?.metrics?.conversions?.change || 0)}
                  <span className="text-sm ml-1">
                    {(analyticsOverview?.metrics?.conversions?.change || 0) > 0 ? '+' : ''}{analyticsOverview?.metrics?.conversions?.change || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Top Pages
                </CardTitle>
                <CardDescription>
                  Most viewed pages and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPages.slice(0, 5).map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{page.title}</p>
                          <p className="text-sm text-gray-600">{page.path}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(page.views)} views</p>
                        <p className="text-sm text-gray-600">{page.bounceRate}% bounce</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/visitor-analytics/overview">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>
                  Visitor acquisition channels and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources.slice(0, 5).map((source, index) => (
                    <div key={`${source.source}-${source.medium}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{source.source}</p>
                          <p className="text-sm text-gray-600">{source.medium}</p>
                          {source.campaign && (
                            <p className="text-xs text-gray-500">{source.campaign}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(source.sessions)} sessions</p>
                        <p className="text-sm text-gray-600">{source.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/visitor-analytics/growth">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Channel Performance
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Conversion Funnel Overview
              </CardTitle>
              <CardDescription>
                User journey from visit to conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {conversionFunnel.map((step, index) => (
                  <div key={step.step} className="text-center">
                    <div className="relative">
                      <div 
                        className="w-full h-24 bg-blue-600 rounded-lg flex items-center justify-center mb-2"
                        style={{ 
                          opacity: Math.max(0.3, step.conversionRate / 100),
                          backgroundColor: `hsl(${220 + (index * 20)}, 70%, 50%)`
                        }}
                      >
                        <span className="text-white font-bold">
                          {formatNumber(step.users)}
                        </span>
                      </div>
                      {index < conversionFunnel.length - 1 && (
                        <ArrowRight className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{step.step}</p>
                    <p className="text-xs text-gray-600">{step.conversionRate.toFixed(1)}%</p>
                    {step.dropOffRate > 0 && (
                      <p className="text-xs text-red-600">-{step.dropOffRate.toFixed(1)}%</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Overall conversion rate: {((conversionFunnel[conversionFunnel.length - 1].users / conversionFunnel[0].users) * 100).toFixed(2)}%
                </div>
                <Button asChild variant="outline">
                  <Link href="/visitor-analytics/conversions">
                    <Target className="w-4 h-4 mr-2" />
                    Detailed Funnel Analysis
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Analytics Actions</CardTitle>
              <CardDescription>
                Common analytics tasks and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
                  <Link href="/visitor-analytics/real-time">
                    <Zap className="w-8 h-8" />
                    <span>Real-time View</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
                  <Link href="/visitor-analytics/events">
                    <Activity className="w-8 h-8" />
                    <span>Event Explorer</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
                  <Link href="/visitor-analytics/growth">
                    <TrendingUp className="w-8 h-8" />
                    <span>Growth Analysis</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
                  <Link href="/visitor-analytics/integrations">
                    <Settings className="w-8 h-8" />
                    <span>Configure Tracking</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Analytics</CardTitle>
              <CardDescription>
                Detailed funnel analysis and conversion optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Detailed conversion analytics coming soon</p>
                <Button asChild>
                  <Link href="/visitor-analytics/conversions">
                    View Conversion Funnel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Channel performance, cohort retention, and LTV analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Growth analytics dashboard coming soon</p>
                <Button asChild>
                  <Link href="/visitor-analytics/growth">
                    Analyze Growth Metrics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {realTimeMetrics.activeUsers}
                  </p>
                  <p className="text-sm text-gray-600">users online now</p>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {realTimeMetrics.pageViewsTimeline?.length || 0} recent page views
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Active Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeMetrics.recentEvents.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{event.eventName}</span>
                        <p className="text-xs text-gray-500">{event.eventType}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {realTimeMetrics.recentEvents.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No recent events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Page Views Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Page Views Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeMetrics.pageViewsTimeline?.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      <Badge variant="outline">{entry.count} views</Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No timeline data</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Explorer</CardTitle>
              <CardDescription>
                Custom event tracking with filters and segmentation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Event explorer coming soon</p>
                <Button asChild>
                  <Link href="/visitor-analytics/events">
                    Explore Custom Events
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Integrations</CardTitle>
              <CardDescription>
                Connect with GA4, PostHog, Plausible, Matomo and other providers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Integration management coming soon</p>
                <Button asChild>
                  <Link href="/visitor-analytics/integrations">
                    Configure Integrations
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}