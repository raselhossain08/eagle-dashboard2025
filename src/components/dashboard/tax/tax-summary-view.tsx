// components/tax/tax-summary-view.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TaxSummary } from "@/types/tax";
import { taxService } from "@/lib/services/tax.service";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  FileText,
  Users,
  RefreshCw,
  AlertCircle,
  Calculator,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TaxCalculation {
  id: string;
  amount: number;
  taxAmount: number;
  jurisdiction: string;
  taxType: string;
  calculatedAt: string;
  status: "completed" | "pending" | "failed";
}

interface JurisdictionStats {
  jurisdiction: string;
  taxCollected: number;
  transactionCount: number;
  averageRate: number;
}

interface TaxAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  jurisdiction?: string;
  createdAt: string;
}

export function TaxSummaryView() {
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentCalculations, setRecentCalculations] = useState<
    TaxCalculation[]
  >([]);
  const [topJurisdictions, setTopJurisdictions] = useState<JurisdictionStats[]>(
    []
  );
  const [alerts, setAlerts] = useState<TaxAlert[]>([]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taxService.getTaxSummary();
      setSummary(response.data);

      // Load additional data with mock fallback
      await loadAdditionalData();
    } catch (error) {
      console.error("Failed to fetch tax summary:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load tax summary";
      setError(errorMessage);

      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalData = async () => {
    // Mock additional data - replace with real API calls
    const mockCalculations: TaxCalculation[] = [
      {
        id: "calc_001",
        amount: 1500.0,
        taxAmount: 135.0,
        jurisdiction: "CA-ON",
        taxType: "HST",
        calculatedAt: new Date().toISOString(),
        status: "completed",
      },
      {
        id: "calc_002",
        amount: 850.0,
        taxAmount: 42.5,
        jurisdiction: "US-NY",
        taxType: "Sales Tax",
        calculatedAt: new Date(Date.now() - 3600000).toISOString(),
        status: "completed",
      },
      {
        id: "calc_003",
        amount: 2200.0,
        taxAmount: 198.0,
        jurisdiction: "UK",
        taxType: "VAT",
        calculatedAt: new Date(Date.now() - 7200000).toISOString(),
        status: "pending",
      },
    ];

    const mockJurisdictions: JurisdictionStats[] = [
      {
        jurisdiction: "US-CA",
        taxCollected: 45230.75,
        transactionCount: 234,
        averageRate: 8.75,
      },
      {
        jurisdiction: "CA-ON",
        taxCollected: 32150.25,
        transactionCount: 156,
        averageRate: 13.0,
      },
      {
        jurisdiction: "UK",
        taxCollected: 28940.5,
        transactionCount: 98,
        averageRate: 20.0,
      },
    ];

    const mockAlerts: TaxAlert[] = [
      {
        id: "alert_001",
        type: "warning",
        message: "Tax rate for UK jurisdiction expires in 30 days",
        jurisdiction: "UK",
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert_002",
        type: "info",
        message: "New tax regulation updates available for US-CA",
        jurisdiction: "US-CA",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    setRecentCalculations(mockCalculations);
    setTopJurisdictions(mockJurisdictions);
    setAlerts(mockAlerts);
  };

  const loadMockData = () => {
    const mockSummary: any = {
      totalTaxCollected: 125430.5,
      monthlyTaxCollected: 8750.25,
      taxRatesConfigured: 15,
      activeJurisdictions: 8,
      complianceScore: 92,
      pendingCalculations: 3,
      totalTransactions: 1250,
      averageTaxRate: 11.5,
      period: "2024-11",
      overview: {
        totalTaxRates: 15,
        activeTaxRates: 12,
        inactiveTaxRates: 3,
        countries: 8,
        states: 45,
      },
      recentActivity: {
        last30Days: {
          taxCollected: 125430.5,
          transactionCount: 1250,
        },
        last7Days: {
          taxCollected: 8750.25,
          transactionCount: 89,
        },
      },
    };

    setSummary(mockSummary);
    loadAdditionalData();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
    toast.success("Tax summary refreshed");
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: "default" as const, label: "Completed" },
      pending: { variant: "secondary" as const, label: "Pending" },
      failed: { variant: "destructive" as const, label: "Failed" },
    };

    const statusConfig =
      config[status as keyof typeof config] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="link"
            onClick={fetchSummary}
            className="ml-2 h-auto p-0"
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Overview</h2>
          <p className="text-muted-foreground">
            Summary of tax calculations, rates, and compliance status
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tax Collected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.recentActivity?.last30Days?.taxCollected
                ? formatCurrency(summary.recentActivity.last30Days.taxCollected)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.recentActivity?.last7Days?.taxCollected
                ? formatCurrency(summary.recentActivity.last7Days.taxCollected)
                : formatCurrency(0)}{" "}
              this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Jurisdictions
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.overview?.countries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overview?.totalTaxRates || 0} tax rates configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <Progress value={95} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Transactions
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.recentActivity?.last30Days?.transactionCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tax Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.jurisdiction && (
                      <p className="text-xs text-muted-foreground">
                        Jurisdiction: {alert.jurisdiction}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Top Jurisdictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tax Calculations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tax Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {formatCurrency(calc.amount)}
                      </p>
                      <Badge variant="outline">{calc.jurisdiction}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {calc.taxType} • Tax: {formatCurrency(calc.taxAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(calc.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(calc.calculatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Jurisdictions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tax Jurisdictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJurisdictions.map((jurisdiction) => (
                <div
                  key={jurisdiction.jurisdiction}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{jurisdiction.jurisdiction}</p>
                    <p className="text-sm text-muted-foreground">
                      {jurisdiction.transactionCount} transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(jurisdiction.taxCollected)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Percent className="h-3 w-3" />
                      {jurisdiction.averageRate}% avg rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
