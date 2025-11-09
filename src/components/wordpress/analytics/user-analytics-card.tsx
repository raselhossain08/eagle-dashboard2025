import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserAnalytics } from "@/wordpress/types/analytics";
import { analyticsService } from "@/wordpress/services/analyticsService";

interface UserAnalyticsCardProps {
  userAnalytics: UserAnalytics;
}

export function UserAnalyticsCard({ userAnalytics }: UserAnalyticsCardProps) {
  const topRoles = Object.entries(userAnalytics.users_by_role)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Analytics</CardTitle>
        <CardDescription>
          User distribution across different roles and recent activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {topRoles.map(([role, count]) => {
            const percentage = analyticsService.calculateRolePercentage(
              count,
              userAnalytics.total_users
            );

            return (
              <div key={role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {role.replace("_", " ")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsService.formatNumber(count)} (
                    {percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Recent Registrations (30d):
            </span>
            <span className="text-sm font-medium">
              {analyticsService.formatNumber(
                userAnalytics.recent_registrations
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
