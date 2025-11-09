"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { billingService } from "@/lib/services/billing.service";
import {
  Coins,
  DollarSign,
  RefreshCw,
  Settings,
  Edit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
  rate?: number;
  lastUpdated?: string;
}

export default function CurrencySettingsPage() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [primaryCurrency, setPrimaryCurrency] = useState("USD");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("1h");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  // Load currencies on component mount
  useEffect(() => {
    if (!permissionsLoading && hasPermission("billing:manage")) {
      loadCurrencies();
    }
  }, [permissionsLoading, hasPermission]);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await billingService.getCurrencies();

      if (response.success && response.data) {
        // Add mock exchange rates and enabled status for demo
        const currenciesWithRates = response.data.map((currency: Currency) => ({
          ...currency,
          enabled: ["USD", "EUR", "GBP", "CAD", "AUD"].includes(currency.code),
          rate: currency.code === "USD" ? 1.0 : Math.random() * 2 + 0.5,
          lastUpdated: new Date().toISOString(),
        }));

        setCurrencies(currenciesWithRates);
      } else {
        setError(response.message || "Failed to load currencies");
      }
    } catch (err) {
      setError("Failed to load currencies. Please try again.");
      console.error("Load currencies error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshExchangeRates = async () => {
    try {
      setRefreshing(true);
      setError("");

      // Simulate API call to refresh exchange rates
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedCurrencies = currencies.map((currency) => ({
        ...currency,
        rate: currency.code === "USD" ? 1.0 : Math.random() * 2 + 0.5,
        lastUpdated: new Date().toISOString(),
      }));

      setCurrencies(updatedCurrencies);
      setSuccess("Exchange rates updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to refresh exchange rates");
      console.error("Refresh rates error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleCurrency = async (currencyCode: string, enabled: boolean) => {
    try {
      setUpdating(true);
      setError("");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrencies((prev) =>
        prev.map((currency) =>
          currency.code === currencyCode ? { ...currency, enabled } : currency
        )
      );

      setSuccess(
        `${currencyCode} ${enabled ? "enabled" : "disabled"} successfully`
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update currency status");
      console.error("Toggle currency error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const updateCurrencyRate = async (currencyCode: string, newRate: number) => {
    try {
      setUpdating(true);
      setError("");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrencies((prev) =>
        prev.map((currency) =>
          currency.code === currencyCode
            ? {
                ...currency,
                rate: newRate,
                lastUpdated: new Date().toISOString(),
              }
            : currency
        )
      );

      setSuccess(`${currencyCode} rate updated successfully`);
      setEditingCurrency(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update exchange rate");
      console.error("Update rate error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setUpdating(true);
      setError("");

      // Simulate API call to save configuration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Currency configuration saved successfully");
      setIsConfigOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save configuration");
      console.error("Save config error:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Loading state while permissions are being checked
  if (permissionsLoading) {
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

  // Permission check
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
              You don't have permission to manage currency settings. Contact
              your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state while currencies are being loaded
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading currencies...</span>
        </div>
      </div>
    );
  }

  const enabledCurrencies = currencies.filter((c) => c.enabled);
  const lastUpdated =
    currencies.length > 0
      ? new Date(currencies[0].lastUpdated || "").toLocaleString()
      : "Never";

  return (
    <div className="p-6 space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Currency Settings
          </h1>
          <p className="text-muted-foreground">
            Manage supported currencies and exchange rates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshExchangeRates}
            disabled={refreshing || updating}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Rates
          </Button>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button disabled={updating}>
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Currency Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primary-currency">Primary Currency</Label>
                  <Select
                    value={primaryCurrency}
                    onValueChange={setPrimaryCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto Refresh Rates</Label>
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>

                {autoRefresh && (
                  <div>
                    <Label htmlFor="refresh-interval">Refresh Interval</Label>
                    <Select
                      value={refreshInterval}
                      onValueChange={setRefreshInterval}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">Every 15 minutes</SelectItem>
                        <SelectItem value="1h">Every hour</SelectItem>
                        <SelectItem value="6h">Every 6 hours</SelectItem>
                        <SelectItem value="24h">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={saveConfiguration}
                  className="w-full"
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Configuration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Supported Currencies
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCurrencies.length}</div>
            <p className="text-xs text-muted-foreground">
              of {currencies.length} total currencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Primary Currency
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryCurrency}</div>
            <p className="text-xs text-muted-foreground">
              Default billing currency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated !== "Never" ? "Today" : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Exchange rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable/disable currencies and manage exchange rates
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <span className="mr-2">{currency.symbol}</span>
                      {currency.code}
                    </div>
                  </TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>
                    {currency.code === primaryCurrency ? (
                      <Badge variant="outline">Base</Badge>
                    ) : (
                      <span>{currency.rate?.toFixed(4) || "N/A"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Switch
                        checked={currency.enabled}
                        onCheckedChange={(checked) =>
                          toggleCurrency(currency.code, checked)
                        }
                        disabled={updating || currency.code === primaryCurrency}
                      />
                      <Badge
                        variant={currency.enabled ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {currency.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {currency.lastUpdated
                      ? new Date(currency.lastUpdated).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {currency.enabled && currency.code !== primaryCurrency && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCurrency(currency)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Edit Exchange Rate - {currency.code}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rate">
                                Exchange Rate (to {primaryCurrency})
                              </Label>
                              <Input
                                id="rate"
                                type="number"
                                step="0.0001"
                                defaultValue={currency.rate}
                                placeholder="Enter exchange rate"
                              />
                            </div>
                            <Button
                              onClick={() => {
                                const input = document.getElementById(
                                  "rate"
                                ) as HTMLInputElement;
                                updateCurrencyRate(
                                  currency.code,
                                  parseFloat(input.value)
                                );
                              }}
                              className="w-full"
                              disabled={updating}
                            >
                              {updating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Update Rate
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
