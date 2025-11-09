"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface WPDataTableProps {
    data: any;
    endpoint: string;
}

export function WPDataTable({ data, endpoint }: WPDataTableProps) {
    if (!data) return null;

    // Render functions declarations
    const renderCouponsSummary = (couponData: any) => (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Coupons</p>
                        <p className="text-3xl font-bold mt-2">{couponData.summary?.total_coupons || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Active Coupons</p>
                        <p className="text-3xl font-bold mt-2 text-green-600">{couponData.summary?.active_coupons || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Expired Coupons</p>
                        <p className="text-3xl font-bold mt-2 text-red-600">{couponData.summary?.expired_coupons || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Pages</p>
                        <p className="text-3xl font-bold mt-2">{couponData.pagination?.total_pages || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Most Used Coupons Table */}
            {couponData.summary?.most_used_coupons && couponData.summary.most_used_coupons.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Most Used Coupons</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">ID</TableHead>
                                        <TableHead>Coupon Code</TableHead>
                                        <TableHead className="text-right">Usage Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {couponData.summary.most_used_coupons.map((coupon: any) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell className="font-medium">#{coupon.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-sm font-semibold">
                                                    {coupon.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-lg">{coupon.usage_count}</span>
                                                <span className="text-muted-foreground text-sm ml-1">uses</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination Info */}
            {couponData.pagination && (
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Page {couponData.pagination.page} of {couponData.pagination.total_pages} •
                            Total {couponData.pagination.total} coupons
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* All Coupons Table (if available) */}
            {couponData.coupons && couponData.coupons.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">All Coupons</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Usage</TableHead>
                                        <TableHead>Expiry Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {couponData.coupons.map((coupon: any, index: number) => (
                                        <TableRow key={coupon.id || index}>
                                            <TableCell className="font-medium">{coupon.code}</TableCell>
                                            <TableCell className="text-sm">{coupon.description || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {coupon.discount_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {coupon.discount_type === "percent" ? `${coupon.amount}%` : `$${coupon.amount}`}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {coupon.usage_count || 0} / {coupon.usage_limit || "∞"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : "No expiry"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderPaymentMethodsSummary = (paymentData: any) => (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Payment Methods</p>
                        <p className="text-3xl font-bold mt-2">{paymentData.summary?.total_methods || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Enabled Methods</p>
                        <p className="text-3xl font-bold mt-2 text-green-600">{paymentData.summary?.enabled_methods || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Table */}
            {paymentData.payment_methods && paymentData.payment_methods.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">All Payment Methods</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">ID</TableHead>
                                        <TableHead>Method Title</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Features</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentData.payment_methods.map((method: any, index: number) => (
                                        <TableRow key={method.id || index}>
                                            <TableCell className="font-medium">{method.id}</TableCell>
                                            <TableCell className="font-semibold">{method.method_title}</TableCell>
                                            <TableCell>{method.title}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={method.enabled ? "default" : "secondary"}>
                                                    {method.enabled ? "Enabled" : "Disabled"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {method.supports?.length || 0} features
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                {method.description || "No description"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderSubscriptionsSummary = (subscriptionData: any) => (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                        <p className="text-3xl font-bold mt-2">{subscriptionData.summary?.total_subscriptions || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                        <p className="text-3xl font-bold mt-2 text-green-600">{subscriptionData.summary?.active_subscriptions || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            ${subscriptionData.summary?.monthly_recurring_revenue?.toFixed(2) || "0.00"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Products</p>
                        <p className="text-3xl font-bold mt-2">{subscriptionData.summary?.subscription_products || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriptions Table */}
            {subscriptionData.subscriptions && subscriptionData.subscriptions.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">All Subscriptions</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Billing Period</TableHead>
                                        <TableHead>Next Payment</TableHead>
                                        <TableHead>Start Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscriptionData.subscriptions.map((subscription: any) => (
                                        <TableRow key={subscription.id}>
                                            <TableCell className="font-medium">#{subscription.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {subscription.customer?.first_name || subscription.customer?.last_name
                                                            ? `${subscription.customer.first_name || ""} ${subscription.customer.last_name || ""}`.trim()
                                                            : "N/A"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {subscription.customer?.email || "N/A"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {subscription.items?.[0]?.name || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        subscription.status === "active"
                                                            ? "default"
                                                            : subscription.status === "cancelled"
                                                                ? "destructive"
                                                                : subscription.status === "pending-cancel"
                                                                    ? "secondary"
                                                                    : "outline"
                                                    }
                                                >
                                                    {subscription.status || "unknown"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {subscription.currency || "USD"} ${subscription.total || "0.00"}
                                            </TableCell>
                                            <TableCell>
                                                Every {subscription.billing_interval || 1} {subscription.billing_period || "month"}(s)
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {subscription.next_payment_date && subscription.next_payment_date !== 0
                                                    ? new Date(subscription.next_payment_date).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {subscription.start_date
                                                    ? new Date(subscription.start_date).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination Info */}
            {subscriptionData.pagination && (
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Page {subscriptionData.pagination.page} of {subscriptionData.pagination.total_pages} •
                            Total {subscriptionData.pagination.total} subscriptions
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderOrdersSummary = (orderData: any) => (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-3xl font-bold mt-2">{orderData.summary?.total_orders || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Processing</p>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            {orderData.summary?.orders_by_status?.["wc-processing"]?.count || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-3xl font-bold mt-2 text-green-600">
                            {orderData.summary?.orders_by_status?.["wc-completed"]?.count || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Cancelled</p>
                        <p className="text-3xl font-bold mt-2 text-red-600">
                            {orderData.summary?.orders_by_status?.["wc-cancelled"]?.count || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            {orderData.summary?.top_products && orderData.summary.top_products.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">ID</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead className="text-right">Quantity Sold</TableHead>
                                        <TableHead className="text-right">Order Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderData.summary.top_products.map((product: any) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">#{product.id}</TableCell>
                                            <TableCell className="font-semibold">{product.name}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-lg">{product.quantity_sold}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline">{product.order_count} orders</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Orders Table */}
            {orderData.orders && orderData.orders.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-center">Items</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderData.orders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.order_number || order.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {order.customer?.first_name || order.customer?.last_name
                                                            ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
                                                            : "Guest"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.customer?.email || "N/A"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        order.status === "completed"
                                                            ? "default"
                                                            : order.status === "processing"
                                                                ? "secondary"
                                                                : order.status === "failed"
                                                                    ? "destructive"
                                                                    : "outline"
                                                    }
                                                >
                                                    {order.status || "unknown"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {order.currency || "USD"} ${order.total || "0.00"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {order.payment_method_title || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {order.date_created
                                                    ? new Date(order.date_created).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">{order.item_count || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination Info */}
            {orderData.pagination && (
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Page {orderData.pagination.page} of {orderData.pagination.total_pages} •
                            Total {orderData.pagination.total} orders
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // Extract the actual data array from the response
    let items = data;
    if (data.success && data.data) {
        // Handle nested structure like { success: true, data: { customers: [...] } }
        const dataKey = Object.keys(data.data)[0];
        items = data.data[dataKey] || data.data;

        // Special handling for coupons with summary data
        if (endpoint === "coupons" && data.data.summary) {
            return renderCouponsSummary(data.data);
        }

        // Special handling for payment methods with summary data
        if (endpoint === "payment-methods" && data.data.summary) {
            return renderPaymentMethodsSummary(data.data);
        }

        // Special handling for subscriptions with summary data
        if (endpoint === "subscriptions" && data.data.summary) {
            return renderSubscriptionsSummary(data.data);
        }

        // Special handling for orders with summary data
        if (endpoint === "orders" && data.data.summary) {
            return renderOrdersSummary(data.data);
        }
    } else if (Array.isArray(data)) {
        items = data;
    }

    if (!Array.isArray(items)) {
        items = [items];
    }

    const renderCustomersTable = (customers: any[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.id || "N/A"}</TableCell>
                            <TableCell>
                                {customer.display_name ||
                                    (customer.first_name || customer.last_name
                                        ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                                        : "N/A")}
                            </TableCell>
                            <TableCell>{customer.email || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {customer.username ? `@${customer.username}` : "N/A"}
                            </TableCell>
                            <TableCell>
                                {customer.registered_date
                                    ? new Date(customer.registered_date).toLocaleDateString()
                                    : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">{customer.order_count || 0}</TableCell>
                            <TableCell className="text-right font-semibold">
                                ${customer.total_spent || "0.00"}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{customer.roles?.[0] || "N/A"}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderOrdersTable = (orders: any[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.order_number || order.id}</TableCell>
                            <TableCell>
                                {order.customer?.first_name || order.customer?.last_name
                                    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
                                    : "Guest"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {order.customer?.email || "N/A"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        order.status === "completed"
                                            ? "default"
                                            : order.status === "processing"
                                                ? "secondary"
                                                : "outline"
                                    }
                                >
                                    {order.status || "unknown"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {order.currency || "USD"} ${order.total || "0.00"}
                            </TableCell>
                            <TableCell>{order.payment_method_title || "N/A"}</TableCell>
                            <TableCell>
                                {order.date_created
                                    ? new Date(order.date_created).toLocaleDateString()
                                    : "N/A"}
                            </TableCell>
                            <TableCell className="text-center">{order.items?.length || 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderSubscriptionsTable = (subscriptions: any[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Billing Period</TableHead>
                        <TableHead>Next Payment</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                            <TableCell className="font-medium">#{subscription.id}</TableCell>
                            <TableCell>{subscription.customer_name || subscription.customer?.email}</TableCell>
                            <TableCell>{subscription.product_name || "N/A"}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        subscription.status === "active"
                                            ? "default"
                                            : subscription.status === "cancelled"
                                                ? "destructive"
                                                : "secondary"
                                    }
                                >
                                    {subscription.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                ${subscription.total || subscription.recurring_amount}
                            </TableCell>
                            <TableCell>{subscription.billing_period || "N/A"}</TableCell>
                            <TableCell>
                                {subscription.next_payment_date
                                    ? new Date(subscription.next_payment_date).toLocaleDateString()
                                    : "N/A"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderAnalytics = (analytics: any) => (
        <div className="space-y-6">
            {/* Site Info */}
            {analytics.site_info && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Site Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Site URL</p>
                                <p className="font-medium">{analytics.site_info.site_url}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Site Name</p>
                                <p className="font-medium">{analytics.site_info.site_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">WordPress Version</p>
                                <p className="font-medium">{analytics.site_info.wordpress_version}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Plugin Version</p>
                                <p className="font-medium">{analytics.site_info.plugin_version}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* User Analytics */}
            {analytics.user_analytics && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">User Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <p className="text-2xl font-bold">{analytics.user_analytics.total_users}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Recent Registrations</p>
                                <p className="text-2xl font-bold">{analytics.user_analytics.recent_registrations}</p>
                            </div>
                        </div>
                        {analytics.user_analytics.users_by_role && (
                            <>
                                <h4 className="text-sm font-semibold mb-2">Users by Role</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {Object.entries(analytics.user_analytics.users_by_role).map(([role, count]: [string, any]) => (
                                        <div key={role} className="text-center p-2 bg-muted/50 rounded">
                                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                                            <p className="text-lg font-bold">{count}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Content Analytics */}
            {analytics.content_analytics && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Content Analytics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Posts</p>
                                <p className="text-2xl font-bold">{analytics.content_analytics.total_posts}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Pages</p>
                                <p className="text-2xl font-bold">{analytics.content_analytics.total_pages}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Comments</p>
                                <p className="text-2xl font-bold">{analytics.content_analytics.total_comments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* WooCommerce Analytics */}
            {analytics.woocommerce_analytics && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">WooCommerce Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Orders in Period</p>
                                <p className="text-2xl font-bold">{analytics.woocommerce_analytics.orders_in_period}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Products</p>
                                <p className="text-2xl font-bold">{analytics.woocommerce_analytics.total_products}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Currency</p>
                                <p className="text-2xl font-bold">{analytics.woocommerce_analytics.currency}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Store Status</p>
                                <Badge variant={analytics.woocommerce_analytics.store_enabled ? "default" : "destructive"}>
                                    {analytics.woocommerce_analytics.store_enabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderPaymentMethod = (method: any) => (
        <Card key={method.id || method.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-lg">{method.title || method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                </div>
                {method.id && (
                    <p className="text-xs text-muted-foreground">ID: {method.id}</p>
                )}
            </CardContent>
        </Card>
    );

    const renderCoupon = (coupon: any) => (
        <Card key={coupon.id || coupon.code} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-lg">{coupon.code}</h4>
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    </div>
                    <Badge variant="outline">
                        {coupon.discount_type === "percent" ? `${coupon.amount}%` : `$${coupon.amount}`}
                    </Badge>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{coupon.discount_type}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Usage:</span>
                        <p className="font-medium">
                            {coupon.usage_count || 0} / {coupon.usage_limit || "∞"}
                        </p>
                    </div>
                    {coupon.expiry_date && (
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Expires:</span>
                            <p className="font-medium">{new Date(coupon.expiry_date).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderDefault = (item: any, index: number) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <pre className="text-xs overflow-auto max-h-64">
                    {JSON.stringify(item, null, 2)}
                </pre>
            </CardContent>
        </Card>
    );

    // Render based on endpoint
    if (endpoint === "analytics" && !Array.isArray(items)) {
        return renderAnalytics(items);
    }

    switch (endpoint) {
        case "customers":
            return renderCustomersTable(items);
        case "orders":
            return renderOrdersTable(items);
        case "subscriptions":
            return renderSubscriptionsTable(items);
        case "payment-methods":
            return items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item: any, index: number) => renderPaymentMethod(item))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No payment methods found</p>
                    </CardContent>
                </Card>
            );
        case "coupons":
            return items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item: any, index: number) => renderCoupon(item))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No coupons found</p>
                    </CardContent>
                </Card>
            );
        default:
            return (
                <Card>
                    <CardContent className="p-4">
                        <pre className="text-xs overflow-auto max-h-96">
                            {JSON.stringify(items, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            );
    }
}
