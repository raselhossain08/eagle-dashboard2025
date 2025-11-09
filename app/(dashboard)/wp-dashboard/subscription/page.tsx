"use client";

import { useState, useEffect } from "react";
import { SubscriptionTable } from "@/components/wordpress/subscriptions/subscription-table";
import { SubscriptionStats } from "@/components/wordpress/subscriptions/subscription-stats";
import { SubscriptionFilters } from "@/components/wordpress/subscriptions/subscription-filters";
import { subscriptionService } from "@/wordpress/services/subscriptionService";
import { SubscriptionsResponse } from "@/wordpress/types/subscription";

export default function SubscriptionsPage() {
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.getSubscriptions();
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subscriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading subscriptions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage and view all subscription information
        </p>
      </div>

      <SubscriptionStats summary={data.data.summary} />
      <SubscriptionFilters />
      <SubscriptionTable
        subscriptions={data.data.subscriptions}
        onRefresh={fetchSubscriptions}
      />
    </div>
  );
}
