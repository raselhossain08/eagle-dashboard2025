'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Webhook,
  Globe,
  Shield,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Plus,
  Settings,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  Server,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Timer,
  Target,
  ArrowRight,
  ArrowDown,
  Filter,
  Search,
  Download,
  Eye,
  Code2,
  Send,
  RotateCcw,
  Gauge
} from 'lucide-react';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  description: string;
  events: string[];
  headers: { [key: string]: string };
  secret?: string;
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelay: number;
    maxDelay: number;
    retryOnStatus: number[];
  };
  timeout: number;
  enabled: boolean;
  status: 'active' | 'paused' | 'failing' | 'disabled';
  createdAt: string;
  lastUsed?: string;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
}

interface WebhookDelivery {
  id: string;
  endpointId: string;
  endpointName: string;
  event: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  createdAt: string;
  deliveredAt?: string;
  nextRetry?: string;
}

interface DeadLetterQueue {
  id: string;
  endpointId: string;
  endpointName: string;
  event: string;
  payload: any;
  originalDeliveryId: string;
  failureReason: string;
  attempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface WebhookMetrics {
  totalEndpoints: number;
  activeEndpoints: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  deadLetterQueueSize: number;
  deliveriesLast24h: number;
  topFailingEndpoints: { id: string; name: string; failureRate: number }[];
  eventDistribution: { [event: string]: number };
  successRateHistory: { date: string; rate: number }[];
}

interface RetryJob {
  id: string;
  deliveryId: string;
  endpointId: string;
  endpointName: string;
  event: string;
  attempt: number;
  maxAttempts: number;
  nextRetry: string;
  delay: number;
  backoffStrategy: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}

export default function WebhookManagementSystem() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState<DeadLetterQueue[]>([]);
  const [retryJobs, setRetryJobs] = useState<RetryJob[]>([]);
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [isCreateEndpointOpen, setIsCreateEndpointOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    method: 'POST' as const,
    description: '',
    events: [] as string[],
    headers: {} as { [key: string]: string },
    secret: '',
    retryEnabled: true,
    maxAttempts: 3,
    backoffStrategy: 'exponential' as const,
    initialDelay: 1000,
    maxDelay: 60000,
    timeout: 30000
  });

  const availableEvents = [
    'payment.completed',
    'payment.failed',
    'subscription.created',
    'subscription.cancelled',
    'invoice.generated',
    'user.registered',
    'contract.signed',
    'webhook.failed',
    'system.alert'
  ];

  useEffect(() => {
    loadWebhookData();
  }, []);

  const loadWebhookData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEndpoints([
        {
          id: '1',
          name: 'Payment Processor',
          url: 'https://api.paymentprocessor.com/webhooks/payments',
          method: 'POST',
          description: 'Handles payment completion and failure notifications',
          events: ['payment.completed', 'payment.failed'],
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ****',
            'X-API-Version': '2024-01'
          },
          secret: '****',
          retryPolicy: {
            enabled: true,
            maxAttempts: 5,
            backoffStrategy: 'exponential',
            initialDelay: 1000,
            maxDelay: 60000,
            retryOnStatus: [500, 502, 503, 504, 408]
          },
          timeout: 30000,
          enabled: true,
          status: 'active',
          createdAt: '2024-06-01T00:00:00Z',
          lastUsed: '2024-06-20T15:30:00Z',
          successRate: 98.5,
          totalDeliveries: 1247,
          failedDeliveries: 19
        },
        {
          id: '2',
          name: 'Slack Notifications',
          url: 'https://api.example.com/notifications/slack',
          method: 'POST',
          description: 'Sends critical alerts to operations Slack channel',
          events: ['system.alert', 'webhook.failed', 'payment.failed'],
          headers: {
            'Content-Type': 'application/json'
          },
          retryPolicy: {
            enabled: true,
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            initialDelay: 2000,
            maxDelay: 30000,
            retryOnStatus: [429, 500, 502, 503, 504]
          },
          timeout: 15000,
          enabled: true,
          status: 'active',
          createdAt: '2024-06-05T00:00:00Z',
          lastUsed: '2024-06-20T14:45:00Z',
          successRate: 99.2,
          totalDeliveries: 387,
          failedDeliveries: 3
        },
        {
          id: '3',
          name: 'Customer Portal',
          url: 'https://portal.customer.com/api/webhooks/updates',
          method: 'POST',
          description: 'Updates customer portal with subscription and invoice changes',
          events: ['subscription.created', 'subscription.cancelled', 'invoice.generated'],
          headers: {
            'Content-Type': 'application/json',
            'X-Portal-Key': '****'
          },
          secret: '****',
          retryPolicy: {
            enabled: true,
            maxAttempts: 4,
            backoffStrategy: 'exponential',
            initialDelay: 1500,
            maxDelay: 45000,
            retryOnStatus: [500, 502, 503, 504]
          },
          timeout: 25000,
          enabled: false,
          status: 'disabled',
          createdAt: '2024-06-10T00:00:00Z',
          lastUsed: '2024-06-18T09:15:00Z',
          successRate: 85.3,
          totalDeliveries: 156,
          failedDeliveries: 23
        },
        {
          id: '4',
          name: 'Analytics Service',
          url: 'https://analytics.internal.com/events',
          method: 'POST',
          description: 'Forwards events to internal analytics platform',
          events: ['payment.completed', 'subscription.created', 'user.registered'],
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Token': '****'
          },
          retryPolicy: {
            enabled: true,
            maxAttempts: 2,
            backoffStrategy: 'linear',
            initialDelay: 5000,
            maxDelay: 10000,
            retryOnStatus: [500, 502, 503, 504, 408]
          },
          timeout: 10000,
          enabled: true,
          status: 'failing',
          createdAt: '2024-06-12T00:00:00Z',
          lastUsed: '2024-06-20T16:20:00Z',
          successRate: 72.1,
          totalDeliveries: 892,
          failedDeliveries: 249
        },
        {
          id: '5',
          name: 'Email Service',
          url: 'https://api.emailservice.com/webhooks/events',
          method: 'POST',
          description: 'Triggers transactional emails for various events',
          events: ['payment.completed', 'subscription.created', 'contract.signed'],
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ApiKey ****'
          },
          secret: '****',
          retryPolicy: {
            enabled: true,
            maxAttempts: 5,
            backoffStrategy: 'exponential',
            initialDelay: 1000,
            maxDelay: 120000,
            retryOnStatus: [429, 500, 502, 503, 504]
          },
          timeout: 20000,
          enabled: true,
          status: 'active',
          createdAt: '2024-06-08T00:00:00Z',
          lastUsed: '2024-06-20T16:45:00Z',
          successRate: 96.8,
          totalDeliveries: 673,
          failedDeliveries: 22
        }
      ]);

      setDeliveries([
        {
          id: '1',
          endpointId: '1',
          endpointName: 'Payment Processor',
          event: 'payment.completed',
          payload: { paymentId: 'pay_123', amount: 29.99, currency: 'USD' },
          status: 'delivered',
          attempts: 1,
          maxAttempts: 5,
          statusCode: 200,
          responseTime: 245,
          createdAt: '2024-06-20T16:45:00Z',
          deliveredAt: '2024-06-20T16:45:00Z'
        },
        {
          id: '2',
          endpointId: '2',
          endpointName: 'Slack Notifications',
          event: 'system.alert',
          payload: { alert: 'High memory usage detected', severity: 'warning' },
          status: 'delivered',
          attempts: 1,
          maxAttempts: 3,
          statusCode: 200,
          responseTime: 1200,
          createdAt: '2024-06-20T16:40:00Z',
          deliveredAt: '2024-06-20T16:40:00Z'
        },
        {
          id: '3',
          endpointId: '4',
          endpointName: 'Analytics Service',
          event: 'payment.completed',
          payload: { paymentId: 'pay_124', amount: 49.99, currency: 'USD' },
          status: 'failed',
          attempts: 2,
          maxAttempts: 2,
          statusCode: 504,
          error: 'Gateway timeout',
          createdAt: '2024-06-20T16:35:00Z'
        },
        {
          id: '4',
          endpointId: '5',
          endpointName: 'Email Service',
          event: 'subscription.created',
          payload: { subscriptionId: 'sub_456', userId: 'user_789' },
          status: 'retrying',
          attempts: 2,
          maxAttempts: 5,
          statusCode: 502,
          error: 'Bad gateway',
          createdAt: '2024-06-20T16:30:00Z',
          nextRetry: '2024-06-20T16:50:00Z'
        },
        {
          id: '5',
          endpointId: '1',
          endpointName: 'Payment Processor',
          event: 'payment.failed',
          payload: { paymentId: 'pay_125', error: 'Insufficient funds' },
          status: 'delivered',
          attempts: 1,
          maxAttempts: 5,
          statusCode: 200,
          responseTime: 189,
          createdAt: '2024-06-20T16:25:00Z',
          deliveredAt: '2024-06-20T16:25:00Z'
        }
      ]);

      setDeadLetterQueue([
        {
          id: '1',
          endpointId: '4',
          endpointName: 'Analytics Service',
          event: 'payment.completed',
          payload: { paymentId: 'pay_120', amount: 19.99, currency: 'USD' },
          originalDeliveryId: 'del_456',
          failureReason: 'Maximum retry attempts exceeded (504 Gateway Timeout)',
          attempts: 2,
          firstFailedAt: '2024-06-20T15:30:00Z',
          lastFailedAt: '2024-06-20T15:35:00Z',
          resolved: false
        },
        {
          id: '2',
          endpointId: '3',
          endpointName: 'Customer Portal',
          event: 'subscription.created',
          payload: { subscriptionId: 'sub_123', userId: 'user_456' },
          originalDeliveryId: 'del_789',
          failureReason: 'Endpoint disabled due to repeated failures',
          attempts: 4,
          firstFailedAt: '2024-06-18T09:15:00Z',
          lastFailedAt: '2024-06-18T09:25:00Z',
          resolved: true,
          resolvedAt: '2024-06-19T10:30:00Z',
          resolvedBy: 'admin@company.com'
        },
        {
          id: '3',
          endpointId: '4',
          endpointName: 'Analytics Service',
          event: 'user.registered',
          payload: { userId: 'user_999', email: 'user@example.com' },
          originalDeliveryId: 'del_101112',
          failureReason: 'Connection timeout after 10 seconds',
          attempts: 2,
          firstFailedAt: '2024-06-20T14:20:00Z',
          lastFailedAt: '2024-06-20T14:25:00Z',
          resolved: false
        }
      ]);

      setRetryJobs([
        {
          id: '1',
          deliveryId: '4',
          endpointId: '5',
          endpointName: 'Email Service',
          event: 'subscription.created',
          attempt: 3,
          maxAttempts: 5,
          nextRetry: '2024-06-20T16:50:00Z',
          delay: 4000,
          backoffStrategy: 'exponential',
          status: 'scheduled'
        },
        {
          id: '2',
          deliveryId: '6',
          endpointId: '1',
          endpointName: 'Payment Processor',
          event: 'payment.completed',
          attempt: 2,
          maxAttempts: 5,
          nextRetry: '2024-06-20T16:47:00Z',
          delay: 2000,
          backoffStrategy: 'exponential',
          status: 'scheduled'
        }
      ]);

      setMetrics({
        totalEndpoints: 5,
        activeEndpoints: 4,
        totalDeliveries: 3355,
        successfulDeliveries: 3039,
        failedDeliveries: 316,
        averageResponseTime: 425,
        deadLetterQueueSize: 3,
        deliveriesLast24h: 127,
        topFailingEndpoints: [
          { id: '4', name: 'Analytics Service', failureRate: 27.9 },
          { id: '3', name: 'Customer Portal', failureRate: 14.7 },
          { id: '5', name: 'Email Service', failureRate: 3.2 }
        ],
        eventDistribution: {
          'payment.completed': 1245,
          'payment.failed': 89,
          'subscription.created': 456,
          'subscription.cancelled': 123,
          'invoice.generated': 234,
          'user.registered': 678,
          'contract.signed': 345,
          'webhook.failed': 78,
          'system.alert': 107
        },
        successRateHistory: [
          { date: '2024-06-14', rate: 92.5 },
          { date: '2024-06-15', rate: 94.1 },
          { date: '2024-06-16', rate: 91.8 },
          { date: '2024-06-17', rate: 93.7 },
          { date: '2024-06-18', rate: 89.2 },
          { date: '2024-06-19', rate: 95.3 },
          { date: '2024-06-20', rate: 90.6 }
        ]
      });
    } catch (error) {
      console.error('Failed to load webhook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'delivered': case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': case 'pending': case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failing': case 'failed': return 'bg-red-100 text-red-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      case 'retrying': case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleEndpoint = (endpointId: string) => {
    setEndpoints(prev => 
      prev.map(endpoint => 
        endpoint.id === endpointId ? { 
          ...endpoint, 
          enabled: !endpoint.enabled,
          status: !endpoint.enabled ? 'active' : 'disabled'
        } : endpoint
      )
    );
  };

  const retryDelivery = async (deliveryId: string) => {
    console.log('Retrying delivery:', deliveryId);
    // Implement manual retry
  };

  const resolveDeadLetter = async (deadLetterId: string) => {
    setDeadLetterQueue(prev => 
      prev.map(item => 
        item.id === deadLetterId ? { 
          ...item, 
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolvedBy: 'current-user@company.com'
        } : item
      )
    );
  };

  const createEndpoint = () => {
    const endpoint: WebhookEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      url: newEndpoint.url,
      method: newEndpoint.method,
      description: newEndpoint.description,
      events: newEndpoint.events,
      headers: newEndpoint.headers,
      secret: newEndpoint.secret,
      retryPolicy: {
        enabled: newEndpoint.retryEnabled,
        maxAttempts: newEndpoint.maxAttempts,
        backoffStrategy: newEndpoint.backoffStrategy,
        initialDelay: newEndpoint.initialDelay,
        maxDelay: newEndpoint.maxDelay,
        retryOnStatus: [429, 500, 502, 503, 504, 408]
      },
      timeout: newEndpoint.timeout,
      enabled: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      successRate: 0,
      totalDeliveries: 0,
      failedDeliveries: 0
    };
    
    setEndpoints(prev => [...prev, endpoint]);
    setIsCreateEndpointOpen(false);
    setNewEndpoint({
      name: '',
      url: '',
      method: 'POST',
      description: '',
      events: [],
      headers: {},
      secret: '',
      retryEnabled: true,
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 60000,
      timeout: 30000
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8 text-blue-600" />
            Webhook Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage webhook endpoints with retry policies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadWebhookData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateEndpointOpen} onOpenChange={setIsCreateEndpointOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a new webhook endpoint with retry policies
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint-name">Endpoint Name</Label>
                    <Input
                      id="endpoint-name"
                      value={newEndpoint.name}
                      onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter endpoint name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">HTTP Method</Label>
                    <Select value={newEndpoint.method} onValueChange={(value: any) => setNewEndpoint(prev => ({ ...prev, method: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint-url">Webhook URL</Label>
                  <Input
                    id="endpoint-url"
                    value={newEndpoint.url}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.example.com/webhooks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint-description">Description</Label>
                  <Textarea
                    id="endpoint-description"
                    value={newEndpoint.description}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this endpoint handles"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEvents.map(event => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newEndpoint.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEndpoint(prev => ({
                                ...prev,
                                events: [...prev.events, event]
                              }));
                            } else {
                              setNewEndpoint(prev => ({
                                ...prev,
                                events: prev.events.filter(e => e !== event)
                              }));
                            }
                          }}
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newEndpoint.retryEnabled}
                      onCheckedChange={(checked) => setNewEndpoint(prev => ({ ...prev, retryEnabled: checked }))}
                    />
                    <Label>Enable Retry Policy</Label>
                  </div>
                  
                  {newEndpoint.retryEnabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Max Attempts</Label>
                        <Input
                          type="number"
                          value={newEndpoint.maxAttempts}
                          onChange={(e) => setNewEndpoint(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                          min={1}
                          max={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Backoff Strategy</Label>
                        <Select value={newEndpoint.backoffStrategy} onValueChange={(value: any) => setNewEndpoint(prev => ({ ...prev, backoffStrategy: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exponential">Exponential</SelectItem>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Initial Delay (ms)</Label>
                        <Input
                          type="number"
                          value={newEndpoint.initialDelay}
                          onChange={(e) => setNewEndpoint(prev => ({ ...prev, initialDelay: parseInt(e.target.value) }))}
                          min={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Delay (ms)</Label>
                        <Input
                          type="number"
                          value={newEndpoint.maxDelay}
                          onChange={(e) => setNewEndpoint(prev => ({ ...prev, maxDelay: parseInt(e.target.value) }))}
                          min={1000}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateEndpointOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createEndpoint}>
                    Create Endpoint
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics?.totalEndpoints} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics ? ((metrics.successfulDeliveries / metrics.totalDeliveries) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.successfulDeliveries} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Letter Queue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.deadLetterQueueSize}
            </div>
            <p className="text-xs text-muted-foreground">
              Failed deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="retries">Retry Queue</TabsTrigger>
          <TabsTrigger value="dead-letters">Dead Letters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Webhook Endpoints
              </CardTitle>
              <CardDescription>
                Manage webhook endpoints and their retry policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={endpoint.enabled}
                          onCheckedChange={() => toggleEndpoint(endpoint.id)}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{endpoint.name}</h4>
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <Badge className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono">{endpoint.url}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{endpoint.successRate}%</p>
                          <Progress value={endpoint.successRate} className="h-2 flex-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Deliveries</p>
                        <p className="font-semibold">{endpoint.totalDeliveries.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="font-semibold text-red-600">{endpoint.failedDeliveries}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Used</p>
                        <p className="font-semibold">
                          {endpoint.lastUsed ? new Date(endpoint.lastUsed).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Events:</span>
                          <div className="flex gap-1">
                            {endpoint.events.slice(0, 3).map((event, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {endpoint.events.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{endpoint.events.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Retry: {endpoint.retryPolicy.enabled ? 'Enabled' : 'Disabled'}</span>
                          <span>Timeout: {endpoint.timeout / 1000}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Deliveries
              </CardTitle>
              <CardDescription>
                Webhook delivery attempts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{delivery.endpointName}</h4>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status}
                          </Badge>
                          <Badge variant="outline">{delivery.event}</Badge>
                        </div>
                        
                        {delivery.error && (
                          <p className="text-sm text-red-600">{delivery.error}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(delivery.createdAt).toLocaleString()}</span>
                          <span>Attempt {delivery.attempts}/{delivery.maxAttempts}</span>
                          {delivery.statusCode && (
                            <span>Status: {delivery.statusCode}</span>
                          )}
                          {delivery.responseTime && (
                            <span>Response: {delivery.responseTime}ms</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {delivery.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => retryDelivery(delivery.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedDelivery(delivery)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {delivery.nextRetry && (
                      <div className="text-sm text-muted-foreground">
                        Next retry: {new Date(delivery.nextRetry).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Retry Queue
              </CardTitle>
              <CardDescription>
                Scheduled delivery retries with exponential backoff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retryJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{job.endpointName}</h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          <Badge variant="outline">{job.event}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <span>Attempt {job.attempt}/{job.maxAttempts}</span>
                          <span>Delay: {job.delay / 1000}s</span>
                          <span>Strategy: {job.backoffStrategy}</span>
                          <span>Next: {new Date(job.nextRetry).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dead-letters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Dead Letter Queue
              </CardTitle>
              <CardDescription>
                Failed deliveries that exceeded maximum retry attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deadLetterQueue.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.endpointName}</h4>
                          <Badge className={item.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {item.resolved ? 'Resolved' : 'Open'}
                          </Badge>
                          <Badge variant="outline">{item.event}</Badge>
                        </div>
                        
                        <p className="text-sm text-red-600">{item.failureReason}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.attempts} attempts</span>
                          <span>First: {new Date(item.firstFailedAt).toLocaleDateString()}</span>
                          <span>Last: {new Date(item.lastFailedAt).toLocaleDateString()}</span>
                          {item.resolved && item.resolvedBy && (
                            <span>Resolved by: {item.resolvedBy}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!item.resolved && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resolveDeadLetter(item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Failing Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topFailingEndpoints.map((endpoint, index) => (
                    <div key={endpoint.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm font-medium">{endpoint.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{endpoint.failureRate}%</p>
                        <p className="text-xs text-muted-foreground">failure rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Event Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics && Object.entries(metrics.eventDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([event, count], index) => (
                    <div key={event} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                        ></div>
                        <span className="text-sm font-medium">{event}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {((count / metrics.totalDeliveries) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}