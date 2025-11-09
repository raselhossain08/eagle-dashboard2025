"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Download,
  FileText,
  Calendar,
  Shield,
  AlertCircle,
  RefreshCw,
  Filter,
  Settings,
  History,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { billingService } from "@/lib/services/billing.service";
import { formatDate } from "@/lib/utils";

// Types for export functionality
interface ExportRequest {
  format: "CSV" | "JSON";
  dataType: "invoices" | "receipts";
  dateFrom: string;
  dateTo: string;
  currency?: string;
  status?: string;
}

interface ExportStats {
  totalExports: number;
  lastExport?: string;
  availableReports: number;
  exportHistory: ExportHistoryItem[];
}

interface ExportHistoryItem {
  id: string;
  dataType: string;
  format: string;
  recordCount: number;
  exportedAt: string;
  downloadUrl?: string;
  status: "completed" | "failed" | "processing";
}

export default function BillingExportPage() {
  const { hasPermission, isLoading } = usePermissions();

  // Main state management
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Export stats state
  const [exportStats, setExportStats] = useState<ExportStats>({
    totalExports: 0,
    availableReports: 8,
    exportHistory: [],
  });

  // Export form state
  const [exportForm, setExportForm] = useState<ExportRequest>({
    format: "CSV",
    dataType: "invoices",
    dateFrom: "",
    dateTo: "",
    currency: "",
    status: "",
  });

  // Quick export presets
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (hasPermission("financial_reports:export")) {
      loadExportStats();
    }
  }, [hasPermission]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setExportForm((prev) => ({
      ...prev,
      dateTo: now.toISOString().split("T")[0],
      dateFrom: thirtyDaysAgo.toISOString().split("T")[0],
    }));
  }, []);

  const loadExportStats = async () => {
    try {
      setIsLoadingStats(true);
      setError(null);

      // For now, we'll simulate export stats since the backend might not have this specific endpoint
      // In a real implementation, you'd call an API like: billingService.getExportStats()

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with real API call when backend is ready
      const mockStats: ExportStats = {
        totalExports: 245,
        lastExport: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
        availableReports: 8,
        exportHistory: [
          {
            id: "1",
            dataType: "invoices",
            format: "CSV",
            recordCount: 150,
            exportedAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
          {
            id: "2",
            dataType: "receipts",
            format: "JSON",
            recordCount: 89,
            exportedAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
        ],
      };

      setExportStats(mockStats);
    } catch (err) {
      console.error("Failed to load export stats:", err);
      setError("Failed to load export statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Validate form
      if (!exportForm.dateFrom || !exportForm.dateTo) {
        setError("Please select both start and end dates for the export.");
        return;
      }

      // Call the billing service export method
      const response = await billingService.exportData({
        format: exportForm.format,
        dataType: exportForm.dataType,
        dateFrom: exportForm.dateFrom,
        dateTo: exportForm.dateTo,
        ...(exportForm.currency && { currency: exportForm.currency }),
        ...(exportForm.status && { status: exportForm.status }),
      });

      if (response.success) {
        // Handle the export based on format
        if (exportForm.format === "CSV") {
          // Create blob and download for CSV
          const blob = new Blob([response.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exportForm.dataType}_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Handle JSON download
          const blob = new Blob([JSON.stringify(response.data, null, 2)], {
            type: "application/json",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exportForm.dataType}_export_${
            new Date().toISOString().split("T")[0]
          }.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        setSuccessMessage(
          `${exportForm.dataType} exported successfully as ${exportForm.format}!`
        );

        // Refresh export stats after successful export
        loadExportStats();
      } else {
        throw new Error(response.message || "Export failed");
      }
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to export data. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormChange = (field: keyof ExportRequest, value: string) => {
    setExportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setDatePreset = (days: number) => {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);

    setExportForm((prev) => ({
      ...prev,
      dateTo: now.toISOString().split("T")[0],
      dateFrom: pastDate.toISOString().split("T")[0],
    }));
  };

  const handleQuickExport = async (preset: string) => {
    try {
      setActivePreset(preset);
      setIsExporting(true);
      setError(null);

      let exportConfig: ExportRequest;
      const now = new Date();
      const pastDate = new Date();

      switch (preset) {
        case "invoices-30d":
          pastDate.setDate(pastDate.getDate() - 30);
          exportConfig = {
            format: "CSV",
            dataType: "invoices",
            dateFrom: pastDate.toISOString().split("T")[0],
            dateTo: now.toISOString().split("T")[0],
          };
          break;
        case "receipts-30d":
          pastDate.setDate(pastDate.getDate() - 30);
          exportConfig = {
            format: "CSV",
            dataType: "receipts",
            dateFrom: pastDate.toISOString().split("T")[0],
            dateTo: now.toISOString().split("T")[0],
          };
          break;
        case "paid-invoices":
          pastDate.setDate(pastDate.getDate() - 90);
          exportConfig = {
            format: "CSV",
            dataType: "invoices",
            dateFrom: pastDate.toISOString().split("T")[0],
            dateTo: now.toISOString().split("T")[0],
            status: "paid",
          };
          break;
        case "pending-invoices":
          pastDate.setDate(pastDate.getDate() - 90);
          exportConfig = {
            format: "CSV",
            dataType: "invoices",
            dateFrom: pastDate.toISOString().split("T")[0],
            dateTo: now.toISOString().split("T")[0],
            status: "pending",
          };
          break;
        default:
          throw new Error("Unknown export preset");
      }

      const response = await billingService.exportData(exportConfig);

      if (response.success) {
        // Handle download
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${preset}_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSuccessMessage(`Quick export "${preset}" completed successfully!`);
        loadExportStats();
      } else {
        throw new Error(response.message || "Quick export failed");
      }
    } catch (err) {
      console.error("Quick export error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to perform quick export."
      );
    } finally {
      setIsExporting(false);
      setActivePreset(null);
    }
  };

  if (isLoading || isLoadingStats) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (!hasPermission("financial_reports:export")) {
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
              You don't have permission to export billing data. Contact your
              administrator for access.
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
            <Download className="h-8 w-8 text-blue-600" />
            Billing Export
          </h1>
          <p className="text-muted-foreground">
            Export billing data, invoices, and financial reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadExportStats}
            disabled={isLoadingStats}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingStats ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exportStats.availableReports}
            </div>
            <p className="text-xs text-muted-foreground">Export types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Export</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exportStats.lastExport
                ? Math.ceil(
                    (Date.now() - new Date(exportStats.lastExport).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + " days"
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {exportStats.lastExport ? "Ago" : "No exports yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportStats.totalExports}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quick Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => handleQuickExport("invoices-30d")}
              disabled={isExporting}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Invoices (30 days)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Export last 30 days invoices as CSV
              </span>
              {activePreset === "invoices-30d" && isExporting && (
                <RefreshCw className="h-3 w-3 animate-spin mt-1" />
              )}
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => handleQuickExport("receipts-30d")}
              disabled={isExporting}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Receipts (30 days)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Export last 30 days receipts as CSV
              </span>
              {activePreset === "receipts-30d" && isExporting && (
                <RefreshCw className="h-3 w-3 animate-spin mt-1" />
              )}
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => handleQuickExport("paid-invoices")}
              disabled={isExporting}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Paid Invoices</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Export all paid invoices (90 days)
              </span>
              {activePreset === "paid-invoices" && isExporting && (
                <RefreshCw className="h-3 w-3 animate-spin mt-1" />
              )}
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => handleQuickExport("pending-invoices")}
              disabled={isExporting}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Pending Invoices</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Export pending invoices (90 days)
              </span>
              {activePreset === "pending-invoices" && isExporting && (
                <RefreshCw className="h-3 w-3 animate-spin mt-1" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type and Format Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select
                value={exportForm.dataType}
                onValueChange={(value: "invoices" | "receipts") =>
                  handleFormChange("dataType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="receipts">Receipts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select
                value={exportForm.format}
                onValueChange={(value: "CSV" | "JSON") =>
                  handleFormChange("format", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="JSON">JSON (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset(7)}
                  type="button"
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset(30)}
                  type="button"
                >
                  Last 30 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset(90)}
                  type="button"
                >
                  Last 90 days
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  From Date
                </label>
                <Input
                  type="date"
                  value={exportForm.dateFrom}
                  onChange={(e) => handleFormChange("dateFrom", e.target.value)}
                  max={
                    exportForm.dateTo || new Date().toISOString().split("T")[0]
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={exportForm.dateTo}
                  onChange={(e) => handleFormChange("dateTo", e.target.value)}
                  min={exportForm.dateFrom}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Optional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency (Optional)</label>
              <Select
                value={exportForm.currency}
                onValueChange={(value) => handleFormChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Currencies</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportForm.dataType === "invoices" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Invoice Status (Optional)
                </label>
                <Select
                  value={exportForm.status}
                  onValueChange={(value) => handleFormChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={
                isExporting || !exportForm.dateFrom || !exportForm.dateTo
              }
              className="min-w-32"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportStats.exportHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No exports yet</p>
              <p className="text-sm">Your export history will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Exported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportStats.exportHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.dataType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.format}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.recordCount.toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDate(item.exportedAt)}</TableCell>
                    <TableCell>
                      {item.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {item.status === "processing" && (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Processing
                        </Badge>
                      )}
                      {item.status === "failed" && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === "completed" && item.downloadUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // In a real implementation, this would download the file
                            // For now, we'll show a message
                            setSuccessMessage(
                              "Download functionality will be implemented when backend provides download URLs"
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === "completed" && !item.downloadUrl && (
                        <span className="text-sm text-muted-foreground">
                          Expired
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
