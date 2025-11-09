"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  Shield,
  RefreshCw,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { billingService } from "@/lib/services/billing.service";
import { BillingDashboard, Invoice } from "@/lib/types/billing";
import Link from "next/link";

export default function BillingPage() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  // Track if initial load has been done to prevent multiple calls
  const hasInitiallyLoaded = useRef(false);

  const [dashboardData, setDashboardData] = useState<BillingDashboard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Invoice management state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Declare all callback functions first to avoid initialization errors
  const loadDashboardData = useCallback(async (showLoader: boolean = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      const response = await billingService.getDashboard("30d", "USD");

      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load billing data";

      // Check for specific error types
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        // Provide mock data for development
        console.log("📊 Using mock data - backend endpoint not available");
        setDashboardData({
          summary: {
            totalRevenue: 12550.75,
            totalInvoices: 45,
            paidInvoices: 38,
            pendingInvoices: 5,
            overdueInvoices: 2,
            totalTaxCollected: 1255.08,
          },
          recentInvoices: [
            {
              _id: "mock-1",
              invoiceNumber: "INV-2024-001",
              customerId: "customer-1",
              customerName: "John Doe",
              customerEmail: "john.doe@example.com",
              status: "paid" as const,
              currency: "USD",
              subtotal: 100,
              taxAmount: 8.5,
              total: 108.5,
              dueDate: "2024-12-01",
              paidDate: "2024-11-25",
              items: [],
              createdAt: "2024-11-20",
              updatedAt: "2024-11-25",
            },
            {
              _id: "mock-2",
              invoiceNumber: "INV-2024-002",
              customerId: "customer-2",
              customerName: "Jane Smith",
              customerEmail: "jane.smith@example.com",
              status: "pending" as const,
              currency: "USD",
              subtotal: 250,
              taxAmount: 21.25,
              total: 271.25,
              dueDate: "2024-12-15",
              items: [],
              createdAt: "2024-11-22",
              updatedAt: "2024-11-22",
            },
          ],
          revenueByMonth: [
            { month: "Sep 2024", revenue: 8500, taxCollected: 680 },
            { month: "Oct 2024", revenue: 9200, taxCollected: 736 },
            { month: "Nov 2024", revenue: 12550.75, taxCollected: 1255.08 },
          ],
          topCustomers: [
            {
              customerId: "customer-1",
              customerName: "Enterprise Corp",
              totalSpent: 5500,
            },
            {
              customerId: "customer-2",
              customerName: "Tech Solutions Inc",
              totalSpent: 3200,
            },
            {
              customerId: "customer-3",
              customerName: "Digital Agency",
              totalSpent: 2800,
            },
          ],
        });
        setLastUpdated(new Date());
        setError(
          "⚠️ Using sample data - Connect backend for real billing data"
        );
      } else if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network")
      ) {
        setError(
          "🌐 Network error. Please check your connection and try again."
        );
      } else if (errorMessage.includes("403") || errorMessage.includes("401")) {
        setError("🔒 You don't have permission to access billing data.");
      } else {
        setError(errorMessage);
      }
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any changing values

  const loadInvoices = useCallback(
    async (showLoader: boolean = true) => {
      try {
        if (showLoader) setInvoicesLoading(true);
        setError(null);

        const params: any = {
          page: currentPage,
          limit: 10,
        };

        if (statusFilter && statusFilter !== "all")
          params.status = statusFilter;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const response = await billingService.getInvoices(params);

        if (response.success && response.data) {
          setInvoices(response.data);
          setTotalPages(response.pagination?.totalPages || 1);
        } else {
          throw new Error(response.message || "Failed to load invoices");
        }
      } catch (err) {
        console.error("Invoice load error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load invoices";

        // Provide mock data if backend is not available
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("Not Found")
        ) {
          console.log(
            "📄 Using mock invoice data - backend endpoint not available"
          );
          setInvoices([
            {
              _id: "mock-inv-1",
              invoiceNumber: "INV-2024-001",
              customerId: "customer-1",
              customerName: "John Doe",
              customerEmail: "john.doe@example.com",
              status: "paid" as const,
              currency: "USD",
              subtotal: 100,
              taxAmount: 8.5,
              total: 108.5,
              dueDate: "2024-12-01",
              paidDate: "2024-11-25",
              items: [
                {
                  description: "Web Development",
                  quantity: 1,
                  unitPrice: 100,
                  total: 100,
                },
              ],
              createdAt: "2024-11-20",
              updatedAt: "2024-11-25",
            },
            {
              _id: "mock-inv-2",
              invoiceNumber: "INV-2024-002",
              customerId: "customer-2",
              customerName: "Jane Smith",
              customerEmail: "jane.smith@example.com",
              status: "pending" as const,
              currency: "USD",
              subtotal: 250,
              taxAmount: 21.25,
              total: 271.25,
              dueDate: "2024-12-15",
              items: [
                {
                  description: "Consulting Services",
                  quantity: 5,
                  unitPrice: 50,
                  total: 250,
                },
              ],
              createdAt: "2024-11-22",
              updatedAt: "2024-11-22",
            },
            {
              _id: "mock-inv-3",
              invoiceNumber: "INV-2024-003",
              customerId: "customer-3",
              customerName: "Tech Corp",
              customerEmail: "admin@techcorp.com",
              status: "overdue" as const,
              currency: "USD",
              subtotal: 500,
              taxAmount: 42.5,
              total: 542.5,
              dueDate: "2024-11-01",
              items: [
                {
                  description: "Software License",
                  quantity: 1,
                  unitPrice: 500,
                  total: 500,
                },
              ],
              createdAt: "2024-10-15",
              updatedAt: "2024-10-15",
            },
          ]);
          setTotalPages(1);
          setError("⚠️ Using sample invoices - Connect backend for real data");
        } else {
          setError(errorMessage);
          setInvoices([]);
        }
      } finally {
        if (showLoader) setInvoicesLoading(false);
      }
    },
    [currentPage, statusFilter, searchQuery]
  ); // Dependencies for invoice loading

  const handleRefreshDashboard = useCallback(() => {
    billingService.clearCacheEntry("/dashboard");
    loadDashboardData(true);
  }, [loadDashboardData]);

  const handleRefreshInvoices = useCallback(() => {
    billingService.clearCacheEntry("/invoices");
    loadInvoices(true);
  }, [loadInvoices]);

  const handleVoidInvoice = useCallback(
    async (invoiceId: string) => {
      const reason = prompt(
        "Please provide a reason for voiding this invoice:"
      );
      if (!reason) return;

      try {
        const response = await billingService.voidInvoice(invoiceId, reason);
        if (response.success) {
          loadInvoices(); // Reload the list
        } else {
          throw new Error(response.message || "Failed to void invoice");
        }
      } catch (err) {
        console.error("Void error:", err);
        setError(err instanceof Error ? err.message : "Failed to void invoice");
      }
    },
    [loadInvoices]
  );

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Effects - Load data ONLY ONCE on page reload/mount
  useEffect(() => {
    // Only load if user has permission and hasn't loaded before
    if (hasPermission("billing:manage") && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      loadDashboardData();
    }
  }, [hasPermission, loadDashboardData]);

  // Disabled automatic tab switching and search to prevent excessive API calls
  // useEffect(() => {
  //   if (hasPermission("billing:manage") && activeTab === "invoices") {
  //     loadInvoices();
  //   }
  // }, [hasPermission, activeTab, loadInvoices]);

  // // Debounced search for invoices
  // useEffect(() => {
  //   if (
  //     activeTab === "invoices" &&
  //     hasPermission("billing:manage") &&
  //     searchQuery.trim()
  //   ) {
  //     const timeoutId = setTimeout(() => {
  //       loadInvoices();
  //     }, 500); // Increased debounce time to reduce API calls
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [searchQuery, loadInvoices, activeTab, hasPermission]);

  if (permissionsLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasPermission("billing:manage")) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to view billing information. Contact
              your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            Billing Management
          </h1>
          <p className="text-muted-foreground">
            Overview of billing, invoices, and financial metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshDashboard}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Manual Load Data Notice */}
      {!dashboardData && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <CreditCard className="h-12 w-12 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Ready to Load Billing Data
              </h3>
              <p className="text-blue-700 mb-4">
                Click the button below to fetch your billing dashboard data
              </p>
            </div>
            <Button
              onClick={() => loadDashboardData(true)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Load Dashboard Data
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="ml-2 h-auto p-0"
              onClick={handleRefreshDashboard}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData
                ? formatCurrency(dashboardData.summary?.totalRevenue || 0)
                : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.summary?.totalTaxCollected
                ? `${formatCurrency(
                    dashboardData.summary.totalTaxCollected
                  )} in taxes`
                : "No revenue data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.summary?.totalInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.summary?.paidInvoices || 0} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.summary?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.summary?.overdueInvoices || 0} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData
                ? formatCurrency(dashboardData.summary?.totalTaxCollected || 0)
                : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentInvoices &&
            dashboardData.recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentInvoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">#{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof invoice.customerId === "object"
                          ? invoice.customerId.email
                          : invoice.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(invoice.total)}
                      </p>
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "default"
                            : invoice.status === "pending"
                            ? "secondary"
                            : invoice.status === "overdue"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Invoices
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent invoices found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.topCustomers &&
            dashboardData.topCustomers.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topCustomers.map((customer, index) => (
                  <div
                    key={customer.customerId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{customer.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Customer ID: {customer.customerId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total spent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No customer data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.revenueByMonth &&
              dashboardData.revenueByMonth.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData.revenueByMonth.slice(-3).map((month) => (
                      <div
                        key={month.month}
                        className="text-center p-4 bg-muted/50 rounded-lg"
                      >
                        <p className="text-sm font-medium">{month.month}</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(month.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tax: {formatCurrency(month.taxCollected)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("revenue")}
                    >
                      View Detailed Analytics
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No revenue trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {/* Invoice Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Invoice Management
                <Link
                  href="/invoices/create"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleRefreshInvoices} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Invoices
                </Button>
              </div>

              {/* Load Invoices Notice */}
              {invoices.length === 0 && !invoicesLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-blue-700">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Click "Load Invoices" to fetch invoice data
                    </span>
                  </div>
                </div>
              )}

              {/* Invoice Table */}
              {invoicesLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No invoices found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {(statusFilter && statusFilter !== "all") || searchQuery
                      ? "No invoices match your current filters"
                      : "Get started by creating your first invoice"}
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/invoices/create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Invoice
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">
                          #{invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {invoice.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "pending"
                                ? "secondary"
                                : invoice.status === "overdue"
                                ? "destructive"
                                : invoice.status === "void"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/dashboard/invoices/${invoice._id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/dashboard/invoices/${invoice._id}/edit`)
                              }
                              disabled={
                                invoice.status === "paid" ||
                                invoice.status === "void"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {invoice.status !== "void" &&
                              invoice.status !== "paid" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVoidInvoice(invoice._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {invoices.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {/* Detailed Revenue Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.revenueByMonth &&
              dashboardData.revenueByMonth.length > 0 ? (
                <div className="space-y-6">
                  {/* Monthly Revenue Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardData.revenueByMonth.map((month) => (
                      <div key={month.month} className="p-4 border rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">
                          {month.month}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(month.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tax: {formatCurrency(month.taxCollected)}
                        </p>
                        <div className="mt-2 bg-green-100 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (month.revenue /
                                  Math.max(
                                    ...dashboardData.revenueByMonth.map(
                                      (m) => m.revenue
                                    )
                                  )) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            dashboardData.revenueByMonth.reduce(
                              (acc, month) => acc + month.revenue,
                              0
                            )
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Across all {dashboardData.revenueByMonth.length}{" "}
                          months
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Average Monthly
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            dashboardData.revenueByMonth.reduce(
                              (acc, month) => acc + month.revenue,
                              0
                            ) / dashboardData.revenueByMonth.length
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Per month average
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Tax Collected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            dashboardData.revenueByMonth.reduce(
                              (acc, month) => acc + month.taxCollected,
                              0
                            )
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tax collection total
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No revenue data available
                  </h3>
                  <p className="text-muted-foreground">
                    Revenue trends will appear here once you have billing data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
