'use client';

import { DashboardLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/layout";
import { WithAuth } from "@/components/auth";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  Calendar, RefreshCw, Sparkles, Target, Zap, Shield, Crown, Star, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import dashboardService from "@/lib/services/dashboard.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Utility function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Utility function to format numbers
const formatNumber = (value: number): string => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getComprehensiveStats(dateRange);
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 60 seconds for active users
    const interval = setInterval(() => {
      dashboardService.getActiveUsers().then((activeUsers) => {
        setStats((prev: any) => ({
          ...prev,
          activeUsers
        }));
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [dateRange]);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): { value: string; isPositive: boolean } => {
    if (!previous || previous === 0) return { value: '0%', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isPositive: change >= 0
    };
  };

  // Transform real data for charts
  const revenueChartData = stats?.dashboard?.revenueByPeriod || [];
  const subscriptionTrend = stats?.subscribers?.growthTrend || [];
  const planDistribution = stats?.subscribers?.planDistribution || [
    { name: 'Basic', value: stats?.subscribers?.basicCount || 0, color: '#3b82f6' },
    { name: 'Pro', value: stats?.subscribers?.proCount || 0, color: '#8b5cf6' },
    { name: 'Enterprise', value: stats?.subscribers?.enterpriseCount || 0, color: '#ec4899' },
  ];
  const transactionTrend = stats?.transactions?.monthlyTrend || [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  // Loading skeleton
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4  pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Loading your overview...</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 rounded-xl border bg-card p-6 animate-pulse">
              <div className="h-80 bg-muted rounded"></div>
            </div>
            <div className="col-span-3 rounded-xl border bg-card p-6 animate-pulse">
              <div className="h-80 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back, {user?.fullName || user?.firstName || 'User'}!</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchDashboardData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Extract data from stats
  const revenueChange = stats?.dashboard?.revenue
    ? calculateChange(stats.dashboard.revenue, stats.dashboard.previousRevenue || 0)
    : { value: '0%', isPositive: true };

  const usersChange = stats?.subscribers?.totalSubscribers
    ? calculateChange(stats.subscribers.totalSubscribers, stats.subscribers.previousTotal || 0)
    : { value: '0%', isPositive: true };

  const salesChange = stats?.transactions?.totalTransactions
    ? calculateChange(stats.transactions.totalTransactions, stats.transactions.previousTotal || 0)
    : { value: '0%', isPositive: true };

  // Safe number display
  const displayRevenue = stats?.dashboard?.revenue || stats?.transactions?.totalAmount || 0;
  const displaySubscribers = stats?.subscribers?.totalSubscribers || 0;
  const displayTransactions = stats?.transactions?.totalTransactions || 0;
  const displayActiveUsers = stats?.activeUsers || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 w-full">
        {/* Page Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 ">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  Welcome back, {user?.fullName || user?.firstName || 'User'}!
                  <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-white/90 text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Here's your business performance overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-10 w-[180px] rounded-lg  bg-white/20 backdrop-blur-sm text-white font-medium shadow-lg hover:bg-white/30 transition-all border-0">
                  <Calendar className="w-4 h-4 mr-2 text-white" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={fetchDashboardData}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 shadow-lg"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Grid with Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${revenueChange.isPositive ? 'bg-white/20' : 'bg-red-500/20'
                  }`}>
                  {revenueChange.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                  <span className="text-sm font-bold text-white">{revenueChange.value}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(displayRevenue)}
              </p>
              <p className="text-white/70 text-xs">vs previous period</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Total Subscribers - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${usersChange.isPositive ? 'bg-white/20' : 'bg-red-500/20'
                  }`}>
                  {usersChange.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                  <span className="text-sm font-bold text-white">{usersChange.value}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Subscribers</p>
              <p className="text-3xl font-bold text-white mb-2">
                {formatNumber(displaySubscribers)}
              </p>
              <p className="text-white/70 text-xs">vs previous period</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Total Transactions - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${salesChange.isPositive ? 'bg-white/20' : 'bg-red-500/20'
                  }`}>
                  {salesChange.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                  <span className="text-sm font-bold text-white">{salesChange.value}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-white mb-2">
                {formatNumber(displayTransactions)}
              </p>
              <p className="text-white/70 text-xs">vs previous period</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Active Now - Animated Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Activity className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-white">Live</span>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Active Now</p>
              <p className="text-3xl font-bold text-white mb-2">
                {formatNumber(displayActiveUsers)}
              </p>
              <p className="text-white/70 text-xs">Real-time active users</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Additional Insights Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Subscribers Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Rate</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats?.subscribers?.totalSubscribers
                      ? Math.round((stats.subscribers.activeSubscribers / stats.subscribers.totalSubscribers) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Subscribers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats?.subscribers?.activeSubscribers || 0)}
              </p>
            </div>
          </div>

          {/* Transaction Volume Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Txns</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(stats?.transactions?.totalTransactions || 0)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction Volume</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.transactions?.totalAmount || 0)}
              </p>
            </div>
          </div>

          {/* Average Transaction Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Per Transaction</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">AVG</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Transaction</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  stats?.transactions?.totalTransactions
                    ? (stats.transactions.totalAmount / stats.transactions.totalTransactions)
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        {stats?.dashboard?.recentActivity && stats.dashboard.recentActivity.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest transactions and events</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {stats.dashboard.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${activity.type === 'subscription'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                      : activity.type === 'payment'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      } shadow-lg group-hover:scale-110 transition-transform`}>
                      {activity.type === 'subscription' ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.description || 'Activity'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(activity.amount)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Success Rate</p>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">98.5%</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Conversion Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">12.3%</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Avg. Response</p>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">1.2s</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Uptime</p>
            </div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">99.9%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue & Profit Chart */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Revenue & Profit</CardTitle>
                    <CardDescription>Monthly performance overview</CardDescription>
                  </div>
                </div>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No revenue data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Trend Chart */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Subscription Growth</CardTitle>
                    <CardDescription>Subscriber trends over time</CardDescription>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={subscriptionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="subscribers"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No subscription trend data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Distribution Chart */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Plan Distribution</CardTitle>
                    <CardDescription>Subscriber breakdown by plan</CardDescription>
                  </div>
                </div>
                <Crown className="w-5 h-5 text-pink-500" />
              </div>
            </CardHeader>
            <CardContent>
              {planDistribution.filter((p: any) => p.value > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={planDistribution.filter((p: any) => p.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No plan distribution data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Volume Bar Chart */}
          <Card className="shadow-lg border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Transaction Volume</CardTitle>
                    <CardDescription>Transaction trends over time</CardDescription>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              {transactionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transactionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Transactions" />
                    <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transaction data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WithAuth(Home);
