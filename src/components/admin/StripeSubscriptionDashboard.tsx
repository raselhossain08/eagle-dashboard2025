import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  XCircle,
  PlayCircle,
  RotateCcw,
  Search,
  Download,
} from "lucide-react";
import ApiService from "@/lib/services/shared/api.service";

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Plan {
  _id: string;
  name: string;
}

interface Subscription {
  _id: string;
  userId: User;
  planId: Plan;
  status: "active" | "trial" | "past_due" | "canceled" | "paused";
  billingCycle: "monthly" | "yearly";
  currentPrice: number;
  nextBillingDate?: string;
  totalPaid?: number;
  stripeSubscriptionId: string;
}

interface Stats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

interface StatsResponse {
  stats: Stats;
  mrr: number;
}

interface SubscriptionResponse {
  subscriptions: Subscription[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Helper using ApiService
const api = {
  // Stats
  getStats: () => ApiService.get("/admin/stripe/stats"),

  // Subscriptions
  getSubscriptions: (params: any) => {
    const query = new URLSearchParams(params).toString();
    return ApiService.get(`/admin/stripe/subscriptions?${query}`);
  },

  getSubscription: (id: string) =>
    ApiService.get(`/admin/stripe/subscriptions/${id}`),

  syncSubscription: (id: string) =>
    ApiService.post(`/admin/stripe/subscriptions/${id}/sync`),

  cancelSubscription: (id: string, data: any) =>
    ApiService.post(`/admin/stripe/subscriptions/${id}/cancel`, data),

  resumeSubscription: (id: string) =>
    ApiService.post(`/admin/stripe/subscriptions/${id}/resume`),

  refundPayment: (id: string, data: any) =>
    ApiService.post(`/admin/stripe/subscriptions/${id}/refund`, data),
};

// Status Badge Component
const StatusBadge = ({ status }: { status: Subscription["status"] }) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    trial: "bg-blue-100 text-blue-800",
    past_due: "bg-yellow-100 text-yellow-800",
    canceled: "bg-red-100 text-red-800",
    paused: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {trend && (
        <p className="text-xs text-green-600 mt-1">
          <TrendingUp className="inline h-3 w-3" /> {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

// Main Dashboard Component
export default function StripeSubscriptionDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState<
    SubscriptionResponse["pagination"]
  >({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "all",
    search: "",
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, subsData] = (await Promise.all([
        api.getStats(),
        api.getSubscriptions(filters),
      ])) as [ApiResponse<StatsResponse>, ApiResponse<SubscriptionResponse>];

      setStats(statsData.data);
      setSubscriptions(subsData.data.subscriptions);
      setPagination(subsData.data.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sync subscription
  const handleSync = async (id: string) => {
    setActionLoading(true);
    try {
      await api.syncSubscription(id);
      toast({
        title: "Success",
        description: "Subscription synced with Stripe",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel subscription
  const handleCancel = async (
    id: string,
    reason: string,
    immediately = false
  ) => {
    setActionLoading(true);
    try {
      await api.cancelSubscription(id, { reason, immediately });
      toast({
        title: "Success",
        description: immediately
          ? "Subscription canceled immediately"
          : "Subscription will cancel at period end",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle resume subscription
  const handleResume = async (id: string) => {
    setActionLoading(true);
    try {
      await api.resumeSubscription(id);
      toast({
        title: "Success",
        description: "Subscription resumed successfully",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle refund
  const handleRefund = async (
    id: string,
    amount: number | undefined,
    reason: string
  ) => {
    setActionLoading(true);
    try {
      await api.refundPayment(id, { amount, reason });
      toast({
        title: "Success",
        description: `Refunded $${amount || "full amount"}`,
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stripe Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage recurring subscriptions and payments
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Subscriptions"
            value={stats.stats.totalSubscriptions || 0}
            icon={Users}
            description="All time subscriptions"
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats.stats.activeSubscriptions || 0}
            icon={PlayCircle}
            description="Currently active"
          />
          <StatsCard
            title="Monthly Recurring Revenue"
            value={`$${(stats.mrr || 0).toFixed(2)}`}
            icon={DollarSign}
            trend="+12% from last month"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats.stats.totalRevenue || 0).toFixed(2)}`}
            icon={TrendingUp}
            description="All time revenue"
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by email or name..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value, page: 1 })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            Showing {subscriptions.length} of {pagination.total || 0}{" "}
            subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {sub.userId?.firstName} {sub.userId?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sub.userId?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{sub.planId?.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {sub.billingCycle}
                  </TableCell>
                  <TableCell>${sub.currentPrice}</TableCell>
                  <TableCell>
                    {sub.nextBillingDate
                      ? new Date(sub.nextBillingDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>${sub.totalPaid?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <SubscriptionActions
                      subscription={sub}
                      onSync={() => handleSync(sub._id)}
                      onCancel={(reason, immediately) =>
                        handleCancel(sub._id, reason, immediately)
                      }
                      onResume={() => handleResume(sub._id)}
                      onRefund={(amount, reason) =>
                        handleRefund(sub._id, amount, reason)
                      }
                      loading={actionLoading}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Subscription Actions Component
function SubscriptionActions({
  subscription,
  onSync,
  onCancel,
  onResume,
  onRefund,
  loading,
}: {
  subscription: Subscription;
  onSync: () => void;
  onCancel: (reason: string, immediately: boolean) => void;
  onResume: () => void;
  onRefund: (amount: number | undefined, reason: string) => void;
  loading: boolean;
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");

  const handleCancelSubmit = () => {
    onCancel(cancelReason, cancelImmediately);
    setCancelDialogOpen(false);
    setCancelReason("");
    setCancelImmediately(false);
  };

  const handleRefundSubmit = () => {
    onRefund(parseFloat(refundAmount) || undefined, refundReason);
    setRefundDialogOpen(false);
    setRefundAmount("");
  };

  return (
    <div className="flex gap-2">
      {/* Sync Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={loading}
        title="Sync with Stripe"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      {/* Cancel/Resume Button */}
      {subscription.status === "active" || subscription.status === "trial" ? (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Cancel this subscription for {subscription.userId?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="immediately"
                  checked={cancelImmediately}
                  onChange={(e) => setCancelImmediately(e.target.checked)}
                />
                <Label htmlFor="immediately">
                  Cancel immediately (don't wait for period end)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCancelSubmit} disabled={loading}>
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : subscription.status === "canceled" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onResume}
          disabled={loading}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Resume
        </Button>
      ) : null}

      {/* Refund Button */}
      {(subscription.status === "active" ||
        subscription.status === "past_due") && (
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Refund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refund Payment</DialogTitle>
              <DialogDescription>
                Refund last payment for {subscription.userId?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">
                  Amount (leave empty for full refund of $
                  {subscription.currentPrice})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max: $${subscription.currentPrice}`}
                />
              </div>
              <div>
                <Label htmlFor="refundReason">Reason</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">
                      Requested by Customer
                    </SelectItem>
                    <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRefundSubmit} disabled={loading}>
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
