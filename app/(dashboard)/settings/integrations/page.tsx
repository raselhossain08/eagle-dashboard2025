"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Plus,
  Activity,
  CreditCard,
  Mail,
  MessageSquare,
  FileText,
  Shield,
  Zap,
  TrendingUp
} from "lucide-react";
import { integrationService, IntegrationSettings } from "@/lib/services/integrations";

interface IntegrationDashboardProps {
  // Optional props for customization
}

export default function IntegrationDashboard({}: IntegrationDashboardProps) {
  const [integrations, setIntegrations] = useState<IntegrationSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSettings | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await integrationService.listIntegrations();
      if (response.data) {
        setIntegrations(response.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch integrations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string) => {
    try {
      await integrationService.toggleIntegration(id);
      toast.success("Integration status updated");
      fetchIntegrations();
    } catch (error: any) {
      toast.error("Failed to toggle integration: " + error.message);
    }
  };

  const testIntegration = async (integration: IntegrationSettings) => {
    try {
      const testData: any = {};
      if (integration.category === "EMAIL") {
        testData.testEmail = "test@example.com";
      } else if (integration.category === "SMS") {
        testData.testPhone = "+1234567890";
      }

      await integrationService.testIntegration(integration._id, testData);
      toast.success("Integration test successful!");
    } catch (error: any) {
      toast.error("Test failed: " + error.message);
    }
  };

  const openConfigModal = (integration?: IntegrationSettings) => {
    setSelectedIntegration(integration || null);
    setConfigModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "PAYMENT":
        return <CreditCard className="w-4 h-4" />;
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "SMS":
        return <MessageSquare className="w-4 h-4" />;
      case "TAX":
        return <FileText className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PAYMENT":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "EMAIL":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "SMS":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "TAX":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 dark:text-green-400";
      case "DEGRADED":
        return "text-yellow-600 dark:text-yellow-400";
      case "ERROR":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getSuccessRate = (usage: any) => {
    if (usage.totalRequests === 0) return "0";
    return ((usage.successfulRequests / usage.totalRequests) * 100).toFixed(1);
  };

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage third-party service integrations for payments, communications, and tax
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchIntegrations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => openConfigModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {integrations.filter(i => i.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.healthStatus?.status === 'HEALTHY').length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + (i.usage?.totalRequests || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.length > 0 
                ? (integrations.reduce((sum, i) => {
                    const rate = i.usage?.totalRequests > 0 
                      ? (i.usage.successfulRequests / i.usage.totalRequests) 
                      : 0;
                    return sum + rate;
                  }, 0) / integrations.length * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Average across all services
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({integrations.length})</TabsTrigger>
          <TabsTrigger value="PAYMENT">
            Payment ({integrations.filter(i => i.category === 'PAYMENT').length})
          </TabsTrigger>
          <TabsTrigger value="EMAIL">
            Email ({integrations.filter(i => i.category === 'EMAIL').length})
          </TabsTrigger>
          <TabsTrigger value="SMS">
            SMS ({integrations.filter(i => i.category === 'SMS').length})
          </TabsTrigger>
          <TabsTrigger value="TAX">
            Tax ({integrations.filter(i => i.category === 'TAX').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured Integrations</CardTitle>
              <CardDescription>
                Manage your third-party service providers and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading integrations...</p>
                </div>
              ) : filteredIntegrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIntegrations.map((integration) => (
                      <TableRow key={integration._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <strong className="capitalize">{integration.provider}</strong>
                            {integration.isPrimary && (
                              <Badge variant="outline" className="text-xs">Primary</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(integration.category)}>
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(integration.category)}
                              {integration.category}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {integration.isActive ? (
                            integration.healthStatus?.status === 'HEALTHY' ? (
                              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Healthy
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                                <XCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-gray-700">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{integration.usage?.totalRequests?.toLocaleString() || 0}</div>
                            <div className="text-gray-500 text-xs">total requests</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className={`font-medium ${getStatusColor(integration.healthStatus?.status || '')}`}>
                              {getSuccessRate(integration.usage || { totalRequests: 0, successfulRequests: 0 })}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {integration.healthStatus?.responseTime ? (
                              <span>{integration.healthStatus.responseTime}ms</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={integration.isActive}
                              onCheckedChange={() => toggleIntegration(integration._id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testIntegration(integration)}
                            >
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfigModal(integration)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeTab === "all" 
                      ? "No integrations configured yet" 
                      : `No ${activeTab} integrations configured`
                    }
                  </p>
                  <Button className="mt-4" onClick={() => openConfigModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <IntegrationConfigModal
        open={configModal}
        onClose={() => {
          setConfigModal(false);
          setSelectedIntegration(null);
        }}
        integration={selectedIntegration}
        onSuccess={fetchIntegrations}
      />
    </div>
  );
}

// Configuration Modal Component
function IntegrationConfigModal({
  open,
  onClose,
  integration,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  integration: IntegrationSettings | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(integration?.category || "");
  const [selectedProvider, setSelectedProvider] = useState(integration?.provider || "");

  const form = useForm({
    defaultValues: {
      category: integration?.category || "",
      provider: integration?.provider || "",
      credentials: integration?.credentials || {},
      configuration: integration?.configuration || {},
      isPrimary: integration?.isPrimary || false,
    },
  });

  const providerOptions: Record<string, Array<{ label: string; value: string }>> = {
    PAYMENT: [
      { label: "Stripe", value: "stripe" },
      { label: "Braintree", value: "braintree" },
    ],
    EMAIL: [
      { label: "SendGrid", value: "sendgrid" },
      { label: "Postmark", value: "postmark" },
    ],
    SMS: [{ label: "Twilio", value: "twilio" }],
    TAX: [
      { label: "Stripe Tax", value: "stripe_tax" },
      { label: "TaxJar", value: "taxjar" },
      { label: "Avalara", value: "avalara" },
    ],
  };

  const getCredentialFields = (provider: string): string[] => {
    const fields: Record<string, string[]> = {
      stripe: ["secretKey", "publishableKey", "webhookSecret"],
      braintree: ["merchantId", "publicKey", "privateKey"],
      sendgrid: ["apiKey"],
      postmark: ["serverToken"],
      twilio: ["accountSid", "authToken"],
      stripe_tax: ["apiKey"],
      taxjar: ["apiKey"],
      avalara: ["accountId", "licenseKey"],
    };
    return fields[provider] || [];
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (integration) {
        await integrationService.updateIntegration(integration._id, {
          configuration: data.configuration,
          isActive: integration.isActive,
          isPrimary: data.isPrimary,
        });
        toast.success("Integration updated successfully!");
      } else {
        await integrationService.configureIntegration(data);
        toast.success("Integration configured successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to save integration: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {integration ? "Edit Integration" : "Add New Integration"}
          </DialogTitle>
          <DialogDescription>
            Configure your third-party service provider settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!integration && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedProvider("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="TAX">Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider *</label>
                  <Select
                    value={selectedProvider}
                    onValueChange={setSelectedProvider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions[selectedCategory]?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {(selectedProvider || integration) && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Credentials</h4>
                <div className="space-y-3">
                  {getCredentialFields(selectedProvider || integration!.provider).map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-medium capitalize">
                        {field.replace(/([A-Z])/g, " $1").trim()} *
                      </label>
                      <Input
                        type="password"
                        placeholder={`Enter ${field}`}
                        {...form.register(`credentials.${field}`, { required: true })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Configuration</h4>
                <div className="space-y-3">
                  {(selectedCategory === "EMAIL" || integration?.category === "EMAIL") && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From Email *</label>
                        <Input
                          type="email"
                          placeholder="noreply@example.com"
                          {...form.register("configuration.fromEmail")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From Name</label>
                        <Input
                          placeholder="Eagle Platform"
                          {...form.register("configuration.fromName")}
                        />
                      </div>
                    </>
                  )}

                  {(selectedCategory === "SMS" || integration?.category === "SMS") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Number *</label>
                      <Input
                        placeholder="+1234567890"
                        {...form.register("configuration.fromNumber")}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 border-t pt-4">
                <Switch {...form.register("isPrimary")} />
                <label className="text-sm font-medium">Set as Primary Provider</label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : integration ? "Update" : "Configure"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
