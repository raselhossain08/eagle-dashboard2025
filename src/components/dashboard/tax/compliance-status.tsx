// components/tax/compliance-status.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useTaxCompliance } from "@/hooks/useTaxCompliance";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Bell,
  Download,
  RefreshCw,
  Filter,
  Eye,
  ExternalLink,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ComplianceJurisdiction {
  id: string;
  country: string;
  state: string;
  taxType: string;
  status: "COMPLIANT" | "PENDING" | "OVERDUE" | "AT_RISK";
  filingFrequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  nextDue: string;
  lastFiled: string;
  daysUntilDue: number;
  complianceScore: number;
  registrationNumber?: string;
  requirements: string[];
}

interface ComplianceDeadline {
  id: string;
  type: "FILING" | "PAYMENT" | "REGISTRATION" | "RENEWAL";
  jurisdiction: string;
  description: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  estimatedEffort: string;
}

interface ComplianceSummary {
  totalJurisdictions: number;
  compliant: number;
  pending: number;
  overdue: number;
  atRisk: number;
  overallScore: number;
  upcomingDeadlines: number;
}

export function ComplianceStatus() {
  const [jurisdictions, setJurisdictions] = useState<ComplianceJurisdiction[]>(
    []
  );
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const {
    compliance,
    loading: hookLoading,
    error: hookError,
  } = useTaxCompliance();

  const loadMockData = () => {
    // Mock jurisdictions
    const mockJurisdictions: ComplianceJurisdiction[] = [
      {
        id: "1",
        country: "United States",
        state: "California",
        taxType: "Sales Tax",
        status: "COMPLIANT",
        filingFrequency: "MONTHLY",
        nextDue: "2025-02-15T00:00:00Z",
        lastFiled: "2025-01-15T00:00:00Z",
        daysUntilDue: 15,
        complianceScore: 95,
        registrationNumber: "CA-ST-123456",
        requirements: [
          "Monthly sales tax return",
          "Payment due by 15th",
          "Electronic filing required",
        ],
      },
      {
        id: "2",
        country: "Canada",
        state: "Ontario",
        taxType: "HST",
        status: "PENDING",
        filingFrequency: "QUARTERLY",
        nextDue: "2025-02-05T00:00:00Z",
        lastFiled: "2024-11-05T00:00:00Z",
        daysUntilDue: 5,
        complianceScore: 78,
        registrationNumber: "HST-123456789",
        requirements: [
          "Quarterly HST return",
          "GST/HST remittance",
          "Supporting documentation",
        ],
      },
      {
        id: "3",
        country: "United Kingdom",
        state: "UK",
        taxType: "VAT",
        status: "OVERDUE",
        filingFrequency: "QUARTERLY",
        nextDue: "2025-01-20T00:00:00Z",
        lastFiled: "2024-10-20T00:00:00Z",
        daysUntilDue: -10,
        complianceScore: 45,
        registrationNumber: "GB123456789",
        requirements: [
          "VAT Return submission",
          "VAT payment",
          "EC Sales List (if applicable)",
        ],
      },
      {
        id: "4",
        country: "United States",
        state: "New York",
        taxType: "Sales Tax",
        status: "AT_RISK",
        filingFrequency: "MONTHLY",
        nextDue: "2025-02-03T00:00:00Z",
        lastFiled: "2025-01-03T00:00:00Z",
        daysUntilDue: 3,
        complianceScore: 65,
        registrationNumber: "NY-ST-789012",
        requirements: [
          "Monthly sales tax return",
          "Local tax reporting",
          "Certificate of authority renewal",
        ],
      },
    ];

    // Mock deadlines
    const mockDeadlines: ComplianceDeadline[] = [
      {
        id: "1",
        type: "FILING",
        jurisdiction: "Ontario, CA",
        description: "Q4 2024 HST Return Filing",
        dueDate: "2025-02-05T00:00:00Z",
        priority: "HIGH",
        status: "PENDING",
        estimatedEffort: "2-3 hours",
      },
      {
        id: "2",
        type: "PAYMENT",
        jurisdiction: "New York, US",
        description: "January 2025 Sales Tax Payment",
        dueDate: "2025-02-03T00:00:00Z",
        priority: "CRITICAL",
        status: "PENDING",
        estimatedEffort: "1 hour",
      },
      {
        id: "3",
        type: "FILING",
        jurisdiction: "UK",
        description: "Q4 2024 VAT Return (OVERDUE)",
        dueDate: "2025-01-20T00:00:00Z",
        priority: "CRITICAL",
        status: "OVERDUE",
        estimatedEffort: "3-4 hours",
      },
      {
        id: "4",
        type: "RENEWAL",
        jurisdiction: "California, US",
        description: "Sales Tax Permit Renewal",
        dueDate: "2025-03-15T00:00:00Z",
        priority: "MEDIUM",
        status: "PENDING",
        estimatedEffort: "1-2 hours",
      },
    ];

    // Mock summary
    const mockSummary: ComplianceSummary = {
      totalJurisdictions: 4,
      compliant: 1,
      pending: 1,
      overdue: 1,
      atRisk: 1,
      overallScore: 71,
      upcomingDeadlines: 3,
    };

    setJurisdictions(mockJurisdictions);
    setDeadlines(mockDeadlines);
    setSummary(mockSummary);
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const refreshCompliance = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      loadMockData();
      toast.success("Compliance data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh compliance data:", error);
      setError("Failed to refresh compliance data");
      toast.error("Failed to refresh compliance data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "AT_RISK":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      COMPLIANT: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      OVERDUE: "bg-red-100 text-red-800",
      AT_RISK: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge
        variant="outline"
        className={`${
          colors[status as keyof typeof colors]
        } flex items-center gap-1`}
      >
        {getStatusIcon(status)}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        variant="outline"
        className={colors[priority as keyof typeof colors] || colors.LOW}
      >
        {priority}
      </Badge>
    );
  };

  const getDaysUntilDueColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 3) return "text-orange-600";
    if (days <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredJurisdictions = jurisdictions.filter((j) => {
    const matchesStatus = !statusFilter || j.status === statusFilter;
    return matchesStatus;
  });

  const filteredDeadlines = deadlines.filter((d) => {
    const matchesPriority = !priorityFilter || d.priority === priorityFilter;
    return matchesPriority;
  });

  if (hookLoading && jurisdictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Compliance Status
          </h2>
          <p className="text-muted-foreground">
            Monitor tax compliance across jurisdictions and track deadlines
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Compliance report exported")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={refreshCompliance} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {(error || hookError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || hookError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    Total Jurisdictions
                  </p>
                  <p className="text-2xl font-semibold">
                    {summary.totalJurisdictions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {summary.compliant}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {summary.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {summary.overdue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {summary.atRisk}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-2xl font-semibold ${getComplianceScoreColor(
                        summary.overallScore
                      )}`}
                    >
                      {summary.overallScore}%
                    </p>
                  </div>
                  <Progress value={summary.overallScore} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="jurisdictions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="jurisdictions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="COMPLIANT">Compliant</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="AT_RISK">At Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setStatusFilter("")}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdictions Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tax Compliance by Jurisdiction ({filteredJurisdictions.length})
              </CardTitle>
              <CardDescription>
                Compliance status and filing requirements for each jurisdiction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Compliance Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && jurisdictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading compliance data...
                      </TableCell>
                    </TableRow>
                  ) : filteredJurisdictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No compliance data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJurisdictions.map((jurisdiction) => (
                      <TableRow key={jurisdiction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{jurisdiction.state}</p>
                            <p className="text-sm text-muted-foreground">
                              {jurisdiction.country}
                            </p>
                            {jurisdiction.registrationNumber && (
                              <p className="text-xs text-muted-foreground">
                                {jurisdiction.registrationNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {jurisdiction.taxType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(jurisdiction.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatDate(jurisdiction.nextDue)}
                            </p>
                            <p
                              className={`text-sm ${getDaysUntilDueColor(
                                jurisdiction.daysUntilDue
                              )}`}
                            >
                              {jurisdiction.daysUntilDue < 0
                                ? `${Math.abs(
                                    jurisdiction.daysUntilDue
                                  )} days overdue`
                                : `${jurisdiction.daysUntilDue} days remaining`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${getComplianceScoreColor(
                                jurisdiction.complianceScore
                              )}`}
                            >
                              {jurisdiction.complianceScore}%
                            </span>
                            <Progress
                              value={jurisdiction.complianceScore}
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-6">
          {/* Priority Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Priority Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setPriorityFilter("")}
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>
                Upcoming Deadlines ({filteredDeadlines.length})
              </CardTitle>
              <CardDescription>
                Tax filing and compliance deadlines requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{deadline.type}</Badge>
                        {getPriorityBadge(deadline.priority)}
                        <Badge
                          variant={
                            deadline.status === "OVERDUE"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {deadline.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {deadline.jurisdiction}
                      </span>
                    </div>
                    <h4 className="font-medium mb-2">{deadline.description}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">
                          {formatDate(deadline.dueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Estimated Effort
                        </p>
                        <p className="font-medium">
                          {deadline.estimatedEffort}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredDeadlines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No deadlines match the current filter</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>
                Important compliance notifications and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>UK VAT Return Overdue:</strong> Q4 2024 VAT return
                    is 10 days overdue. Penalties may apply.
                    <Button
                      variant="link"
                      className="ml-2 h-auto p-0 text-red-600"
                    >
                      File Now
                    </Button>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ontario HST Due Soon:</strong> Q4 2024 HST return
                    due in 5 days (February 5th).
                    <Button variant="link" className="ml-2 h-auto p-0">
                      Prepare Filing
                    </Button>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Certificate Renewal:</strong> California sales tax
                    permit expires in 45 days. Plan renewal process.
                    <Button variant="link" className="ml-2 h-auto p-0">
                      Schedule Renewal
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
