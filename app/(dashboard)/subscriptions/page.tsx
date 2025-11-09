"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Ban,
  RotateCcw,
  Trash2,
  Eye,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  RefreshCw,
  ArrowDown,
  PauseCircle,
  PlayCircle,
  StopCircle,
  ArrowUp,
  RefreshCcw,
  Shuffle,
  Settings,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { SubscriptionService } from "@/lib/services";
import PlanService from "@/lib/services/plans/plan.service";
import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionAnalytics,
  GetSubscriptionsParams,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
} from "@/lib/services/subscriptions/subscription.service";
import type { Plan } from "@/lib/services/plans/plan.service";
import SubscriptionDashboard from "@/components/dashboard/subscriptions/subscription-dashboard";

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false); // Separate loading state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showCancelScheduledConfirm, setShowCancelScheduledConfirm] =
    useState(false);
  const [cancelScheduledTarget, setCancelScheduledTarget] = useState<
    string | null
  >(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);

  // Fetch subscriptions with filters
  const fetchSubscriptions = async (isFilterChange = false) => {
    try {
      // Use filterLoading for filter changes, loading for initial load
      if (isFilterChange) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }

      const params: GetSubscriptionsParams = {
        page: currentPage,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      // Only filter by status on server-side
      if (statusFilter !== "all") params.status = statusFilter;
      // planTypeFilter will be handled client-side for better control

      console.log("🔍 Fetching subscriptions with params:", params);

      const response = await SubscriptionService.getSubscriptions(params);

      if (response.success) {
        console.log("✅ Subscriptions fetched:", response.data.length, "items");
        setSubscriptions(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        throw new Error(response.error || "Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch subscriptions"
      );
    } finally {
      if (isFilterChange) {
        setFilterLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await SubscriptionService.getAnalytics();

      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.error || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // Fetch available plans for plan changes
  const fetchAvailablePlans = async () => {
    try {
      const response = await PlanService.getPlans({ isActive: true });
      if (response.success && response.data) {
        setAvailablePlans(response.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load available plans");
    }
  };

  useEffect(() => {
    // Initial load
    fetchSubscriptions(false);
    fetchAnalytics();
    fetchAvailablePlans();
  }, []);

  // Separate effect for filters to avoid unnecessary reloads
  useEffect(() => {
    if (currentPage !== 1 || statusFilter !== "all") {
      fetchSubscriptions(true);
    }
  }, [currentPage, statusFilter]);

  // Calculate days remaining for each subscription
  const calculateDaysRemaining = (endDate: string | null): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Enhance subscriptions with computed daysRemaining
  const enhancedSubscriptions = subscriptions.map((sub) => ({
    ...sub,
    daysRemaining: calculateDaysRemaining(sub.subscriptionEndDate),
  }));

  // Get unique plan types from current data
  const uniquePlanTypes = React.useMemo(() => {
    const types = new Set<string>();
    enhancedSubscriptions.forEach((sub) => {
      if (sub.planType) {
        types.add(sub.planType);
      }
    });
    return Array.from(types).sort();
  }, [enhancedSubscriptions]);

  // Filter subscriptions by search term and health status
  const filteredSubscriptions = enhancedSubscriptions.filter((sub) => {
    // Safe string operations with null checks
    const userName = sub.name || "";
    const userEmail = sub.email || "";
    const planName = sub.currentPlan || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Plan type filter (client-side) - skip if 'all' is selected
    if (planTypeFilter && planTypeFilter !== "all") {
      const subPlanType = (sub.planType || "").toLowerCase();
      const filterValue = planTypeFilter.toLowerCase();
      console.log(
        `🔍 Filtering - Sub planType: "${subPlanType}", Filter: "${filterValue}", Match: ${
          subPlanType === filterValue
        }`
      );
      if (subPlanType !== filterValue) return false;
    }

    if (healthFilter === "all") return true;

    const daysRemaining = sub.daysRemaining ?? null;
    const isActive = sub.subscriptionStatus === "active";

    switch (healthFilter) {
      case "healthy":
        return isActive && (daysRemaining === null || daysRemaining > 30);
      case "warning":
        return (
          isActive &&
          daysRemaining !== null &&
          daysRemaining <= 30 &&
          daysRemaining > 7
        );
      case "critical":
        return isActive && daysRemaining !== null && daysRemaining <= 7;
      case "inactive":
        return !isActive;
      default:
        return true;
    }
  });

  // Log filter results
  React.useEffect(() => {
    console.log("📊 Filter Status:", {
      totalSubscriptions: enhancedSubscriptions.length,
      filteredSubscriptions: filteredSubscriptions.length,
      planTypeFilter,
      statusFilter,
      healthFilter,
      searchTerm,
      uniquePlanTypes,
    });
  }, [
    filteredSubscriptions.length,
    planTypeFilter,
    statusFilter,
    healthFilter,
    searchTerm,
  ]);

  // Action handlers
  const handleUpdateSubscription = async (
    subscriptionId: string,
    updates: UpdateSubscriptionRequest
  ) => {
    try {
      toast.loading("Updating subscription...", { id: "update-subscription" });
      const response = await SubscriptionService.updateSubscription(
        subscriptionId,
        updates
      );

      if (response.success) {
        toast.success("Subscription updated successfully", {
          id: "update-subscription",
        });
        fetchSubscriptions(false);
        setShowEditDialog(false);
      } else {
        throw new Error(response.error || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
        { id: "update-subscription" }
      );
    }
  };

  const handleCancelSubscription = async (
    subscriptionId: string,
    reason: string
  ) => {
    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      toast.loading("Cancelling subscription...", {
        id: "cancel-subscription",
      });
      const cancelData: CancelSubscriptionRequest = { reason };
      const response = await SubscriptionService.cancelSubscription(
        subscriptionId,
        cancelData
      );

      if (response.success) {
        toast.success("Subscription cancelled successfully", {
          id: "cancel-subscription",
        });
        fetchSubscriptions(false);
        setShowCancelDialog(false);
      } else {
        throw new Error(response.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
        { id: "cancel-subscription" }
      );
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await SubscriptionService.reactivateSubscription(
        subscriptionId
      );

      if (response.success) {
        toast.success("Subscription reactivated successfully");
        fetchSubscriptions();
      } else {
        throw new Error(response.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reactivate subscription"
      );
    }
  };

  const handleSuspendSubscription = async (
    subscriptionId: string,
    reason: string
  ) => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      const response = await SubscriptionService.suspendSubscription(
        subscriptionId,
        reason
      );

      if (response.success) {
        toast.success("Subscription suspended successfully");
        fetchSubscriptions(false);
      } else {
        throw new Error(response.error || "Failed to suspend subscription");
      }
    } catch (error) {
      console.error("Error suspending subscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to suspend subscription"
      );
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const response = await SubscriptionService.resumeSubscription(
        subscriptionId
      );

      if (response.success) {
        toast.success("Subscription resumed successfully");
        fetchSubscriptions();
      } else {
        throw new Error(response.error || "Failed to resume subscription");
      }
    } catch (error) {
      console.error("Error resuming subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to resume subscription"
      );
    }
  };

  const handlePauseSubscription = async (
    subscriptionId: string,
    duration: number,
    reason: string
  ) => {
    try {
      const response = await SubscriptionService.pauseSubscription(
        subscriptionId,
        duration,
        reason
      );

      if (response.success) {
        toast.success(`Subscription paused for ${duration} days`);
        fetchSubscriptions(false);
        setShowPauseDialog(false);
      } else {
        throw new Error(response.error || "Failed to pause subscription");
      }
    } catch (error) {
      console.error("Error pausing subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to pause subscription"
      );
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    // Set the target and show confirmation dialog
    setDeleteTarget(subscriptionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await SubscriptionService.deleteSubscription(
        deleteTarget
      );

      if (response.success) {
        toast.success("Subscription deleted successfully");
        fetchSubscriptions(false);
      } else {
        throw new Error(response.error || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete subscription"
      );
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handlePlanChange = async (
    subscriptionId: string,
    newPlanId: string,
    newBillingCycle: string,
    effectiveDate?: string
  ) => {
    try {
      const selectedPlan = availablePlans.find(
        (plan) => plan._id === newPlanId
      );
      if (!selectedPlan) {
        throw new Error("Selected plan not found");
      }

      // Use the dedicated plan change service method
      const response = await SubscriptionService.changePlan(subscriptionId, {
        newPlanId,
        billingCycle: newBillingCycle,
        effectiveDate,
        prorationMode: effectiveDate ? "next_cycle" : "immediate",
      });

      if (response.success) {
        const changeType = effectiveDate ? "scheduled" : "immediate";
        toast.success(
          `Plan change ${
            changeType === "immediate" ? "completed" : "scheduled"
          } successfully`
        );
        fetchSubscriptions(false);
        setShowPlanChangeDialog(false);
      } else {
        throw new Error(response.error || "Failed to change plan");
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change plan"
      );
    }
  };

  const handleCancelScheduledChange = async (subscriptionId: string) => {
    // Set the target and show confirmation dialog
    setCancelScheduledTarget(subscriptionId);
    setShowCancelScheduledConfirm(true);
  };

  const confirmCancelScheduledChange = async () => {
    if (!cancelScheduledTarget) return;

    try {
      const response = await SubscriptionService.cancelScheduledPlanChange(
        cancelScheduledTarget
      );

      if (response.success) {
        toast.success("Scheduled plan change cancelled successfully");
        fetchSubscriptions(false);
      } else {
        throw new Error(response.error || "Failed to cancel scheduled change");
      }
    } catch (error) {
      console.error("Error cancelling scheduled change:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel scheduled change"
      );
    } finally {
      setShowCancelScheduledConfirm(false);
      setCancelScheduledTarget(null);
    }
  };

  const handleProcessRenewal = async (
    subscriptionId: string,
    paymentId?: string
  ) => {
    try {
      toast.loading("Processing renewal...", { id: "process-renewal" });
      const response = await SubscriptionService.processRenewal(
        subscriptionId,
        paymentId
      );

      if (response.success) {
        toast.success("Subscription renewed successfully", {
          id: "process-renewal",
        });
        fetchSubscriptions(false);
        setShowRenewalDialog(false);
      } else {
        throw new Error(response.error || "Failed to process renewal");
      }
    } catch (error) {
      console.error("Error processing renewal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process renewal",
        { id: "process-renewal" }
      );
    }
  };

  // UI Helper Functions
  const getStatusBadge = (subscriptionStatus: string, isPaused?: boolean) => {
    if (isPaused) {
      return <Badge className="bg-orange-500 text-white">Paused</Badge>;
    }

    const statusConfig = {
      active: { color: "bg-green-500", text: "Active", icon: CheckCircle },
      cancelled: { color: "bg-red-500", text: "Cancelled", icon: XCircle },
      expired: { color: "bg-gray-500", text: "Expired", icon: Clock },
      pending: { color: "bg-yellow-500", text: "Pending", icon: Clock },
      suspended: {
        color: "bg-orange-500",
        text: "Suspended",
        icon: PauseCircle,
      },
      trial: { color: "bg-blue-500", text: "Trial", icon: Zap },
      paused: { color: "bg-orange-500", text: "Paused", icon: PauseCircle },
    };

    const config =
      statusConfig[subscriptionStatus as keyof typeof statusConfig] ||
      statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getHealthBadge = (
    daysRemaining: number | null,
    subscriptionStatus: string
  ) => {
    if (subscriptionStatus !== "active") return null;
    if (daysRemaining === null)
      return <Badge className="bg-purple-500 text-white">Lifetime</Badge>;

    if (daysRemaining <= 7) {
      return (
        <Badge className="bg-red-500 text-white flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Critical
        </Badge>
      );
    }

    if (daysRemaining <= 30) {
      return (
        <Badge className="bg-yellow-500 text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Warning
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Healthy
      </Badge>
    );
  };

  const getDaysRemainingProgress = (
    daysRemaining: number | null,
    billingCycle: string
  ) => {
    if (daysRemaining === null) return 100;

    const totalDays = billingCycle === "monthly" ? 30 : 365;
    const progress = Math.max(
      0,
      Math.min(100, (daysRemaining / totalDays) * 100)
    );
    return progress;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user subscriptions, renewals, and billing cycles
          </p>
        </div>
      </div>
      {/* Analytics Cards */}
      {analytics &&
      analytics.overview &&
      analytics.revenue &&
      analytics.growth ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.overview.activeSubscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.overview.totalSubscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Subscribers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.growth.newSubscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue (MRR)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(analytics.revenue.mrr || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Recurring revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(analytics.overview.churnRate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.churnedSubscribers || 0} churned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(analytics.growth.growthRate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Net: +{analytics.growth.netGrowth || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Tabbed Content */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger
            value="subscriptions"
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Dashboard */}
          <SubscriptionDashboard />

          {/* Main Management Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by user name, email, or plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSubscriptions(false)}
                  className="flex items-center gap-2"
                  disabled={filterLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${filterLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  disabled={filterLoading}
                >
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={planTypeFilter}
                  onValueChange={setPlanTypeFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plan Types</SelectItem>
                    {uniquePlanTypes.length > 0 ? (
                      uniquePlanTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="subscription">
                          Subscriptions
                        </SelectItem>
                        <SelectItem value="mentorship">Mentorships</SelectItem>
                        <SelectItem value="script">Scripts</SelectItem>
                        <SelectItem value="addon">Add-ons</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Select value={healthFilter} onValueChange={setHealthFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Health Status</SelectItem>
                    <SelectItem value="healthy">Healthy (30+ days)</SelectItem>
                    <SelectItem value="warning">Warning (7-30 days)</SelectItem>
                    <SelectItem value="critical">Critical (≤7 days)</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-md border relative">
                {/* Loading overlay for filter changes */}
                {filterLoading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center rounded-md">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Loading subscriptions...
                      </p>
                    </div>
                  </div>
                )}

                {filteredSubscriptions.length === 0 && !filterLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Subscriptions Found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      planTypeFilter !== "all" ||
                      healthFilter !== "all"
                        ? "No subscriptions match your current filters. Try adjusting your search criteria."
                        : "No subscriptions available yet. Start by creating your first subscription."}
                    </p>
                    {(searchTerm ||
                      statusFilter !== "all" ||
                      planTypeFilter !== "all" ||
                      healthFilter !== "all") && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setPlanTypeFilter("all");
                          setHealthFilter("all");
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Billing</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {subscription.name || "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {subscription.email || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {subscription.currentPlan}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {subscription.planType}
                              </div>
                              {subscription.scheduledPlanChange && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3 text-orange-500" />
                                  <span className="text-xs text-orange-600 dark:text-orange-400">
                                    Changes to{" "}
                                    {
                                      subscription.scheduledPlanChange
                                        .newPlanName
                                    }{" "}
                                    on{" "}
                                    {new Date(
                                      subscription.scheduledPlanChange.effectiveDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(subscription.subscriptionStatus)}
                          </TableCell>
                          <TableCell>
                            {getHealthBadge(
                              subscription.daysRemaining ?? null,
                              subscription.subscriptionStatus
                            )}
                          </TableCell>
                          <TableCell className="capitalize">
                            {subscription.billingCycle}
                          </TableCell>
                          <TableCell>${subscription.mrr || 0}</TableCell>
                          <TableCell>
                            {new Date(
                              subscription.subscriptionStartDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {subscription.daysRemaining !== null
                              ? `${subscription.daysRemaining} days`
                              : "Lifetime"}
                          </TableCell>
                          <TableCell>
                            {subscription.daysRemaining !== null &&
                              subscription.daysRemaining !== undefined && (
                                <div className="w-20">
                                  <Progress
                                    value={getDaysRemainingProgress(
                                      subscription.daysRemaining ?? null,
                                      subscription.billingCycle
                                    )}
                                    className="h-2"
                                  />
                                </div>
                              )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>
                                  Subscription Actions
                                </DropdownMenuLabel>

                                {/* View & Edit */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Subscription
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Plan Management - Show for active subscriptions */}
                                {subscription.subscriptionStatus ===
                                  "active" && (
                                  <>
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                      Plan Management
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowPlanChangeDialog(true);
                                      }}
                                    >
                                      <Shuffle className="mr-2 h-4 w-4" />
                                      Change Plan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowUpgradeDialog(true);
                                      }}
                                    >
                                      <ArrowUp className="mr-2 h-4 w-4 text-green-600" />
                                      <span className="text-green-600">
                                        Upgrade Plan
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowDowngradeDialog(true);
                                      }}
                                    >
                                      <ArrowDown className="mr-2 h-4 w-4 text-orange-600" />
                                      <span className="text-orange-600">
                                        Downgrade Plan
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                                {/* Lifecycle Management - Always show label */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                  Lifecycle Management
                                </DropdownMenuLabel>

                                {/* Active subscription actions */}
                                {subscription.subscriptionStatus ===
                                  "active" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowPauseDialog(true);
                                      }}
                                    >
                                      <PauseCircle className="mr-2 h-4 w-4" />
                                      Pause Subscription
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowSuspendDialog(true);
                                      }}
                                    >
                                      <StopCircle className="mr-2 h-4 w-4 text-yellow-600" />
                                      <span className="text-yellow-600">
                                        Suspend
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedSubscription(subscription);
                                        setShowCancelDialog(true);
                                      }}
                                    >
                                      <Ban className="mr-2 h-4 w-4 text-orange-600" />
                                      <span className="text-orange-600">
                                        Cancel Subscription
                                      </span>
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Paused subscription actions */}
                                {subscription.subscriptionStatus ===
                                  "paused" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleResumeSubscription(subscription._id)
                                    }
                                  >
                                    <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">
                                      Resume Subscription
                                    </span>
                                  </DropdownMenuItem>
                                )}

                                {/* Suspended subscription actions */}
                                {subscription.subscriptionStatus ===
                                  "suspended" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleResumeSubscription(subscription._id)
                                    }
                                  >
                                    <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">
                                      Resume Suspended
                                    </span>
                                  </DropdownMenuItem>
                                )}

                                {/* Cancelled/Suspended/Expired - Show reactivate */}
                                {(subscription.subscriptionStatus ===
                                  "cancelled" ||
                                  subscription.subscriptionStatus ===
                                    "suspended" ||
                                  subscription.subscriptionStatus ===
                                    "expired") && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleReactivateSubscription(
                                        subscription._id
                                      )
                                    }
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">
                                      Reactivate
                                    </span>
                                  </DropdownMenuItem>
                                )}

                                {/* Pending/Trial - Show activation options */}
                                {(subscription.subscriptionStatus ===
                                  "pending" ||
                                  subscription.subscriptionStatus ===
                                    "trial") && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSubscription(subscription);
                                      setShowStatusUpdateDialog(true);
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">
                                      Activate Subscription
                                    </span>
                                  </DropdownMenuItem>
                                )}

                                {/* Renewal Actions */}
                                {subscription.subscriptionStatus === "active" &&
                                  subscription.daysRemaining !== null &&
                                  subscription.daysRemaining <= 30 && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                                        Renewal
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedSubscription(subscription);
                                          setShowRenewalDialog(true);
                                        }}
                                      >
                                        <RefreshCw className="mr-2 h-4 w-4 text-blue-600" />
                                        <span className="text-blue-600">
                                          Process Renewal
                                        </span>
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                {/* Scheduled Changes */}
                                {subscription.scheduledPlanChange && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                      Scheduled Changes
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCancelScheduledChange(
                                          subscription._id
                                        )
                                      }
                                    >
                                      <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                                      Cancel Scheduled Change
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Status Management */}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                  Administration
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setShowStatusUpdateDialog(true);
                                  }}
                                >
                                  <Settings className="mr-2 h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>

                                {/* User Details Link */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(
                                      `/users/${subscription.userId}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  View User Profile
                                </DropdownMenuItem>

                                {/* Danger Zone */}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-red-600">
                                  Danger Zone
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={() =>
                                    handleDeleteSubscription(subscription._id)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Subscription
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {filterLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      Loading...
                    </span>
                  ) : (
                    `Showing ${filteredSubscriptions.length} of ${enhancedSubscriptions.length} subscriptions`
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || filterLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || filterLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {analytics &&
          analytics.recentActivity &&
          analytics.recentActivity.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                  <Badge variant="secondary" className="ml-auto">
                    {analytics.recentActivity.length}{" "}
                    {analytics.recentActivity.length === 1
                      ? "Activity"
                      : "Activities"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                          {activity.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {activity.userName}
                            </p>
                            {getStatusBadge(activity.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {activity.email}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap text-sm">
                            <Badge variant="outline" className="capitalize">
                              {activity.billingCycle}
                            </Badge>
                            {activity.mrr > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-green-600 font-semibold">
                                  ${activity.mrr}/mo
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">
                                {new Date(
                                  activity.updatedAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Recent Activity
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  There are no recent subscription activities to display.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedSubscription && (
        <>
          <EditSubscriptionDialog
            subscription={selectedSubscription}
            open={showEditDialog}
            onClose={() => setShowEditDialog(false)}
            onSave={handleUpdateSubscription}
          />

          <CancelSubscriptionDialog
            subscription={selectedSubscription}
            open={showCancelDialog}
            onClose={() => setShowCancelDialog(false)}
            onSave={handleCancelSubscription}
          />

          <PauseSubscriptionDialog
            subscription={selectedSubscription}
            open={showPauseDialog}
            onClose={() => setShowPauseDialog(false)}
            onSave={handlePauseSubscription}
          />

          <PlanChangeDialog
            subscription={selectedSubscription}
            availablePlans={availablePlans}
            open={showPlanChangeDialog}
            onClose={() => setShowPlanChangeDialog(false)}
            onSave={handlePlanChange}
          />

          <SuspendDialog
            subscription={selectedSubscription}
            open={showSuspendDialog}
            onClose={() => setShowSuspendDialog(false)}
            onSave={handleSuspendSubscription}
          />

          <StatusUpdateDialog
            subscription={selectedSubscription}
            open={showStatusUpdateDialog}
            onClose={() => setShowStatusUpdateDialog(false)}
            onSave={handleUpdateSubscription}
          />

          <UpgradeDialog
            subscription={selectedSubscription}
            availablePlans={availablePlans}
            open={showUpgradeDialog}
            onClose={() => setShowUpgradeDialog(false)}
            onSave={handlePlanChange}
          />

          <DowngradeDialog
            subscription={selectedSubscription}
            availablePlans={availablePlans}
            open={showDowngradeDialog}
            onClose={() => setShowDowngradeDialog(false)}
            onSave={handlePlanChange}
          />

          <RenewalDialog
            subscription={selectedSubscription}
            open={showRenewalDialog}
            onClose={() => setShowRenewalDialog(false)}
            onSave={handleProcessRenewal}
          />
        </>
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription? This action
              cannot be undone and will permanently remove all subscription
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Scheduled Change Confirmation AlertDialog */}
      <AlertDialog
        open={showCancelScheduledConfirm}
        onOpenChange={setShowCancelScheduledConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the scheduled plan change? The
              subscription will remain on its current plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCancelScheduledConfirm(false);
                setCancelScheduledTarget(null);
              }}
            >
              Keep Scheduled Change
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelScheduledChange}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Cancel Scheduled Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Dialog Components
function EditSubscriptionDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateSubscriptionRequest) => void;
}) {
  const [formData, setFormData] = useState({
    status: subscription.subscriptionStatus,
    price: subscription.mrr,
    billingCycle: subscription.billingCycle,
    adminNotes: subscription.adminNotes || "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription details for {subscription.name || "User"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as SubscriptionStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, billingCycle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="oneTime">One Time</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, adminNotes: e.target.value }))
              }
              placeholder="Add notes about this change..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(subscription._id, formData)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelSubscriptionDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel {subscription.name || "this user"}'s
            subscription?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Cancellation Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={() => onSave(subscription._id, reason)}
            disabled={!reason.trim()}
          >
            Cancel Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PauseSubscriptionDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, duration: number, reason: string) => void;
}) {
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
          <DialogDescription>
            Temporarily pause {subscription.name || "this user"}'s subscription
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="duration">Pause Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={90}
            />
          </div>
          <div>
            <Label htmlFor="reason">Pause Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for pausing..."
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(subscription._id, duration, reason)}
            disabled={!reason.trim()}
          >
            Pause Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanChangeDialog({
  subscription,
  availablePlans,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  availablePlans: Plan[];
  open: boolean;
  onClose: () => void;
  onSave: (
    subscriptionId: string,
    newPlanId: string,
    newBillingCycle: string,
    effectiveDate?: string
  ) => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "annual" | "oneTime"
  >("monthly");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [changeType, setChangeType] = useState<"immediate" | "scheduled">(
    "immediate"
  );

  const selectedPlan = availablePlans.find(
    (plan) => plan._id === selectedPlanId
  );

  // Find current plan by matching displayName with subscription.currentPlan
  const currentPlan = availablePlans.find(
    (plan) =>
      plan.displayName === subscription.currentPlan ||
      plan.name === subscription.currentPlan
  );

  // Get available billing cycles for selected plan
  const getAvailableBillingCycles = (plan: Plan) => {
    const cycles: Array<{ value: string; label: string; price: number }> = [];

    if (plan.pricing.monthly?.price !== undefined) {
      cycles.push({
        value: "monthly",
        label: "Monthly",
        price: plan.pricing.monthly.price,
      });
    }

    if (plan.pricing.annual?.price !== undefined) {
      cycles.push({
        value: "annual",
        label: "Annual",
        price: plan.pricing.annual.price,
      });
    }

    if (plan.pricing.oneTime?.price !== undefined) {
      cycles.push({
        value: "oneTime",
        label: "One Time",
        price: plan.pricing.oneTime.price,
      });
    }

    return cycles;
  };

  const availableCycles = selectedPlan
    ? getAvailableBillingCycles(selectedPlan)
    : [];
  const currentPrice = subscription.mrr || 0;

  // Get the price from the selected billing cycle with proper null checks
  const getSelectedPrice = (): number => {
    if (!selectedPlan) return 0;
    const pricingOption =
      selectedPlan.pricing[billingCycle as keyof typeof selectedPlan.pricing];
    return pricingOption?.price || 0;
  };

  const newPrice = getSelectedPrice();
  const priceDifference = newPrice - currentPrice;

  const getPlanChangeType = () => {
    if (!selectedPlan || !currentPlan) return "change";

    // Simple logic based on price and access level
    if (
      selectedPlan.accessLevel > currentPlan.accessLevel ||
      newPrice > currentPrice
    ) {
      return "upgrade";
    } else if (
      selectedPlan.accessLevel < currentPlan.accessLevel ||
      newPrice < currentPrice
    ) {
      return "downgrade";
    }
    return "change";
  };

  const planChangeType = getPlanChangeType();

  const handleSubmit = () => {
    if (!selectedPlanId || !billingCycle) {
      toast.error("Please select a plan and billing cycle");
      return;
    }

    const effectiveDateValue =
      changeType === "scheduled" ? effectiveDate : undefined;
    onSave(subscription._id, selectedPlanId, billingCycle, effectiveDateValue);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Change {subscription.name || "this user"}'s subscription plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-1">
          {/* Reduced spacing on mobile */}
          {/* Current Plan Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              Current Plan
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{subscription.currentPlan}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.billingCycle} • ${subscription.mrr}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Current
              </Badge>
            </div>
          </div>

          {/* Change Type */}
          <div className="w-full">
            <Label htmlFor="changeType" className="block mb-2">
              Change Type
            </Label>
            <Select
              value={changeType}
              onValueChange={(value: "immediate" | "scheduled") =>
                setChangeType(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Immediate Change
                  </div>
                </SelectItem>
                <SelectItem value="scheduled">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule for Later
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Effective Date */}
          {changeType === "scheduled" && (
            <div className="w-full">
              <Label htmlFor="effectiveDate" className="block mb-2">
                Effective Date
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full"
              />
            </div>
          )}

          {/* Plan Selection */}
          <div className="w-full">
            <Label htmlFor="planSelect" className="block mb-2">
              Select New Plan
            </Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a plan..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availablePlans
                  .filter(
                    (plan) =>
                      plan.displayName !== subscription.currentPlan &&
                      plan.name !== subscription.currentPlan
                  )
                  .map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{plan.displayName}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {plan.category} • {plan.planType}
                          </p>
                        </div>
                        {plan.isPopular && (
                          <Badge variant="secondary" className="ml-2">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Billing Cycle Selection */}
          {selectedPlan && (
            <div className="w-full">
              <Label htmlFor="billingCycle" className="block mb-2">
                Billing Cycle
              </Label>
              <Select
                value={billingCycle}
                onValueChange={(value: "monthly" | "annual" | "oneTime") =>
                  setBillingCycle(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cycle.label}</span>
                        <span className="ml-2 font-medium">${cycle.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Comparison */}
          {selectedPlan && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                Price Comparison
              </h3>
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current Price:
                  </span>
                  <span className="font-medium">${currentPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Price:
                  </span>
                  <span className="font-medium">${newPrice}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                  <span className="font-medium">Difference:</span>
                  <span
                    className={`font-bold ${
                      priceDifference >= 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {priceDifference >= 0 ? "+" : ""}${priceDifference}
                  </span>
                </div>
              </div>

              {/* Change Type Badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Change Type:
                </span>
                <Badge
                  className={
                    planChangeType === "upgrade"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : planChangeType === "downgrade"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }
                >
                  {planChangeType === "upgrade" && (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  )}
                  {planChangeType === "downgrade" && (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {planChangeType === "change" && (
                    <RefreshCcw className="w-3 h-3 mr-1" />
                  )}
                  {planChangeType.charAt(0).toUpperCase() +
                    planChangeType.slice(1)}
                </Badge>
              </div>
            </div>
          )}

          {/* Plan Features Preview */}
          {selectedPlan && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                New Plan Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-800 dark:text-blue-200">
                      {feature}
                    </span>
                  </div>
                ))}
                {selectedPlan.features.length > 6 && (
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    +{selectedPlan.features.length - 6} more features
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedPlanId ||
              !billingCycle ||
              (changeType === "scheduled" && !effectiveDate)
            }
            className={[
              "w-full sm:w-auto",
              planChangeType === "upgrade" && "bg-green-600 hover:bg-green-700",
              planChangeType === "downgrade" &&
                "bg-yellow-600 hover:bg-yellow-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {changeType === "immediate"
              ? "Change Plan Now"
              : "Schedule Plan Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Suspend Dialog Component
function SuspendDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StopCircle className="w-5 h-5 text-yellow-600" />
            Suspend Subscription
          </DialogTitle>
          <DialogDescription>
            Temporarily suspend {subscription.name || "this user"}'s
            subscription. They will not be charged during suspension.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Suspension is different from pause.
              Suspended subscriptions require manual reactivation.
            </p>
          </div>
          <div>
            <Label htmlFor="suspend-reason">Suspension Reason *</Label>
            <Textarea
              id="suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Payment failed, User requested, Policy violation..."
              required
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(subscription._id, reason)}
            disabled={!reason.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Suspend Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Status Update Dialog Component
function StatusUpdateDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: UpdateSubscriptionRequest) => void;
}) {
  const [newStatus, setNewStatus] = useState(subscription.subscriptionStatus);
  const [adminNotes, setAdminNotes] = useState("");

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "pending",
      label: "Pending",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      value: "suspended",
      label: "Suspended",
      icon: StopCircle,
      color: "text-orange-600",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      color: "text-red-600",
    },
    { value: "expired", label: "Expired", icon: Clock, color: "text-gray-600" },
    { value: "trial", label: "Trial", icon: Zap, color: "text-blue-600" },
    {
      value: "paused",
      label: "Paused",
      icon: PauseCircle,
      color: "text-orange-600",
    },
  ];

  const handleSubmit = () => {
    if (newStatus === subscription.subscriptionStatus && !adminNotes.trim()) {
      toast.error("No changes to save");
      return;
    }

    onSave(subscription._id, {
      status: newStatus,
      adminNotes: adminNotes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Update Subscription Status
          </DialogTitle>
          <DialogDescription>
            Change the status for {subscription.name || "this user"}'s
            subscription
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Status
            </p>
            <Badge className="bg-blue-100 text-blue-800">
              {subscription.subscriptionStatus}
            </Badge>
          </div>

          {/* New Status Selection */}
          <div>
            <Label htmlFor="status-select">New Status *</Label>
            <Select
              value={newStatus}
              onValueChange={(value) =>
                setNewStatus(value as SubscriptionStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div>
            <Label htmlFor="status-notes">Admin Notes</Label>
            <Textarea
              id="status-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this status change..."
              rows={3}
            />
          </div>

          {/* Warning for status changes */}
          {newStatus !== subscription.subscriptionStatus && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Warning:</strong> Changing status manually may affect
                billing and access. Make sure this is intentional.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              newStatus === subscription.subscriptionStatus &&
              !adminNotes.trim()
            }
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Upgrade Dialog Component
function UpgradeDialog({
  subscription,
  availablePlans,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  availablePlans: Plan[];
  open: boolean;
  onClose: () => void;
  onSave: (
    subscriptionId: string,
    newPlanId: string,
    newBillingCycle: string,
    effectiveDate?: string
  ) => void;
}) {
  const currentPlan = availablePlans.find(
    (plan) =>
      plan.displayName === subscription.currentPlan ||
      plan.name === subscription.currentPlan
  );

  // Filter plans that are upgrades (higher price or access level)
  const upgradePlans = availablePlans.filter((plan) => {
    if (!currentPlan) return false;

    // Get minimum price for comparison
    const currentMinPrice = Math.min(
      currentPlan.pricing.monthly?.price || Infinity,
      currentPlan.pricing.annual?.price || Infinity
    );
    const planMinPrice = Math.min(
      plan.pricing.monthly?.price || Infinity,
      plan.pricing.annual?.price || Infinity
    );

    return (
      plan._id !== currentPlan._id &&
      (plan.accessLevel > currentPlan.accessLevel ||
        planMinPrice > currentMinPrice)
    );
  });

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "annual" | "oneTime"
  >("monthly");

  const selectedPlan = upgradePlans.find((plan) => plan._id === selectedPlanId);

  const getAvailableBillingCycles = (plan: Plan) => {
    const cycles: Array<{ value: string; label: string; price: number }> = [];

    if (plan.pricing.monthly?.price !== undefined) {
      cycles.push({
        value: "monthly",
        label: "Monthly",
        price: plan.pricing.monthly.price,
      });
    }
    if (plan.pricing.annual?.price !== undefined) {
      cycles.push({
        value: "annual",
        label: "Annual",
        price: plan.pricing.annual.price,
      });
    }
    if (plan.pricing.oneTime?.price !== undefined) {
      cycles.push({
        value: "oneTime",
        label: "One Time",
        price: plan.pricing.oneTime.price,
      });
    }

    return cycles;
  };

  const availableCycles = selectedPlan
    ? getAvailableBillingCycles(selectedPlan)
    : [];

  const getSelectedPrice = (): number => {
    if (!selectedPlan) return 0;
    const pricingOption =
      selectedPlan.pricing[billingCycle as keyof typeof selectedPlan.pricing];
    return pricingOption?.price || 0;
  };

  const newPrice = getSelectedPrice();
  const currentPrice = subscription.mrr || 0;
  const priceDifference = newPrice - currentPrice;

  const handleSubmit = () => {
    if (!selectedPlanId || !billingCycle) {
      toast.error("Please select a plan and billing cycle");
      return;
    }
    onSave(subscription._id, selectedPlanId, billingCycle);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-green-600" />
            Upgrade Subscription
          </DialogTitle>
          <DialogDescription>
            Upgrade {subscription.name || "this user"} to a better plan with
            more features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              Current Plan
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{subscription.currentPlan}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.billingCycle} • ${subscription.mrr}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Current</Badge>
            </div>
          </div>

          {upgradePlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No upgrade options available. User is already on the highest
                tier.
              </p>
            </div>
          ) : (
            <>
              {/* Plan Selection */}
              <div>
                <Label htmlFor="upgrade-plan">Select Upgrade Plan *</Label>
                <Select
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an upgrade plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {upgradePlans.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {plan.displayName || plan.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Billing Cycle */}
              {selectedPlan && (
                <div>
                  <Label htmlFor="upgrade-billing">Billing Cycle *</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(value: "monthly" | "annual" | "oneTime") =>
                      setBillingCycle(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCycles.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label} - ${cycle.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Comparison */}
              {selectedPlan && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-medium text-sm text-green-800 dark:text-green-200 mb-3">
                    Upgrade Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current Price:
                      </span>
                      <span className="font-medium">${currentPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        New Price:
                      </span>
                      <span className="font-medium">${newPrice}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Additional Cost:</span>
                      <span className="font-bold text-green-600">
                        +${priceDifference}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Preview */}
              {selectedPlan && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                    New Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPlan.features.slice(0, 6).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-800 dark:text-blue-200">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedPlanId || !billingCycle || upgradePlans.length === 0
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Downgrade Dialog Component
function DowngradeDialog({
  subscription,
  availablePlans,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  availablePlans: Plan[];
  open: boolean;
  onClose: () => void;
  onSave: (
    subscriptionId: string,
    newPlanId: string,
    newBillingCycle: string,
    effectiveDate?: string
  ) => void;
}) {
  const currentPlan = availablePlans.find(
    (plan) =>
      plan.displayName === subscription.currentPlan ||
      plan.name === subscription.currentPlan
  );

  // Filter plans that are downgrades (lower price or access level)
  const downgradePlans = availablePlans.filter((plan) => {
    if (!currentPlan) return false;

    const currentMinPrice = Math.min(
      currentPlan.pricing.monthly?.price || Infinity,
      currentPlan.pricing.annual?.price || Infinity
    );
    const planMinPrice = Math.min(
      plan.pricing.monthly?.price || Infinity,
      plan.pricing.annual?.price || Infinity
    );

    return (
      plan._id !== currentPlan._id &&
      (plan.accessLevel < currentPlan.accessLevel ||
        planMinPrice < currentMinPrice)
    );
  });

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "annual" | "oneTime"
  >("monthly");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [changeType, setChangeType] = useState<"immediate" | "scheduled">(
    "scheduled"
  );

  const selectedPlan = downgradePlans.find(
    (plan) => plan._id === selectedPlanId
  );

  const getAvailableBillingCycles = (plan: Plan) => {
    const cycles: Array<{ value: string; label: string; price: number }> = [];

    if (plan.pricing.monthly?.price !== undefined) {
      cycles.push({
        value: "monthly",
        label: "Monthly",
        price: plan.pricing.monthly.price,
      });
    }
    if (plan.pricing.annual?.price !== undefined) {
      cycles.push({
        value: "annual",
        label: "Annual",
        price: plan.pricing.annual.price,
      });
    }
    if (plan.pricing.oneTime?.price !== undefined) {
      cycles.push({
        value: "oneTime",
        label: "One Time",
        price: plan.pricing.oneTime.price,
      });
    }

    return cycles;
  };

  const availableCycles = selectedPlan
    ? getAvailableBillingCycles(selectedPlan)
    : [];

  const getSelectedPrice = (): number => {
    if (!selectedPlan) return 0;
    const pricingOption =
      selectedPlan.pricing[billingCycle as keyof typeof selectedPlan.pricing];
    return pricingOption?.price || 0;
  };

  const newPrice = getSelectedPrice();
  const currentPrice = subscription.mrr || 0;
  const priceDifference = currentPrice - newPrice;

  const handleSubmit = () => {
    if (!selectedPlanId || !billingCycle) {
      toast.error("Please select a plan and billing cycle");
      return;
    }
    if (changeType === "scheduled" && !effectiveDate) {
      toast.error("Please select an effective date");
      return;
    }

    const effectiveDateValue =
      changeType === "scheduled" ? effectiveDate : undefined;
    onSave(subscription._id, selectedPlanId, billingCycle, effectiveDateValue);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDown className="w-5 h-5 text-orange-600" />
            Downgrade Subscription
          </DialogTitle>
          <DialogDescription>
            Downgrade {subscription.name || "this user"} to a lower tier plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              Current Plan
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{subscription.currentPlan}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.billingCycle} • ${subscription.mrr}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Current</Badge>
            </div>
          </div>

          {downgradePlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No downgrade options available. User is already on the lowest
                tier.
              </p>
            </div>
          ) : (
            <>
              {/* Change Type */}
              <div>
                <Label>When to apply downgrade? *</Label>
                <Select
                  value={changeType}
                  onValueChange={(value: "immediate" | "scheduled") =>
                    setChangeType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        At End of Billing Period (Recommended)
                      </div>
                    </SelectItem>
                    <SelectItem value="immediate">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Immediately
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Effective Date */}
              {changeType === "scheduled" && (
                <div>
                  <Label htmlFor="downgrade-date">Effective Date *</Label>
                  <Input
                    id="downgrade-date"
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              {/* Plan Selection */}
              <div>
                <Label htmlFor="downgrade-plan">Select Downgrade Plan *</Label>
                <Select
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a downgrade plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {downgradePlans.map((plan) => (
                      <SelectItem key={plan._id} value={plan._id}>
                        <div className="flex items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">
                            {plan.displayName || plan.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Billing Cycle */}
              {selectedPlan && (
                <div>
                  <Label htmlFor="downgrade-billing">Billing Cycle *</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(value: "monthly" | "annual" | "oneTime") =>
                      setBillingCycle(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCycles.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label} - ${cycle.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Comparison */}
              {selectedPlan && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-medium text-sm text-orange-800 dark:text-orange-200 mb-3">
                    Downgrade Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current Price:
                      </span>
                      <span className="font-medium">${currentPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        New Price:
                      </span>
                      <span className="font-medium">${newPrice}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Savings:</span>
                      <span className="font-bold text-green-600">
                        -${priceDifference}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> Downgrading will remove access to
                  premium features.{" "}
                  {changeType === "scheduled"
                    ? "Changes will take effect on the selected date."
                    : "Changes will take effect immediately."}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedPlanId ||
              !billingCycle ||
              (changeType === "scheduled" && !effectiveDate) ||
              downgradePlans.length === 0
            }
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {changeType === "immediate"
              ? "Downgrade Now"
              : "Schedule Downgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Renewal Dialog Component
function RenewalDialog({
  subscription,
  open,
  onClose,
  onSave,
}: {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, paymentId?: string) => void;
}) {
  const [paymentId, setPaymentId] = useState("");
  const [confirmRenewal, setConfirmRenewal] = useState(false);

  const handleSubmit = () => {
    if (!confirmRenewal) {
      toast.error("Please confirm renewal");
      return;
    }
    onSave(subscription._id, paymentId.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            Process Subscription Renewal
          </DialogTitle>
          <DialogDescription>
            Manually process renewal for {subscription.name || "this user"}'s
            subscription
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Subscription Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
              Subscription Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium">{subscription.currentPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Current Price:
                </span>
                <span className="font-medium">${subscription.mrr || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Billing Cycle:
                </span>
                <span className="font-medium capitalize">
                  {subscription.billingCycle}
                </span>
              </div>
              {subscription.subscriptionEndDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Expires:
                  </span>
                  <span className="font-medium">
                    {new Date(
                      subscription.subscriptionEndDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment ID (Optional) */}
          <div>
            <Label htmlFor="paymentId">Payment ID (Optional)</Label>
            <Input
              id="paymentId"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter payment transaction ID if available..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to process renewal without payment reference
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="confirmRenewal"
              checked={confirmRenewal}
              onChange={(e) => setConfirmRenewal(e.target.checked)}
              className="mt-1"
            />
            <Label htmlFor="confirmRenewal" className="text-sm cursor-pointer">
              I confirm that I want to renew this subscription. This will extend
              the subscription period and may charge the user.
            </Label>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This will extend the subscription by one
              billing cycle (
              {subscription.billingCycle === "monthly" ? "1 month" : "1 year"})
              and update the end date accordingly.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!confirmRenewal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Process Renewal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
