"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Webhook,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Copy,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import WebhookService, {
  Webhook as WebhookType,
  WebhookDelivery as DeliveryType
} from "@/lib/services/webhook.service";

export default function WebhooksConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testEventType, setTestEventType] = useState<string>('');
  const [testPayload, setTestPayload] = useState<string>('');

  // New webhook form state
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookType>>({
    name: '',
    url: '',
    events: [],
    enabled: true,
    retryPolicy: 'exponential',
    maxRetries: 3,
    timeout: 30,
    verifySsl: true,
    authHeaders: []
  });

  const eventTypes = [
    {
      category: "Subscriptions",
      events: [
        { name: "subscription.created", description: "New subscription created" },
        { name: "subscription.updated", description: "Subscription plan or billing updated" },
        { name: "subscription.cancelled", description: "Subscription cancelled by user or system" },
        { name: "subscription.renewed", description: "Subscription automatically renewed" },
      ]
    },
    {
      category: "Payments",
      events: [
        { name: "invoice.paid", description: "Invoice payment successful" },
        { name: "invoice.failed", description: "Invoice payment failed" },
        { name: "invoice.created", description: "New invoice generated" },
        { name: "payment.refunded", description: "Payment refunded to customer" },
      ]
    },
    {
      category: "Contracts",
      events: [
        { name: "contract.signed", description: "Contract digitally signed" },
        { name: "contract.expired", description: "Contract has expired" },
        { name: "contract.renewed", description: "Contract renewed or extended" },
        { name: "contract.updated", description: "Contract terms modified" },
      ]
    },
    {
      category: "Users",
      events: [
        { name: "user.created", description: "New user account created" },
        { name: "user.updated", description: "User profile updated" },
        { name: "user.deleted", description: "User account deleted" },
      ]
    },
  ];

  // Load webhooks on mount
  useEffect(() => {
    fetchWebhooks();
  }, []);

  // Load deliveries when webhook selected
  useEffect(() => {
    if (selectedWebhook && (selectedWebhook._id || selectedWebhook.id)) {
      fetchDeliveries(selectedWebhook._id || selectedWebhook.id!);
    }
  }, [selectedWebhook]);

  // Fetch all webhooks
  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await WebhookService.getWebhooks();

      if (response.success) {
        setWebhooks(response.data);
        if (response.data.length > 0 && !selectedWebhook) {
          setSelectedWebhook(response.data[0]);
        }
      } else {
        throw new Error(response.message || 'Failed to load webhooks');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load webhooks"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new webhook
  const createWebhook = async () => {
    try {
      if (!newWebhook.name || !newWebhook.url || !newWebhook.events || newWebhook.events.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in webhook name, URL, and select at least one event"
        });
        return;
      }

      setSaving(true);
      const response = await WebhookService.createWebhook(newWebhook);

      if (response.success) {
        toast({
          title: "✅ Webhook Created!",
          description: response.message || "Webhook created successfully"
        });
        setShowAddModal(false);
        setNewWebhook({
          name: '',
          url: '',
          events: [],
          enabled: true,
          retryPolicy: 'exponential',
          maxRetries: 3,
          timeout: 30,
          verifySsl: true,
          authHeaders: []
        });
        fetchWebhooks();
      } else {
        throw new Error(response.message || 'Failed to create webhook');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook"
      });
    } finally {
      setSaving(false);
    }
  };

  // Update webhook
  const updateWebhook = async () => {
    try {
      if (!selectedWebhook) return;

      setSaving(true);
      const webhookId = selectedWebhook._id || selectedWebhook.id;
      if (!webhookId) return;

      const response = await WebhookService.updateWebhook(webhookId, selectedWebhook);

      if (response.success) {
        setShowSuccess(true);
        toast({
          title: "✅ Webhook Updated!",
          description: response.message || "Webhook updated successfully"
        });
        fetchWebhooks();
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(response.message || 'Failed to update webhook');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete webhook
  const deleteWebhook = async () => {
    try {
      if (!deleteWebhookId) return;

      const response = await WebhookService.deleteWebhook(deleteWebhookId);

      if (response.success) {
        toast({
          title: "✅ Webhook Deleted",
          description: response.message || "Webhook deleted successfully"
        });
        setShowDeleteModal(false);
        setDeleteWebhookId(null);
        fetchWebhooks();
        if (selectedWebhook && (selectedWebhook._id === deleteWebhookId || selectedWebhook.id === deleteWebhookId)) {
          setSelectedWebhook(null);
        }
      } else {
        throw new Error(response.message || 'Failed to delete webhook');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook"
      });
    }
  };

  // Test webhook
  const testWebhook = async (eventType?: string, customPayload?: string) => {
    try {
      if (!selectedWebhook) return;

      setTesting(true);
      const webhookId = selectedWebhook._id || selectedWebhook.id;
      if (!webhookId) return;

      const payload: any = eventType ? { event: eventType } : undefined;
      if (customPayload) {
        try {
          const parsed = JSON.parse(customPayload);
          if (payload) {
            payload.payload = parsed;
          }
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "Custom payload must be valid JSON"
          });
          setTesting(false);
          return;
        }
      }

      const response = await WebhookService.testWebhook(webhookId, payload);

      if (response.success) {
        toast({
          title: "✅ Test Successful!",
          description: `Webhook delivered in ${response.data.duration}ms`
        });
        fetchDeliveries(webhookId);
      } else {
        toast({
          title: "❌ Test Failed",
          description: response.message || "Webhook test failed"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to test webhook"
      });
    } finally {
      setTesting(false);
    }
  };

  // Fetch webhook deliveries
  const fetchDeliveries = async (webhookId: string) => {
    try {
      const response = await WebhookService.getWebhookDeliveries(webhookId, 10, 0);

      if (response.success) {
        setDeliveries(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    }
  };

  // Regenerate secret
  const regenerateSecret = async () => {
    try {
      if (!selectedWebhook) return;

      const webhookId = selectedWebhook._id || selectedWebhook.id;
      if (!webhookId) return;

      const response = await WebhookService.regenerateSecret(webhookId);

      if (response.success) {
        toast({
          title: "✅ Secret Regenerated",
          description: "New signing secret generated successfully"
        });
        setSelectedWebhook(response.data);
        fetchWebhooks();
      } else {
        throw new Error(response.message || 'Failed to regenerate secret');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate secret"
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied!",
        description: `${label} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard"
      });
    }
  };

  const toggleWebhook = async (webhookId: string) => {
    const webhook = webhooks.find(wh => (wh._id || wh.id) === webhookId);
    if (!webhook) return;

    try {
      const response = await WebhookService.toggleWebhook(webhookId, !webhook.enabled);

      if (response.success) {
        fetchWebhooks();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle webhook"
      });
    }
  };

  const WebhookCard = ({ webhook }: { webhook: WebhookType }) => {
    const webhookId = webhook._id || webhook.id || '';
    const isSelected = selectedWebhook && (selectedWebhook._id || selectedWebhook.id) === webhookId;

    return (
      <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedWebhook(webhook)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{webhook.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{webhook.url}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(webhook.url, 'Webhook URL');
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={webhook.status === 'active' ? 'default' : 'secondary'}
                className={webhook.status === 'active' ? 'bg-green-100 text-green-700' : ''}
              >
                {webhook.status}
              </Badge>
              <Switch
                checked={webhook.enabled}
                onCheckedChange={() => webhookId && toggleWebhook(webhookId)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-3">
            {webhook.events.slice(0, 3).map(event => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
            {webhook.events.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{webhook.events.length - 3} more
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Last delivery: {webhook.lastDelivery
                ? new Date(webhook.lastDelivery).toLocaleString()
                : 'Never'
              }
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteWebhookId(webhookId);
                  setShowDeleteModal(true);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Webhook settings have been saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure outbound webhook events for real-time integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWebhooks}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Configured Webhooks</h3>
            <Badge variant="secondary">
              {webhooks.filter(wh => wh.enabled).length} active
            </Badge>
          </div>

          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <WebhookCard key={webhook.id} webhook={webhook} />
            ))}
          </div>
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedWebhook ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-96">
                <Webhook className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Webhook Selected
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Select a webhook from the list or create a new one to get started
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  {selectedWebhook.name}
                </CardTitle>
                <CardDescription>
                  Configure webhook settings and event subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="configuration">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="testing">Testing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="configuration" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-name">Webhook Name</Label>
                        <Input
                          id="webhook-name"
                          value={selectedWebhook.name}
                          onChange={(e) => setSelectedWebhook({ ...selectedWebhook, name: e.target.value })}
                          placeholder="My Integration Webhook"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">Endpoint URL</Label>
                        <Input
                          id="webhook-url"
                          value={selectedWebhook.url}
                          onChange={(e) => setSelectedWebhook({ ...selectedWebhook, url: e.target.value })}
                          placeholder="https://your-domain.com/webhook"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Retry Policy</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={selectedWebhook.retryPolicy}
                          onChange={(e) => setSelectedWebhook({ ...selectedWebhook, retryPolicy: e.target.value })}
                        >
                          <option value="linear">Linear Backoff</option>
                          <option value="exponential">Exponential Backoff</option>
                          <option value="none">No Retries</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-retries">Max Retries</Label>
                        <Input
                          id="max-retries"
                          type="number"
                          min="0"
                          max="10"
                          value={selectedWebhook.maxRetries}
                          onChange={(e) => setSelectedWebhook({ ...selectedWebhook, maxRetries: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeout">Timeout (seconds)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          min="1"
                          max="60"
                          value={selectedWebhook.timeout}
                          onChange={(e) => setSelectedWebhook({ ...selectedWebhook, timeout: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Webhook</Label>
                          <p className="text-sm text-gray-500">Receive events at this endpoint</p>
                        </div>
                        <Switch
                          checked={selectedWebhook.enabled}
                          onCheckedChange={(checked) => setSelectedWebhook({ ...selectedWebhook, enabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Verify SSL Certificate</Label>
                          <p className="text-sm text-gray-500">Validate SSL certificates on delivery</p>
                        </div>
                        <Switch
                          checked={selectedWebhook.verifySsl}
                          onCheckedChange={(checked) => setSelectedWebhook({ ...selectedWebhook, verifySsl: checked })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="events" className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Event Subscriptions</Label>
                      <p className="text-sm text-gray-500 mb-4">
                        Select which events should trigger this webhook
                      </p>
                    </div>

                    <div className="space-y-6">
                      {eventTypes.map((category) => (
                        <div key={category.category} className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {category.category}
                          </h4>
                          <div className="space-y-2">
                            {category.events.map((event) => (
                              <div key={event.name} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <Label className="font-mono text-sm">{event.name}</Label>
                                  <p className="text-xs text-gray-500">{event.description}</p>
                                </div>
                                <Switch
                                  checked={selectedWebhook.events.includes(event.name)}
                                  onCheckedChange={(checked) => {
                                    const newEvents = checked
                                      ? [...selectedWebhook.events, event.name]
                                      : selectedWebhook.events.filter(e => e !== event.name);
                                    setSelectedWebhook({ ...selectedWebhook, events: newEvents });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-secret">Signing Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            id="webhook-secret"
                            type="password"
                            value={selectedWebhook.secret ? `whsec_***${selectedWebhook.secret.slice(-4)}` : 'whsec_***********'}
                            readOnly
                            placeholder="Auto-generated signing secret"
                          />
                          <Button variant="outline" onClick={regenerateSecret}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Use this secret to verify webhook authenticity
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Authentication Headers</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input placeholder="Header name" />
                            <Input placeholder="Header value" type="password" />
                            <Button variant="outline" size="sm">Add</Button>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                          All webhook payloads are signed with HMAC-SHA256. Verify the signature
                          using the signing secret to ensure payload authenticity.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  <TabsContent value="testing" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Test Webhook Delivery</Label>
                        <p className="text-sm text-gray-500 mb-4">
                          Send test events to verify your webhook endpoint
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Test Event Type</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={testEventType}
                          onChange={(e) => setTestEventType(e.target.value)}
                        >
                          <option value="">Select event to test...</option>
                          {selectedWebhook.events.map(event => (
                            <option key={event} value={event}>{event}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Payload (Optional)</Label>
                        <Textarea
                          value={testPayload}
                          onChange={(e) => setTestPayload(e.target.value)}
                          placeholder={`{
  "event": "subscription.created",
  "data": {
    "id": "sub_123",
    "customer_id": "cus_456",
    "plan": "pro_monthly"
  }
}`}
                          className="min-h-[120px] font-mono text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => testWebhook(testEventType, testPayload)}
                          disabled={testing || !testEventType}
                        >
                          {testing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Send Test Event
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => testWebhook()}
                          disabled={testing}
                        >
                          Validate Endpoint
                        </Button>
                      </div>
                    </div>

                    <Card className="bg-gray-50 dark:bg-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recent Deliveries</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {deliveries.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No recent deliveries
                          </p>
                        ) : (
                          deliveries.slice(0, 5).map((delivery) => (
                            <div key={delivery._id} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                {delivery.success ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                {delivery.event}
                              </span>
                              <span className="text-gray-500">
                                {delivery.statusCode} - {delivery.duration ? `${delivery.duration}ms` : 'N/A'}
                              </span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-6 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={updateWebhook} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Global Webhook Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Webhook Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Webhook Logging</Label>
                <p className="text-sm text-gray-500">Log all webhook deliveries and responses</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rate Limiting</Label>
                <p className="text-sm text-gray-500">Limit webhook delivery rate per endpoint</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Log Retention Period</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Default Timeout</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="1" max="60" defaultValue="30" className="w-20" />
                <span className="text-sm text-gray-500">seconds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Webhook Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint to receive real-time events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-webhook-name">Webhook Name *</Label>
                <Input
                  id="new-webhook-name"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="My Integration Webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-webhook-url">Endpoint URL *</Label>
                <Input
                  id="new-webhook-url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Subscriptions *</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-4">
                {eventTypes.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="font-medium text-sm">{category.category}</h4>
                    {category.events.map((event) => (
                      <div key={event.name} className="flex items-center justify-between pl-4">
                        <div>
                          <Label className="font-mono text-xs">{event.name}</Label>
                          <p className="text-xs text-gray-500">{event.description}</p>
                        </div>
                        <Switch
                          checked={newWebhook.events?.includes(event.name)}
                          onCheckedChange={(checked) => {
                            const currentEvents = newWebhook.events || [];
                            const newEvents = checked
                              ? [...currentEvents, event.name]
                              : currentEvents.filter(e => e !== event.name);
                            setNewWebhook({ ...newWebhook, events: newEvents });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Retry Policy</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newWebhook.retryPolicy}
                  onChange={(e) => setNewWebhook({ ...newWebhook, retryPolicy: e.target.value })}
                >
                  <option value="linear">Linear Backoff</option>
                  <option value="exponential">Exponential Backoff</option>
                  <option value="none">No Retries</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={newWebhook.maxRetries}
                  onChange={(e) => setNewWebhook({ ...newWebhook, maxRetries: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeout (s)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={newWebhook.timeout}
                  onChange={(e) => setNewWebhook({ ...newWebhook, timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable immediately</Label>
                <p className="text-sm text-gray-500">Start receiving events after creation</p>
              </div>
              <Switch
                checked={newWebhook.enabled}
                onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, enabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={createWebhook} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              All webhook deliveries and logs will be permanently deleted.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteWebhook}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}