// components/tax/tax-reports-view.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTaxReports } from "@/hooks/useTaxReports";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Percent,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { taxService } from "@/lib/services/tax.service";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TaxReportSummary {
  totalTaxCollected: number;
  totalTransactions: number;
  averageTaxPerTransaction: number;
  complianceRate: number;
  periodComparison: {
    taxCollectedChange: number;
    transactionCountChange: number;
    complianceChange: number;
  };
}

interface TaxReportBreakdown {
  category: string;
  label: string;
  totalTaxCollected: number;
  transactionCount: number;
  averageRate: number;
  complianceStatus: "COMPLIANT" | "WARNING" | "NON_COMPLIANT";
  change: number;
}

interface ComplianceIssue {
  id: string;
  type: "MISSING_TAX" | "INCORRECT_RATE" | "LATE_FILING" | "DOCUMENTATION";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  jurisdiction: string;
  description: string;
  affectedTransactions: number;
  recommendedAction: string;
}

export function TaxReportsView() {
  const [reportParams, setReportParams] = useState({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    groupBy: "state",
    country: "",
    state: "",
    reportType: "summary",
  });

  const [reportData, setReportData] = useState<{
    summary: TaxReportSummary | null;
    breakdown: TaxReportBreakdown[];
    complianceIssues: ComplianceIssue[];
  }>({
    summary: null,
    breakdown: [],
    complianceIssues: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    report,
    loading: hookLoading,
    error: hookError,
  } = useTaxReports(reportParams);

  const loadMockData = () => {
    const mockSummary: TaxReportSummary = {
      totalTaxCollected: 45678.9,
      totalTransactions: 1248,
      averageTaxPerTransaction: 36.6,
      complianceRate: 87.5,
      periodComparison: {
        taxCollectedChange: 12.3,
        transactionCountChange: 8.7,
        complianceChange: -2.1,
      },
    };

    const mockBreakdown: TaxReportBreakdown[] = [
      {
        category: "state",
        label: "California, US",
        totalTaxCollected: 18567.45,
        transactionCount: 456,
        averageRate: 8.75,
        complianceStatus: "COMPLIANT",
        change: 15.2,
      },
      {
        category: "state",
        label: "New York, US",
        totalTaxCollected: 15234.67,
        transactionCount: 389,
        averageRate: 8.25,
        complianceStatus: "WARNING",
        change: 7.8,
      },
      {
        category: "state",
        label: "Ontario, CA",
        totalTaxCollected: 11876.78,
        transactionCount: 403,
        averageRate: 13.0,
        complianceStatus: "COMPLIANT",
        change: -3.4,
      },
    ];

    const mockComplianceIssues: ComplianceIssue[] = [
      {
        id: "1",
        type: "INCORRECT_RATE",
        severity: "MEDIUM",
        jurisdiction: "Texas, US",
        description:
          "Tax rate applied (6.5%) differs from current rate (6.25%)",
        affectedTransactions: 12,
        recommendedAction:
          "Update tax rate configuration and recalculate affected transactions",
      },
      {
        id: "2",
        type: "MISSING_TAX",
        severity: "HIGH",
        jurisdiction: "Florida, US",
        description: "Some transactions missing required state tax",
        affectedTransactions: 8,
        recommendedAction:
          "Review exemption rules and apply tax where required",
      },
    ];

    setReportData({
      summary: mockSummary,
      breakdown: mockBreakdown,
      complianceIssues: mockComplianceIssues,
    });
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      loadMockData();
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Report generation failed:", error);
      setError("Failed to generate report");
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    try {
      toast.loading("Exporting report...");

      // Mock export functionality
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, this would call the API
      // const blob = await taxService.exportTaxReport(format, reportParams);

      // Create mock download
      const mockData =
        format === "json"
          ? JSON.stringify(reportData, null, 2)
          : "Tax Report Data\n...\n"; // CSV/PDF mock

      const blob = new Blob([mockData], {
        type: format === "json" ? "application/json" : "text/plain",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-report-${reportParams.startDate}-${reportParams.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export report");
      console.error("Export error:", error);
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    const colors = {
      COMPLIANT: "bg-green-100 text-green-800",
      WARNING: "bg-yellow-100 text-yellow-800",
      NON_COMPLIANT: "bg-red-100 text-red-800",
    };

    const icons = {
      COMPLIANT: <CheckCircle className="h-3 w-3" />,
      WARNING: <AlertCircle className="h-3 w-3" />,
      NON_COMPLIANT: <AlertCircle className="h-3 w-3" />,
    };

    return (
      <Badge
        variant="outline"
        className={`${
          colors[status as keyof typeof colors]
        } flex items-center gap-1`}
      >
        {icons[status as keyof typeof icons]}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        variant="outline"
        className={colors[severity as keyof typeof colors] || colors.LOW}
      >
        {severity}
      </Badge>
    );
  };

  const getChangeIndicator = (change: number) => {
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive tax reports and analyze compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            onValueChange={(value) =>
              handleExport(value as "csv" | "json" | "pdf")
            }
          >
            <SelectTrigger className="w-[140px]">
              <Download className="h-4 w-4 mr-2" />
              <span>Export</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export CSV</SelectItem>
              <SelectItem value="json">Export JSON</SelectItem>
              <SelectItem value="pdf">Export PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Parameters
          </CardTitle>
          <CardDescription>
            Configure report parameters and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportParams.startDate}
                onChange={(e) =>
                  setReportParams({
                    ...reportParams,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportParams.endDate}
                onChange={(e) =>
                  setReportParams({ ...reportParams, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={reportParams.reportType}
                onValueChange={(value) =>
                  setReportParams({ ...reportParams, reportType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="comparison">Period Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupBy">Group By</Label>
              <Select
                value={reportParams.groupBy}
                onValueChange={(value) =>
                  setReportParams({ ...reportParams, groupBy: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="taxType">Tax Type</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country Filter</Label>
              <Input
                id="country"
                value={reportParams.country}
                onChange={(e) =>
                  setReportParams({ ...reportParams, country: e.target.value })
                }
                placeholder="e.g., US"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(error || hookError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || hookError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {reportData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Tax Collected
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(reportData.summary.totalTaxCollected)}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  {getChangeIndicator(
                    reportData.summary.periodComparison.taxCollectedChange
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-semibold">
                    {reportData.summary.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Receipt className="h-6 w-6 text-blue-600" />
                  {getChangeIndicator(
                    reportData.summary.periodComparison.transactionCountChange
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg. Tax per Transaction
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(
                      reportData.summary.averageTaxPerTransaction
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Percent className="h-6 w-6 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Per txn</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Compliance Rate
                  </p>
                  <p className="text-2xl font-semibold">
                    {reportData.summary.complianceRate}%
                  </p>
                  <Progress
                    value={reportData.summary.complianceRate}
                    className="mt-2 h-2"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                  {getChangeIndicator(
                    reportData.summary.periodComparison.complianceChange
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList>
          <TabsTrigger value="breakdown">Breakdown Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Issues</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tax Collection Breakdown by {reportParams.groupBy}
              </CardTitle>
              <CardDescription>
                Detailed breakdown of tax collection and compliance by
                jurisdiction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Tax Collected</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Avg. Rate</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || hookLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Generating report data...
                      </TableCell>
                    </TableRow>
                  ) : reportData.breakdown.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No breakdown data available for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.breakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.label}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.totalTaxCollected)}
                        </TableCell>
                        <TableCell>
                          {item.transactionCount.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.averageRate}%</TableCell>
                        <TableCell>
                          {getComplianceStatusBadge(item.complianceStatus)}
                        </TableCell>
                        <TableCell>{getChangeIndicator(item.change)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Compliance Issues
              </CardTitle>
              <CardDescription>
                Outstanding compliance issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.complianceIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No compliance issues found</p>
                  <p className="text-sm">
                    All tax calculations appear to be compliant
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportData.complianceIssues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {issue.type.replace("_", " ")}
                          </Badge>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {issue.jurisdiction}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{issue.description}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Affected transactions: {issue.affectedTransactions}
                      </p>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Recommended Action:</strong>{" "}
                          {issue.recommendedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trends & Insights
              </CardTitle>
              <CardDescription>
                Tax collection trends and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Positive Trends
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      • Tax collection increased by 12.3% compared to previous
                      period
                    </li>
                    <li>• Transaction volume grew by 8.7%</li>
                    <li>• California shows strong compliance at 95%+</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Areas for Improvement
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Overall compliance rate decreased by 2.1%</li>
                    <li>• New York has several rate discrepancies</li>
                    <li>• Some transactions missing required documentation</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Recommendations
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Review and update tax rate configurations</li>
                    <li>• Implement automated compliance checking</li>
                    <li>• Schedule regular compliance audits</li>
                    <li>• Enhance documentation collection processes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
