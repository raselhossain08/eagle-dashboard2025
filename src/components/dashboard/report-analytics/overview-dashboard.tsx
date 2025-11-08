// components/analytics/overview-dashboard.tsx
"use client";

import { useOverview } from "@/lib/hooks/useReportAnalytics";
import { MetricCard } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OverviewDashboard() {
  const { data, loading, error } = useOverview();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((metric, index) => {
          // Parse values and ensure they're valid numbers
          const value =
            metric.value && metric.value !== "NaN" ? metric.value : "0";
          const change =
            metric.change && !isNaN(parseFloat(metric.change))
              ? parseFloat(metric.change)
              : 0;

          return (
            <MetricCard
              key={index}
              title={metric.title}
              value={value}
              change={change}
              trend={metric.trend}
            />
          );
        })}
      </div>

      {/* Top Pages and Sources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages by users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Visitors</TableHead>
                  <TableHead>Avg. Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPages.data.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item?.page?.title || "Unknown"}
                    </TableCell>
                    <TableCell>{item.views}</TableCell>
                    <TableCell>{item.uniqueViews}</TableCell>
                    <TableCell>{item.avgTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentEvents.data
                  .slice(0, 5)
                  .map((event: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {event.action}
                      </TableCell>
                      <TableCell>{event.label.title}</TableCell>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Device and Stats Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.devices.data.map((device: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="capitalize">{device.name || "Unknown"}</span>
                  <span>{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Sessions</span>
                <span>{data.stats.totalSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>New Visitors</span>
                <span>{data.stats.newVisitors || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Returning Visitors</span>
                <span>{data.stats.returningVisitors || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Avg Pages/Session</span>
                <span>
                  {(data.stats.averagePageViewsPerSession || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
