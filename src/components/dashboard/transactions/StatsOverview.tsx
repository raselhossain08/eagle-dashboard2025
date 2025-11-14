// components/transactions/StatsOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionStats } from "@/lib/services/transactio.service";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface StatsOverviewProps {
  stats: TransactionStats | null;
  loading?: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  // Show loading skeleton
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Earnings",
      value: (stats?.totalAmount || 0) / 100, // Convert cents to dollars
      format: "currency",
      icon: DollarSign,
      description:
        (stats?.totalAmount ?? 0) > 0
          ? "All time revenue"
          : "No transactions yet",
      trend: stats?.totalAmount && stats.totalAmount > 0 ? "+" : "",
    },
    {
      title: "Net Earnings",
      value: (stats?.totalNet || 0) / 100, // Convert cents to dollars
      format: "currency",
      icon: TrendingUp,
      description: stats?.totalFees
        ? `After $${(stats.totalFees / 100).toFixed(2)} fees`
        : "After fees deduction",
      highlight: true,
    },
    {
      title: "Successful Payments",
      value: stats?.succeededCount || 0,
      format: "number",
      icon: CreditCard,
      description: `${stats?.successRate || 0}% success rate`,
    },
    {
      title: "Total Transactions",
      value: stats?.totalTransactions || 0,
      format: "number",
      icon: RefreshCw,
      description:
        (stats?.totalTransactions ?? 0) > 0
          ? "All payment attempts"
          : "No transactions",
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "percentage":
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index} className={card.highlight ? "border-primary" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon
              className={`h-4 w-4 ${
                card.highlight ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                card.highlight ? "text-primary" : ""
              }`}
            >
              {card.trend && (
                <span className="text-green-500 text-sm mr-1">
                  {card.trend}
                </span>
              )}
              {formatValue(card.value, card.format)}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
