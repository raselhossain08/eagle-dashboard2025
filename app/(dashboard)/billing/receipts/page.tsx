"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { billingService } from "@/lib/services/billing.service";
import UserService from "@/lib/services/users/user.service";
import { Receipt } from "@/lib/types/billing";
import { UserProfile } from "@/lib/types/user";
import { ResendReceiptDialog } from "@/components/dashboard/billing/receipts/resend-receipt-dialog";
import { ViewReceiptDialog } from "@/components/dashboard/billing/receipts/view-receipt-dialog";
import {
  Search,
  Filter,
  Mail,
  Download,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // Filters
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [customerId, setCustomerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Customer search
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(
    null
  );

  useEffect(() => {
    fetchReceipts();
  }, [currentPage, paymentMethod, customerId, searchQuery]);

  useEffect(() => {
    if (customerSearchQuery) {
      fetchCustomers();
    }
  }, [customerSearchQuery]);

  const fetchCustomers = async () => {
    try {
      const response = await UserService.getUsers({
        search: customerSearchQuery,
        limit: 10,
        page: 1,
      });
      setCustomers(response.data?.users || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(paymentMethod !== "all" && { paymentMethod }),
        ...(customerId && { customerId }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await billingService.getReceipts(params);

      setReceipts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching receipts:", err);
      setError("Failed to load receipts. Please try again.");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReceipts();
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const exportParams = {
        format: "csv",
        dataType: "receipts",
        dateFrom: thirtyDaysAgo.toISOString().split("T")[0],
        dateTo: now.toISOString().split("T")[0],
        ...(paymentMethod !== "all" && { status: paymentMethod }),
      };

      const response = await billingService.exportData(exportParams);

      if (response.data) {
        // Create a blob and download the file
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipts-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error exporting receipts:", err);
      setError("Failed to export receipts. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleResendReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsResendDialogOpen(true);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsViewDialogOpen(true);
  };

  const handleCustomerSelect = (customer: UserProfile | null) => {
    setSelectedCustomer(customer);
    setCustomerId(customer?._id || "");
    setCustomerSearchOpen(false);
  };
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search receipts by invoice ID, customer name, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => fetchReceipts()}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="CARD">Credit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Popover
              open={customerSearchOpen}
              onOpenChange={setCustomerSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerSearchOpen}
                  className="w-full justify-between"
                >
                  {selectedCustomer
                    ? `${selectedCustomer.name} (${selectedCustomer.email})`
                    : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="p-2">
                  <Input
                    placeholder="Search customers..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {customerSearchQuery && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start mb-1"
                          onClick={() => handleCustomerSelect(null)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !selectedCustomer ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Customers
                        </Button>
                        {customers.map((customer) => (
                          <Button
                            key={customer._id}
                            variant="ghost"
                            className="w-full justify-start mb-1"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomer?._id === customer._id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {customer.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {customer.email}
                              </span>
                            </div>
                          </Button>
                        ))}
                        {customers.length === 0 && customerSearchQuery && (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            No customers found.
                          </div>
                        )}
                      </>
                    )}
                    {!customerSearchQuery && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        Start typing to search customers...
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={fetchReceipts}>
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
          <CardDescription>View and manage payment receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No receipts found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow key={receipt._id}>
                    <TableCell className="font-medium">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {typeof receipt.customerId === "string"
                            ? receipt.customerName
                            : `${receipt.customerId.firstName} ${receipt.customerId.lastName}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {typeof receipt.customerId === "string"
                            ? receipt.customerEmail
                            : receipt.customerId.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {receipt.paymentMethod.toLowerCase().replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {receipt.transactionId}
                    </TableCell>
                    <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendReceipt(receipt)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && receipts.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} receipts
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ResendReceiptDialog
        receipt={selectedReceipt}
        open={isResendDialogOpen}
        onOpenChange={setIsResendDialogOpen}
        onReceiptResent={fetchReceipts}
      />

      <ViewReceiptDialog
        receipt={selectedReceipt}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onResendReceipt={handleResendReceipt}
      />
    </div>
  );
}
