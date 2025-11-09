// components/tax/tax-calculator.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import {
  Calculator,
  DollarSign,
  Percent,
  Receipt,
  History,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CalculationHistory {
  id: string;
  amount: number;
  totalAmount: number;
  taxAmount: number;
  country: string;
  state: string;
  timestamp: string;
}

export function TaxCalculator() {
  const [formData, setFormData] = useState({
    amount: "",
    country: "US",
    state: "",
    taxType: "",
    productType: "",
    customerType: "",
  });

  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const { calculateTax, result, loading, error } = useTaxCalculation();

  // Load mock history on mount
  useEffect(() => {
    const mockHistory: CalculationHistory[] = [
      {
        id: "1",
        amount: 1000,
        totalAmount: 1087.5,
        taxAmount: 87.5,
        country: "US",
        state: "CA",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        amount: 500,
        totalAmount: 565,
        taxAmount: 65,
        country: "CA",
        state: "ON",
        timestamp: "2024-01-14T14:20:00Z",
      },
    ];
    setHistory(mockHistory);
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calculationResult = await calculateTax({
        amount: parseFloat(formData.amount),
        country: formData.country,
        state: formData.state || undefined,
        taxType: formData.taxType || undefined,
        productType: formData.productType || undefined,
        customerType: formData.customerType || undefined,
      });

      // Add to history if successful
      if (calculationResult) {
        const newHistoryItem: CalculationHistory = {
          id: Date.now().toString(),
          amount: parseFloat(formData.amount),
          totalAmount: calculationResult.totalAmount,
          taxAmount: calculationResult.taxAmount,
          country: formData.country,
          state: formData.state || "",
          timestamp: new Date().toISOString(),
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
      }

      toast.success("Tax calculated successfully");
    } catch (err) {
      toast.error("Failed to calculate tax");
    }
  };

  const clearForm = () => {
    setFormData({
      amount: "",
      country: "US",
      state: "",
      taxType: "",
      productType: "",
      customerType: "",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("Calculation history cleared");
  };

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Amount", "Tax Amount", "Total Amount", "Country", "State"].join(
        ","
      ),
      ...history.map((item) =>
        [
          formatDate(item.timestamp),
          item.amount.toFixed(2),
          item.taxAmount.toFixed(2),
          item.totalAmount.toFixed(2),
          item.country,
          item.state || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-calculations-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Calculation history exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Calculator</h2>
          <p className="text-muted-foreground">
            Calculate taxes for different jurisdictions and amounts
          </p>
        </div>
        <Button variant="outline" onClick={clearForm}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Calculator
            </CardTitle>
            <CardDescription>
              Enter transaction details to calculate taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
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
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="e.g., NY, CA, ON"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxType">Tax Type</Label>
                  <Select
                    value={formData.taxType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, taxType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                      <SelectItem value="VAT">VAT</SelectItem>
                      <SelectItem value="GST">GST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Tax
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Original Amount:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(result.originalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Amount:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(result.taxAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(result.totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tax Rate</Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Percent className="h-3 w-3" />
                        {result.taxRate}%
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(result.taxAmount)}
                    </span>
                  </div>

                  {result.breakdown && result.breakdown.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tax Breakdown:</h4>
                      {result.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {item.rate}%
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Calculation completed successfully
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter transaction details to calculate taxes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calculation History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Calculation History
              </CardTitle>
              <CardDescription>
                Recent tax calculations ({history.length})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistory}
                disabled={history.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-sm text-muted-foreground">→</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.country}
                      {item.state && `, ${item.state}`} •{" "}
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      {formatCurrency(item.taxAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tax</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No calculation history yet</p>
              <p className="text-sm">
                Calculations will appear here as you use the calculator
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
