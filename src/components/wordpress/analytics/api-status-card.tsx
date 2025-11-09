import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiAnalytics } from "@/wordpress/types/analytics";
import { CheckCircle, XCircle, Clock, Link } from "lucide-react";

interface ApiStatusCardProps {
  apiAnalytics: ApiAnalytics;
}

export function ApiStatusCard({ apiAnalytics }: ApiStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Status</CardTitle>
        <CardDescription>API configuration and sync status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Key</span>
          <Badge
            variant={
              apiAnalytics.api_key_configured ? "default" : "destructive"
            }
          >
            {apiAnalytics.api_key_configured ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {apiAnalytics.api_key_configured ? "Configured" : "Not Configured"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Sync</span>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {apiAnalytics.last_sync}
          </Badge>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Endpoint URL</span>
          </div>
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium break-all">
            {apiAnalytics.endpoint_url}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
