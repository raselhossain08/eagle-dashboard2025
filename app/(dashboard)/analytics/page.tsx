"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import analyticsService from '@/lib/services/analytics.service';

// Color schemes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const DEVICE_COLORS = { desktop: '#0088FE', mobile: '#00C49F', tablet: '#FFBB28' };

// Utility function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  previousValue: number;
  change: number;
  icon: React.ReactNode;
  format?: (value: number) => string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  icon,
  format = formatNumber
}) => {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{format(value)}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time Events Component
interface RealtimeEventsProps {
  realtimeData: any;
  isLoading: boolean;
}

const RealtimeEvents: React.FC<RealtimeEventsProps> = ({ realtimeData, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Events
          </CardTitle>
          <CardDescription>Live user activity on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time Events
        </CardTitle>
        <CardDescription>Live user activity on your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <Badge variant="secondary">{realtimeData?.activeUsers || 0}</Badge>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {realtimeData?.recentEvents?.length > 0 ? (
                realtimeData.recentEvents.map((event: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{event.eventName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{event.eventType}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Analytics Dashboard Component
export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case '1d':
        startDate = subDays(endDate, 1);
        break;
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  // Fetch analytics data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();

      // Fetch overview data
      const overviewData = await analyticsService.getOverviewData(startDate, endDate);

      // Transform API response to match our component structure
      const transformedData = {
        metrics: {
          totalEvents: {
            current: overviewData?.stats?.totalPageViews || 0,
            previous: 0,
            change: 0
          },
          uniqueUsers: {
            current: overviewData?.stats?.uniqueVisitors || 0,
            previous: 0,
            change: 0
          },
          pageViews: {
            current: overviewData?.stats?.totalPageViews || 0,
            previous: 0,
            change: 0
          },
          conversions: {
            current: overviewData?.conversion?.funnel?.[3]?.users || 0,
            previous: 0,
            change: 0
          }
        },
        topEvents: (overviewData?.recentEvents?.data || []).map((event: any) => ({
          eventType: event.type || 'unknown',
          eventName: event.action || 'Unknown',
          count: 1,
          uniqueUsers: 1,
          timestamp: event.timestamp
        })),
        topPages: (overviewData?.topPages?.data || []).map((page: any) => ({
          page: page.page?.title || page.page?.path || 'Unknown',
          views: page.views || 0,
          uniqueViews: page.uniqueViews || 0
        })),
        conversion: {
          funnel: overviewData?.conversion?.funnel || []
        },
        breakdowns: {
          devices: (overviewData?.devices?.data || []).map((device: any) => ({
            deviceType: device.name || 'unknown',
            count: device.value || 0,
            uniqueUsers: device.value || 0
          })),
          geographic: [],
          trafficSources: overviewData?.trafficSources?.data || []
        }
      };

      setData(transformedData);

      // Generate timeline data from traffic sources
      if (overviewData?.trafficSources?.data) {
        const timeline = overviewData.trafficSources.data.map((item: any) => ({
          date: item.month || new Date().toISOString(),
          pageViews: (item.organic + item.paid + item.direct + item.social + item.referral) || 0,
          uniqueUsers: 0,
          conversions: 0
        }));
        setTimelineData(timeline);
      }

    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real-time data
  const fetchRealtimeData = async () => {
    try {
      const realtime = await analyticsService.getRealtimeData();

      // Transform realtime data
      const transformedRealtime = {
        activeUsers: realtime?.current?.activeUsers || 0,
        recentEvents: (realtime?.topPages || []).map((page: any) => ({
          eventType: 'page_view',
          eventName: page.page || 'Unknown Page',
          timestamp: new Date().toISOString(),
          userId: null
        })),
        pageViewsTimeline: [],
        locations: realtime?.locations || []
      };

      setRealtimeData(transformedRealtime);

      // Update geographic data in main data if available
      if (realtime?.locations && data) {
        setData({
          ...data,
          breakdowns: {
            ...data.breakdowns,
            geographic: realtime.locations.map((loc: any) => ({
              country: loc.country,
              count: loc.users,
              uniqueUsers: loc.users
            }))
          }
        });
      }
    } catch (err) {
      console.error('Error fetching realtime data:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchRealtimeData();

    // Set up real-time data refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  // Refresh data
  const refreshData = async () => {
    await fetchData();
    await fetchRealtimeData();
  };

  // Export data
  const handleExport = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      await analyticsService.exportAnalyticsData(startDate, endDate, 'json', ['sessions', 'events']);
      // Handle the export download
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior and platform performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Period Selector */}
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList>
              <TabsTrigger value="1d">Last 24 Hours</TabsTrigger>
              <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
              <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedPeriod} className="space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total Events"
                  value={data?.metrics?.totalEvents?.current || 0}
                  previousValue={data?.metrics?.totalEvents?.previous || 0}
                  change={data?.metrics?.totalEvents?.change || 0}
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                  title="Unique Users"
                  value={data?.metrics?.uniqueUsers?.current || 0}
                  previousValue={data?.metrics?.uniqueUsers?.previous || 0}
                  change={data?.metrics?.uniqueUsers?.change || 0}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                  title="Page Views"
                  value={data?.metrics?.pageViews?.current || 0}
                  previousValue={data?.metrics?.pageViews?.previous || 0}
                  change={data?.metrics?.pageViews?.change || 0}
                  icon={<Eye className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                  title="Conversions"
                  value={data?.metrics?.conversions?.current || 0}
                  previousValue={data?.metrics?.conversions?.previous || 0}
                  change={data?.metrics?.conversions?.change || 0}
                  icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Timeline Chart */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Traffic Trends</CardTitle>
                    <CardDescription>Page views and user activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {timelineData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                              try {
                                const date = new Date(value);
                                return isNaN(date.getTime()) ? value : format(date, 'MMM d');
                              } catch {
                                return value;
                              }
                            }}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(value) => {
                              try {
                                const date = new Date(value);
                                return isNaN(date.getTime()) ? value : format(date, 'MMM d, yyyy');
                              } catch {
                                return value;
                              }
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="pageViews" stroke="#0088FE" name="Page Views" />
                          <Line type="monotone" dataKey="uniqueUsers" stroke="#00C49F" name="Unique Users" />
                          <Line type="monotone" dataKey="conversions" stroke="#FFBB28" name="Conversions" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">No timeline data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Real-time Activity */}
                <RealtimeEvents realtimeData={realtimeData} isLoading={isLoading} />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Device Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Device Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.breakdowns?.devices?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={data.breakdowns.devices}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ deviceType, count }: any) => `${deviceType}: ${formatNumber(count)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {data.breakdowns.devices.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.deviceType as keyof typeof DEVICE_COLORS] || COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-sm text-muted-foreground">No device data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MousePointer className="h-5 w-5" />
                      Top Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.topEvents?.length > 0 ? (
                        data.topEvents.slice(0, 5).map((event: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{event.eventName}</span>
                              <span className="text-xs text-muted-foreground capitalize">{event.eventType}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatNumber(event.count)}</div>
                              <div className="text-xs text-muted-foreground">{formatNumber(event.uniqueUsers)} users</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No event data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Top Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.topPages?.length > 0 ? (
                        data.topPages.slice(0, 5).map((page: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{page.page}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatNumber(page.views)}</div>
                              <div className="text-xs text-muted-foreground">{formatNumber(page.uniqueViews)} unique</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No page data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Geographic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.breakdowns?.geographic?.length > 0 ? (
                        data.breakdowns.geographic.slice(0, 5).map((geo: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{geo.country}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatNumber(geo.count)}</div>
                              <div className="text-xs text-muted-foreground">{formatNumber(geo.uniqueUsers)} users</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No geographic data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Conversion Funnel */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Conversion Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.conversion?.funnel?.length > 0 ? (
                        data.conversion.funnel.map((step: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded bg-muted/50">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{step.step}</span>
                              <span className="text-xs text-muted-foreground">{step.conversionRate.toFixed(1)}% conversion</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatNumber(step.users)} users</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No conversion data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your users are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.breakdowns?.trafficSources?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.breakdowns.trafficSources}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="organic" fill="#0088FE" name="Organic" />
                        <Bar dataKey="paid" fill="#00C49F" name="Paid" />
                        <Bar dataKey="direct" fill="#FFBB28" name="Direct" />
                        <Bar dataKey="social" fill="#FF8042" name="Social" />
                        <Bar dataKey="referral" fill="#8884d8" name="Referral" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">No traffic source data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}