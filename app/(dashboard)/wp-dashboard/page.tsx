"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WPConfigForm } from "@/components/migration/wp-config-form";
import { WPDataTable } from "@/components/migration/wp-data-table";
import { wpService, type WPEndpoint } from "@/lib/services/wordpress.service";
import { toast } from "sonner";
import {
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Users,
    ShoppingCart,
    Repeat,
    BarChart3,
    CreditCard,
    Ticket,
} from "lucide-react";

interface EndpointStatus {
    endpoint: WPEndpoint;
    label: string;
    icon: React.ElementType;
    status: "idle" | "loading" | "success" | "error";
    data: any;
    error?: string;
    dataCount?: number;
}

export default function WPDashboardPage() {
    const [isConfigured, setIsConfigured] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
        { endpoint: "customers", label: "Customers", icon: Users, status: "idle", data: null },
        { endpoint: "orders", label: "Orders", icon: ShoppingCart, status: "idle", data: null },
        { endpoint: "subscriptions", label: "Subscriptions", icon: Repeat, status: "idle", data: null },
        { endpoint: "analytics", label: "Analytics", icon: BarChart3, status: "idle", data: null },
        { endpoint: "payment-methods", label: "Payment Methods", icon: CreditCard, status: "idle", data: null },
        { endpoint: "coupons", label: "Coupons", icon: Ticket, status: "idle", data: null },
    ]);

    useEffect(() => {
        const config = wpService.getConfig();
        setIsConfigured(!!config);
        if (config) {
            fetchAllEndpoints();
        }
    }, []);

    const handleConfigSave = async (config: { url: string; apiKey: string }) => {
        wpService.setConfig(config);
        setIsConfigured(true);
        await testConnection();
    };

    const testConnection = async () => {
        setIsTesting(true);
        try {
            const isConnected = await wpService.testConnection();
            if (isConnected) {
                toast.success("Successfully connected to WordPress API");
                fetchAllEndpoints();
            } else {
                toast.error("Failed to connect to WordPress API");
            }
        } catch (error) {
            toast.error("Connection test failed");
        } finally {
            setIsTesting(false);
        }
    };

    const fetchAllEndpoints = async () => {
        // First sync all data from WordPress to backend
        toast.info("Syncing data from WordPress...");

        try {
            await wpService.syncAllEndpoints();
            toast.success("Data synced successfully");
        } catch (error) {
            toast.error("Failed to sync data from WordPress");
            console.error("Sync error:", error);
        }

        // Then fetch data from backend
        for (const endpoint of endpoints) {
            await fetchEndpointData(endpoint.endpoint);
        }
    };

    const fetchEndpointData = async (endpoint: WPEndpoint) => {
        setEndpoints((prev) =>
            prev.map((e) =>
                e.endpoint === endpoint ? { ...e, status: "loading" as const, error: undefined } : e
            )
        );

        try {
            const response = await wpService.fetchEndpoint(endpoint);
            const data = response.data || response;
            const dataCount = Array.isArray(data) ? data.length : Object.keys(data).length;

            setEndpoints((prev) =>
                prev.map((e) =>
                    e.endpoint === endpoint
                        ? { ...e, status: "success" as const, data, dataCount, error: undefined }
                        : e
                )
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
            setEndpoints((prev) =>
                prev.map((e) =>
                    e.endpoint === endpoint
                        ? { ...e, status: "error" as const, data: null, error: errorMessage }
                        : e
                )
            );
        }
    };

    const refreshEndpoint = async (endpoint: WPEndpoint) => {
        // First sync this specific endpoint
        toast.info(`Syncing ${endpoint}...`);

        try {
            await wpService.syncEndpoint(endpoint);
            toast.success(`${endpoint} synced successfully`);
        } catch (error) {
            toast.error(`Failed to sync ${endpoint}`);
            console.error("Sync error:", error);
        }

        // Then fetch the data
        await fetchEndpointData(endpoint);
    };

    const clearConfig = () => {
        wpService.clearConfig();
        setIsConfigured(false);
        setEndpoints((prev) =>
            prev.map((e) => ({ ...e, status: "idle" as const, data: null, error: undefined }))
        );
        toast.success("Configuration cleared");
    };



    const getStatusBadge = (status: EndpointStatus["status"]) => {
        switch (status) {
            case "loading":
                return <Badge variant="secondary">Loading...</Badge>;
            case "success":
                return (
                    <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                    </Badge>
                );
            case "error":
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Error
                    </Badge>
                );
            default:
                return <Badge variant="outline">Not Checked</Badge>;
        }
    };

    if (!isConfigured) {
        return (
            <div className="container mx-auto py-8 max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">WordPress Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Connect to your WordPress site to view and manage data
                    </p>
                </div>

                <WPConfigForm onSave={handleConfigSave} />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">WordPress Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and view your WordPress data from all endpoints
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={testConnection} disabled={isTesting}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isTesting ? "animate-spin" : ""}`} />
                        Test Connection
                    </Button>
                    <Button variant="outline" onClick={clearConfig}>
                        Clear Config
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {endpoints.map((endpoint) => {
                    const Icon = endpoint.icon;
                    return (
                        <Card key={endpoint.endpoint} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">{endpoint.label}</CardTitle>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => refreshEndpoint(endpoint.endpoint)}
                                        disabled={endpoint.status === "loading"}
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${endpoint.status === "loading" ? "animate-spin" : ""
                                                }`}
                                        />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getStatusBadge(endpoint.status)}

                                    {endpoint.status === "success" && endpoint.dataCount !== undefined && (
                                        <div className="text-2xl font-bold">{endpoint.dataCount} items</div>
                                    )}

                                    {endpoint.status === "error" && endpoint.error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                {endpoint.error}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>View detailed data from each endpoint</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="customers" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                            {endpoints.map((endpoint) => (
                                <TabsTrigger
                                    key={endpoint.endpoint}
                                    value={endpoint.endpoint}
                                    className="text-xs"
                                >
                                    {endpoint.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {endpoints.map((endpoint) => (
                            <TabsContent
                                key={endpoint.endpoint}
                                value={endpoint.endpoint}
                                className="space-y-4 mt-4"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{endpoint.label}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Endpoint: /{endpoint.endpoint}
                                        </p>
                                    </div>
                                    {endpoint.status === "success" && (
                                        <Badge variant="outline">
                                            {endpoint.dataCount} {endpoint.dataCount === 1 ? "item" : "items"}
                                        </Badge>
                                    )}
                                </div>

                                {endpoint.status === "loading" && (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                                {endpoint.status === "success" && endpoint.data && (
                                    <WPDataTable data={endpoint.data} endpoint={endpoint.endpoint} />
                                )}

                                {endpoint.status === "error" && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{endpoint.error}</AlertDescription>
                                    </Alert>
                                )}

                                {endpoint.status === "idle" && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Click refresh to load data</p>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
