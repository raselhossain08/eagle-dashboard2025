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

// Mock data - replace with real API calls
const mockOverviewData = {
  metrics: {
    totalEvents: { current: 15420, previous: 12350, change: 24.8 },
    uniqueUsers: { current: 2890, previous: 2456, change: 17.7 },
    pageViews: { current: 8760, previous: 7234, change: 21.1 },
    conversions: { current: 234, previous: 189, change: 23.8 }
  },
  topEvents: [
    { eventType: 'page_view', eventName: 'Dashboard View', count: 3456, uniqueUsers: 1234 },
    { eventType: 'click', eventName: 'Contract Create', count: 1890, uniqueUsers: 890 },
    { eventType: 'form_submission', eventName: 'Login Form', count: 1234, uniqueUsers: 567 },
    { eventType: 'conversion', eventName: 'Subscription Purchase', count: 234, uniqueUsers: 234 }
  ],
  breakdowns: {
    devices: [
      { deviceType: 'desktop', count: 8900, uniqueUsers: 1567 },
      { deviceType: 'mobile', count: 4200, uniqueUsers: 890 },
      { deviceType: 'tablet', count: 2320, uniqueUsers: 433 }
    ],
    geographic: [
      { country: 'United States', count: 5670, uniqueUsers: 1234 },
      { country: 'Canada', count: 2890, uniqueUsers: 567 },
      { country: 'United Kingdom', count: 2340, uniqueUsers: 456 },
      { country: 'Germany', count: 1890, uniqueUsers: 345 },
      { country: 'France', count: 1560, uniqueUsers: 289 }
    ],
    trafficSources: [
      { source: 'google', medium: 'organic', campaign: null, count: 4567, uniqueUsers: 1234 },
      { source: 'direct', medium: 'none', campaign: null, count: 3456, uniqueUsers: 890 },
      { source: 'facebook', medium: 'social', campaign: 'q4_campaign', count: 2345, uniqueUsers: 567 },
      { source: 'email', medium: 'email', campaign: 'newsletter', count: 1234, uniqueUsers: 345 }
    ]
  }
};

const mockTimelineData = [
  { date: '2024-01-01', pageViews: 1200, uniqueUsers: 320, conversions: 15 },
  { date: '2024-01-02', pageViews: 1400, uniqueUsers: 380, conversions: 18 },
  { date: '2024-01-03', pageViews: 1100, uniqueUsers: 290, conversions: 12 },
  { date: '2024-01-04', pageViews: 1600, uniqueUsers: 420, conversions: 22 },
  { date: '2024-01-05', pageViews: 1800, uniqueUsers: 480, conversions: 28 },
  { date: '2024-01-06', pageViews: 1300, uniqueUsers: 350, conversions: 16 },
  { date: '2024-01-07', pageViews: 1500, uniqueUsers: 400, conversions: 20 }
];

const mockRealtimeData = {
  activeUsers: 45,
  recentEvents: [
    { eventType: 'page_view', eventName: 'Dashboard View', timestamp: new Date(), userId: '1' },
    { eventType: 'click', eventName: 'Contract Create', timestamp: new Date(), userId: '2' },
    { eventType: 'form_submission', eventName: 'Login Form', timestamp: new Date(), userId: '3' }
  ],
  pageViewsTimeline: [
    { _id: '2024-01-07 14:00', count: 12 },
    { _id: '2024-01-07 14:01', count: 15 },
    { _id: '2024-01-07 14:02', count: 8 },
    { _id: '2024-01-07 14:03', count: 18 },
    { _id: '2024-01-07 14:04', count: 22 }
  ]
};

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
const RealtimeEvents: React.FC = () => {
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
            <Badge variant="secondary">{mockRealtimeData.activeUsers}</Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {mockRealtimeData.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{event.eventName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{event.eventType}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(event.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
              ))}
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
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(mockOverviewData);
  
  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

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
              value={data.metrics.totalEvents.current}
              previousValue={data.metrics.totalEvents.previous}
              change={data.metrics.totalEvents.change}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Unique Users"
              value={data.metrics.uniqueUsers.current}
              previousValue={data.metrics.uniqueUsers.previous}
              change={data.metrics.uniqueUsers.change}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Page Views"
              value={data.metrics.pageViews.current}
              previousValue={data.metrics.pageViews.previous}
              change={data.metrics.pageViews.change}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Conversions"
              value={data.metrics.conversions.current}
              previousValue={data.metrics.conversions.previous}
              change={data.metrics.conversions.change}
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
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')} />
                    <Legend />
                    <Line type="monotone" dataKey="pageViews" stroke="#0088FE" name="Page Views" />
                    <Line type="monotone" dataKey="uniqueUsers" stroke="#00C49F" name="Unique Users" />
                    <Line type="monotone" dataKey="conversions" stroke="#FFBB28" name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <RealtimeEvents />
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
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.breakdowns.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ deviceType, count }) => `${deviceType}: ${formatNumber(count)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.breakdowns.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.deviceType as keyof typeof DEVICE_COLORS] || COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                  {data.topEvents.slice(0, 5).map((event, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  {data.breakdowns.geographic.slice(0, 5).map((geo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{geo.country}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(geo.count)}</div>
                        <div className="text-xs text-muted-foreground">{formatNumber(geo.uniqueUsers)} users</div>
                      </div>
                    </div>
                  ))}
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.breakdowns.trafficSources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" name="Total Events" />
                  <Bar dataKey="uniqueUsers" fill="#00C49F" name="Unique Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}