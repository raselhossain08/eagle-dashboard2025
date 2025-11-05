"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Percent,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Zap,
  Target,
  Gift,
  RefreshCw
} from "lucide-react";
import DiscountService, { 
  DiscountCode, 
  DiscountType, 
  DiscountStatus,
  DiscountApplication,
  Campaign,
  DiscountAnalytics,
  DiscountRedemption
} from "@/lib/services/discount.service";
import { toast } from "sonner";

export default function AdvancedDiscountManagement() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [filters, setFilters] = useState({
    status: '' as DiscountStatus | '',
    type: '' as DiscountType | '',
    search: '',
    campaignId: ''
  });

  const discountService = DiscountService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Filter out empty string values
      const cleanFilters = {
        status: filters.status || undefined,
        type: filters.type || undefined,
        search: filters.search || undefined,
        campaignId: filters.campaignId || undefined
      };
      
      const [codesResult, campaignsResult, analyticsResult] = await Promise.all([
        discountService.getDiscountCodes(cleanFilters),
        discountService.getCampaigns(),
        discountService.getDiscountAnalytics()
      ]);
      
      setDiscountCodes(codesResult.codes);
      setCampaigns(campaignsResult.campaigns);
      setAnalytics(analyticsResult);
    } catch (error) {
      toast.error('Failed to load discount data');
      console.error('Error loading discount data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (codeId: string, newStatus: DiscountStatus) => {
    try {
      await discountService.toggleDiscountCode(codeId, newStatus);
      toast.success('Discount code status updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      await discountService.deleteDiscountCode(codeId);
      toast.success('Discount code deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete discount code');
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const exportCodes = async () => {
    try {
      // Filter out empty string values for export
      const exportFilters = {
        status: filters.status || undefined,
        campaignId: filters.campaignId || undefined
      };
      
      const csvData = await discountService.exportCodes(exportFilters);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'discount-codes.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Codes exported successfully');
    } catch (error) {
      toast.error('Failed to export codes');
    }
  };

  const getStatusColor = (status: DiscountStatus) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: DiscountStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <Clock className="w-4 h-4 text-gray-600" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: DiscountType) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed_amount': return <DollarSign className="w-4 h-4" />;
      case 'free_trial_days': return <Calendar className="w-4 h-4" />;
      case 'first_period_only': return <Zap className="w-4 h-4" />;
      case 'recurring_discount': return <RefreshCw className="w-4 h-4" />;
      case 'plan_specific': return <Target className="w-4 h-4" />;
      case 'invoice_level': return <Gift className="w-4 h-4" />;
      default: return <Percent className="w-4 h-4" />;
    }
  };

  const formatDiscountValue = (code: DiscountCode) => {
    switch (code.type) {
      case 'percentage':
        return `${code.value}%`;
      case 'fixed_amount':
        return `$${code.value}`;
      case 'free_trial_days':
        return `${code.freeTrialDays || code.value} days`;
      default:
        return `${code.value}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Discount Codes & Promotions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create and manage discount codes, promotions, and campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportCodes}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Code
          </Button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Codes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.overview.activeCodes}
                  </p>
                  <p className="text-xs text-gray-500">
                    {analytics.overview.totalCodes} total
                  </p>
                </div>
                <Percent className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.overview.totalRedemptions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(analytics.overview.conversionRate * 100).toFixed(1)}% conversion
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${analytics.overview.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${analytics.overview.totalDiscountGiven.toLocaleString()} discounted
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${analytics.overview.averageDiscountValue.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Top: {analytics.overview.topPerformingCode}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="codes">Discount Codes</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Control</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common discount management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button className="h-24 flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  <span>Create Single Code</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Copy className="w-6 h-6" />
                  <span>Bulk Generate</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest discount code usage and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock recent activity */}
                {[
                  { code: 'SAVE20', action: 'redeemed', user: 'john@example.com', amount: '$25.00', time: '2 minutes ago' },
                  { code: 'WELCOME10', action: 'created', user: 'admin', amount: '10%', time: '1 hour ago' },
                  { code: 'BLACK50', action: 'redeemed', user: 'sarah@example.com', amount: '$50.00', time: '2 hours ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.action === 'redeemed' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium">{activity.code}</div>
                        <div className="text-sm text-gray-600">
                          {activity.action} by {activity.user}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{activity.amount}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discountCodes.slice(0, 5).map((code) => (
                    <div key={code.id || code._id || code.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(code.type)}
                        <div>
                          <div className="font-medium">{code.code}</div>
                          <div className="text-sm text-gray-600">{code.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{code.currentUses} uses</div>
                        <div className="text-sm text-gray-600">{formatDiscountValue(code)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-600">{campaign.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{campaign.discountCodes.length} codes</div>
                        <Badge className={getStatusColor(campaign.status as any)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discount Codes Tab */}
        <TabsContent value="codes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search codes..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as DiscountStatus }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as DiscountType }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_trial_days">Free Trial</SelectItem>
                    <SelectItem value="first_period_only">First Period</SelectItem>
                    <SelectItem value="recurring_discount">Recurring</SelectItem>
                    <SelectItem value="plan_specific">Plan Specific</SelectItem>
                    <SelectItem value="invoice_level">Invoice Level</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={loadData}>
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discount Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Codes</CardTitle>
              <CardDescription>
                Manage your discount codes and promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes.map((code) => (
                    <TableRow key={code.id || code._id || code.code}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCodeToClipboard(code.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{code.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(code.type)}
                          <span className="text-sm capitalize">
                            {code.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatDiscountValue(code)}</div>
                        {code.application === 'recurring' && (
                          <div className="text-xs text-gray-600">Recurring</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {code.currentUses}
                          {code.maxUses && ` / ${code.maxUses}`}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ 
                              width: code.maxUses 
                                ? `${Math.min((code.currentUses / code.maxUses) * 100, 100)}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(code.status)}
                          <Badge className={getStatusColor(code.status)}>
                            {code.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {code.endDate ? new Date(code.endDate).toLocaleDateString() : 'No expiry'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => code.id && handleStatusChange(code.id, code.status === 'active' ? 'paused' : 'active')}
                          >
                            {code.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => code.id && handleDeleteCode(code.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Marketing Campaigns</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status as any)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Codes:</span>
                      <span>{campaign.discountCodes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Start Date:</span>
                      <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                    {campaign.endDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End Date:</span>
                        <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {campaign.metrics && (
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600">Redemptions</div>
                            <div className="font-medium">{campaign.metrics.redemptions}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Revenue</div>
                            <div className="font-medium">${campaign.metrics.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Revenue Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>Impact of discount codes on revenue and customer behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${analytics.revenueAnalysis.incrementalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Incremental Revenue</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        ${analytics.revenueAnalysis.cannibalization.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Cannibalization</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        ${analytics.revenueAnalysis.netRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Net Revenue Impact</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analysis</CardTitle>
                  <CardDescription>Customer acquisition and retention metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {(analytics.customerAnalysis.newCustomerRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">New Customers</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        ${analytics.customerAnalysis.customerLifetimeValue.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">Customer LTV</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {(analytics.customerAnalysis.retentionRates.thirtyDays * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">30-Day Retention</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {(analytics.customerAnalysis.retentionRates.ninetyDays * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">90-Day Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Channel Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>Performance breakdown by marketing channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.channelPerformance.map((channel, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium capitalize">{channel.channel}</div>
                            <div className="text-sm text-gray-600">
                              {channel.redemptions} redemptions • {(channel.conversionRate * 100).toFixed(1)}% conversion
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${channel.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            ${channel.averageOrderValue.toFixed(0)} AOV
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Fraud Control Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection & Prevention</CardTitle>
              <CardDescription>Monitor and prevent fraudulent discount code usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fraud Protection Active:</strong> Advanced algorithms monitor redemption patterns, 
                  velocity, and geographical anomalies to prevent abuse.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fraud Attempts</p>
                        <p className="text-2xl font-bold text-red-600">0</p>
                        <p className="text-xs text-gray-500">Last 24 hours</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                        <p className="text-2xl font-bold text-orange-600">3</p>
                        <p className="text-xs text-gray-500">Auto-blocked</p>
                      </div>
                      <Shield className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">99.7%</p>
                        <p className="text-xs text-gray-500">Legitimate usage</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}