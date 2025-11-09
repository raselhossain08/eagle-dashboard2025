import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WooCommerceAnalytics } from "@/wordpress/types/analytics";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Store,
} from "lucide-react";
import { analyticsService } from "@/wordpress/services/analyticsService";

interface WooCommerceCardProps {
  woocommerceAnalytics: WooCommerceAnalytics;
}

export function WooCommerceCard({
  woocommerceAnalytics,
}: WooCommerceCardProps) {
  const storeItems = [
    {
      label: "Products",
      value: analyticsService.formatNumber(woocommerceAnalytics.total_products),
      icon: Package,
    },
    {
      label: "Orders (Period)",
      value: analyticsService.formatNumber(
        woocommerceAnalytics.orders_in_period
      ),
      icon: ShoppingCart,
    },
    {
      label: "Currency",
      value: woocommerceAnalytics.currency,
      icon: CreditCard,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          WooCommerce
        </CardTitle>
        <CardDescription>Store performance and metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Store Status</span>
          <Badge
            variant={
              woocommerceAnalytics.store_enabled ? "default" : "destructive"
            }
          >
            {woocommerceAnalytics.store_enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {storeItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
