// components/tax/tax-validation.tsx
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
import { useTaxValidation } from "@/hooks/useTaxValidation";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: "COMPLIANCE" | "CALCULATION" | "DATA" | "THRESHOLD";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  active: boolean;
}

interface ValidationResult {
  id: string;
  ruleId: string;
  ruleName: string;
  status: "PASS" | "FAIL" | "WARNING";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  details?: string;
  affectedRecords?: number;
  timestamp: string;
}

interface ValidationSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  complianceScore: number;
  lastRun: string;
}

export function TaxValidation() {
  // Tax ID Validation (original functionality)
  const [formData, setFormData] = useState({
    taxId: "",
    country: "US",
    state: "",
  });

  // System Validation (new functionality)
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const {
    validateTaxId,
    result,
    loading: taxIdLoading,
    error,
  } = useTaxValidation();

  const loadMockData = () => {
    // Mock validation rules
    const mockRules: ValidationRule[] = [
      {
        id: "1",
        name: "Tax Rate Consistency",
        description: "Verify tax rates match jurisdiction requirements",
        type: "COMPLIANCE",
        severity: "HIGH",
        active: true,
      },
      {
        id: "2",
        name: "Calculation Accuracy",
        description: "Validate tax calculations for correctness",
        type: "CALCULATION",
        severity: "CRITICAL",
        active: true,
      },
      {
        id: "3",
        name: "Data Completeness",
        description: "Check for missing tax-related data",
        type: "DATA",
        severity: "MEDIUM",
        active: true,
      },
      {
        id: "4",
        name: "Threshold Monitoring",
        description: "Monitor tax thresholds and exemption limits",
        type: "THRESHOLD",
        severity: "LOW",
        active: false,
      },
    ];

    // Mock validation results
    const mockResults: ValidationResult[] = [
      {
        id: "1",
        ruleId: "1",
        ruleName: "Tax Rate Consistency",
        status: "PASS",
        severity: "HIGH",
        message: "All tax rates are consistent with jurisdiction requirements",
        affectedRecords: 0,
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        ruleId: "2",
        ruleName: "Calculation Accuracy",
        status: "FAIL",
        severity: "CRITICAL",
        message: "Found calculation discrepancies in 3 transactions",
        details:
          "Discrepancies found in transactions: TXN-001, TXN-045, TXN-098",
        affectedRecords: 3,
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "3",
        ruleId: "3",
        ruleName: "Data Completeness",
        status: "WARNING",
        severity: "MEDIUM",
        message: "Some customer records are missing tax exemption data",
        details: "15 customer records missing exemption certificates",
        affectedRecords: 15,
        timestamp: "2024-01-15T10:30:00Z",
      },
    ];

    // Mock summary
    const mockSummary: ValidationSummary = {
      totalChecks: 3,
      passed: 1,
      failed: 1,
      warnings: 1,
      complianceScore: 67,
      lastRun: "2024-01-15T10:30:00Z",
    };

    setValidationRules(mockRules);
    setValidationResults(mockResults);
    setSummary(mockSummary);
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await validateTaxId({
        taxId: formData.taxId,
        country: formData.country,
        state: formData.state || undefined,
      });
      toast.success("Tax ID validated");
    } catch (err) {
      toast.error("Failed to validate tax ID");
    }
  };

  const runSystemValidation = async () => {
    setLoading(true);
    setSystemError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, this would call the API
      loadMockData();

      toast.success("System validation completed successfully");
    } catch (error) {
      console.error("Validation failed:", error);
      setSystemError("Failed to run system validation");
      toast.error("System validation failed");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const csvContent = [
      [
        "Rule Name",
        "Status",
        "Severity",
        "Message",
        "Affected Records",
        "Timestamp",
      ].join(","),
      ...validationResults.map((result) =>
        [
          `"${result.ruleName}"`,
          result.status,
          result.severity,
          `"${result.message}"`,
          result.affectedRecords || 0,
          formatDate(result.timestamp),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-validation-results-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Validation results exported");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
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

  const getStatusBadge = (status: string) => {
    const colors = {
      PASS: "bg-green-100 text-green-800",
      FAIL: "bg-red-100 text-red-800",
      WARNING: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge
        variant="outline"
        className={colors[status as keyof typeof colors] || colors.PASS}
      >
        {status}
      </Badge>
    );
  };

  const filteredResults = validationResults.filter((result) => {
    const matchesSeverity =
      !selectedSeverity || result.severity === selectedSeverity;
    const matchesStatus = !selectedStatus || result.status === selectedStatus;
    return matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Validation</h2>
          <p className="text-muted-foreground">
            Validate tax IDs and monitor system compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportResults}
            disabled={validationResults.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button onClick={runSystemValidation} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Run System Validation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* System Error Alert */}
      {systemError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{systemError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Checks</p>
                  <p className="text-2xl font-semibold">
                    {summary.totalChecks}
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
                  <p className="text-sm text-muted-foreground">Passed</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {summary.passed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {summary.failed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {summary.warnings}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    Compliance Score
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold">
                      {summary.complianceScore}%
                    </p>
                  </div>
                  <Progress
                    value={summary.complianceScore}
                    className="mt-2 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tax-id" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tax-id">Tax ID Validation</TabsTrigger>
          <TabsTrigger value="system">System Validation</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-id" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Tax ID Validation
              </CardTitle>
              <CardDescription>
                Validate tax identification numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleValidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax Identification Number *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    placeholder="Enter tax ID"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="val-country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="val-state">State/Region</Label>
                    <Input
                      id="val-state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="e.g., NY, CA"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={taxIdLoading}
                  className="w-full"
                >
                  {taxIdLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Validate Tax ID
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    result.valid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.valid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">
                          Valid Tax ID
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-800">
                          Invalid Tax ID
                        </span>
                      </>
                    )}
                  </div>

                  {result.formattedTaxId && (
                    <div className="text-sm text-gray-600">
                      Formatted: {result.formattedTaxId}
                    </div>
                  )}

                  {result.jurisdiction && (
                    <div className="text-sm text-gray-600">
                      Jurisdiction: {result.jurisdiction}
                    </div>
                  )}

                  {result.type && (
                    <div className="text-sm text-gray-600">
                      Type: {result.type}
                    </div>
                  )}

                  {result.message && (
                    <div
                      className={`text-sm mt-2 ${
                        result.valid ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.message}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
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
                  <Label>Severity</Label>
                  <Select
                    value={selectedSeverity}
                    onValueChange={setSelectedSeverity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="PASS">Pass</SelectItem>
                      <SelectItem value="FAIL">Fail</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSeverity("");
                      setSelectedStatus("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Validation Results ({filteredResults.length})
              </CardTitle>
              <CardDescription>
                Recent system validation check results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Affected Records</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Running validation checks...
                      </TableCell>
                    </TableRow>
                  ) : filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No validation results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            {getStatusBadge(result.status)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.ruleName}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(result.severity)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{result.message}</p>
                            {result.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.details}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{result.affectedRecords || 0}</TableCell>
                        <TableCell>{formatDate(result.timestamp)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
              <CardDescription>
                Configure and manage validation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                      <TableCell>
                        <Badge variant={rule.active ? "default" : "secondary"}>
                          {rule.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rule.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
