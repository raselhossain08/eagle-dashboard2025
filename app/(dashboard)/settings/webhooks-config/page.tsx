"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Webhook, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Globe,
  Lock,
  Zap,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Copy
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WebhooksConfigPage() {
  const [webhooks, setWebhooks] = useState([
    {
      id: "wh_1",
      name: "Subscription Updates",
      url: "https://api.example.com/webhooks/subscriptions",
      events: ["subscription.created", "subscription.updated", "subscription.cancelled"],
      enabled: true,
      lastDelivery: "2024-01-15T10:30:00Z",
      status: "active",
      retryPolicy: "exponential",
      maxRetries: 3,
      timeout: 30,
    },
    {
      id: "wh_2", 
      name: "Payment Events",
      url: "https://api.example.com/webhooks/payments",
      events: ["invoice.paid", "invoice.failed", "payment.refunded"],
      enabled: true,
      lastDelivery: "2024-01-15T09:15:00Z",
      status: "active",
      retryPolicy: "linear",
      maxRetries: 5,
      timeout: 15,
    },
    {
      id: "wh_3",
      name: "Contract Signatures",
      url: "https://api.example.com/webhooks/contracts",
      events: ["contract.signed", "contract.expired", "contract.renewed"],
      enabled: false,
      lastDelivery: null,
      status: "disabled",
      retryPolicy: "exponential",
      maxRetries: 3,
      timeout: 30,
    },
  ]);

  const [selectedWebhook, setSelectedWebhook] = useState(webhooks[0]);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(wh => 
      wh.id === webhookId 
        ? { ...wh, enabled: !wh.enabled, status: !wh.enabled ? 'active' : 'disabled' }
        : wh
    ));
  };

  const WebhookCard = ({ webhook }: { webhook: typeof webhooks[0] }) => (
    <Card className={`cursor-pointer transition-all ${selectedWebhook.id === webhook.id ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedWebhook(webhook)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{webhook.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{webhook.url}</span>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
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
              onCheckedChange={() => toggleWebhook(webhook.id)}
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
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure outbound webhook events for real-time integrations
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
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
                        placeholder="My Integration Webhook"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Endpoint URL</Label>
                      <Input
                        id="webhook-url"
                        value={selectedWebhook.url}
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
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Webhook</Label>
                        <p className="text-sm text-gray-500">Receive events at this endpoint</p>
                      </div>
                      <Switch checked={selectedWebhook.enabled} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Verify SSL Certificate</Label>
                        <p className="text-sm text-gray-500">Validate SSL certificates on delivery</p>
                      </div>
                      <Switch defaultChecked />
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
                          value="whsec_***********"
                          placeholder="Auto-generated signing secret"
                        />
                        <Button variant="outline">Regenerate</Button>
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
                      <select className="w-full p-2 border rounded-md">
                        <option value="">Select event to test...</option>
                        {selectedWebhook.events.map(event => (
                          <option key={event} value={event}>{event}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Custom Payload (Optional)</Label>
                      <Textarea
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
                      <Button>
                        <Zap className="w-4 h-4 mr-2" />
                        Send Test Event
                      </Button>
                      <Button variant="outline">Validate Endpoint</Button>
                    </div>
                  </div>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Recent Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          subscription.created
                        </span>
                        <span className="text-gray-500">200 - 1.2s</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          invoice.paid
                        </span>
                        <span className="text-gray-500">504 - 30s</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          contract.signed
                        </span>
                        <span className="text-gray-500">200 - 0.8s</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}