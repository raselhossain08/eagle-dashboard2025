'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Settings,
  Plus,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  TestTube,
  Activity
} from 'lucide-react'
import WebhookService, { type Webhook, type WebhookDelivery } from '@/lib/services/webhook.service'
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available webhook events
const WEBHOOK_EVENTS = [
  { value: 'payment.created', label: 'Payment Created' },
  { value: 'payment.updated', label: 'Payment Updated' },
  { value: 'payment.completed', label: 'Payment Completed' },
  { value: 'payment.failed', label: 'Payment Failed' },
  { value: 'subscription.created', label: 'Subscription Created' },
  { value: 'subscription.updated', label: 'Subscription Updated' },
  { value: 'subscription.cancelled', label: 'Subscription Cancelled' },
  { value: 'subscription.expired', label: 'Subscription Expired' },
  { value: 'user.created', label: 'User Created' },
  { value: 'user.updated', label: 'User Updated' },
  { value: 'user.deleted', label: 'User Deleted' },
  { value: 'transaction.created', label: 'Transaction Created' },
  { value: 'transaction.completed', label: 'Transaction Completed' },
]

export default function WebhookDashboard() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeliveriesDialogOpen, setIsDeliveriesDialogOpen] = useState(false)

  // Current webhook
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [loadingDeliveries, setLoadingDeliveries] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    enabled: true,
    retryPolicy: 'exponential',
    maxRetries: 3,
    timeout: 30,
    verifySsl: true,
  })

  const [showSecret, setShowSecret] = useState(false)
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)

  // Fetch webhooks
  const fetchWebhooks = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await WebhookService.getWebhooks()

      if (response.success) {
        setWebhooks(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch webhooks')
      }
    } catch (err) {
      console.error('Error fetching webhooks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch webhooks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [])

  // Create webhook
  const handleCreateWebhook = async () => {
    setError(null)
    setSuccess(null)

    if (!formData.name || !formData.url || formData.events.length === 0) {
      setError('Please fill all required fields')
      return
    }

    try {
      const response = await WebhookService.createWebhook(formData)

      if (response.success) {
        setSuccess('Webhook created successfully!')
        setIsCreateDialogOpen(false)
        resetForm()
        await fetchWebhooks()
      } else {
        setError(response.message || 'Failed to create webhook')
      }
    } catch (err) {
      console.error('Error creating webhook:', err)
      setError(err instanceof Error ? err.message : 'Failed to create webhook')
    }
  }

  // Update webhook
  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return

    setError(null)
    setSuccess(null)

    try {
      const response = await WebhookService.updateWebhook(
        selectedWebhook._id || selectedWebhook.id!,
        formData
      )

      if (response.success) {
        setSuccess('Webhook updated successfully!')
        setIsEditDialogOpen(false)
        resetForm()
        await fetchWebhooks()
      } else {
        setError(response.message || 'Failed to update webhook')
      }
    } catch (err) {
      console.error('Error updating webhook:', err)
      setError(err instanceof Error ? err.message : 'Failed to update webhook')
    }
  }

  // Delete webhook
  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return

    setError(null)
    setSuccess(null)

    try {
      const response = await WebhookService.deleteWebhook(
        selectedWebhook._id || selectedWebhook.id!
      )

      if (response.success) {
        setSuccess('Webhook deleted successfully!')
        setIsDeleteDialogOpen(false)
        setSelectedWebhook(null)
        await fetchWebhooks()
      } else {
        setError(response.message || 'Failed to delete webhook')
      }
    } catch (err) {
      console.error('Error deleting webhook:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete webhook')
    }
  }

  // Toggle webhook enabled/disabled
  const handleToggleWebhook = async (webhook: Webhook) => {
    setError(null)

    try {
      const response = await WebhookService.toggleWebhook(
        webhook._id || webhook.id!,
        !webhook.enabled
      )

      if (response.success) {
        setSuccess(`Webhook ${!webhook.enabled ? 'enabled' : 'disabled'} successfully!`)
        await fetchWebhooks()
      } else {
        setError(response.message || 'Failed to toggle webhook')
      }
    } catch (err) {
      console.error('Error toggling webhook:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle webhook')
    }
  }

  // Test webhook
  const handleTestWebhook = async (webhook: Webhook) => {
    setTestingWebhook(webhook._id || webhook.id!)
    setError(null)

    try {
      const response = await WebhookService.testWebhook(webhook._id || webhook.id!)

      if (response.success) {
        setSuccess('Test webhook delivered successfully!')
      } else {
        setError(response.message || 'Test webhook failed')
      }
    } catch (err) {
      console.error('Error testing webhook:', err)
      setError(err instanceof Error ? err.message : 'Failed to test webhook')
    } finally {
      setTestingWebhook(null)
    }
  }

  // Fetch deliveries
  const fetchDeliveries = async (webhook: Webhook) => {
    setLoadingDeliveries(true)
    setError(null)

    try {
      const response = await WebhookService.getWebhookDeliveries(
        webhook._id || webhook.id!,
        20
      )

      if (response.success) {
        setDeliveries(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch deliveries')
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries')
    } finally {
      setLoadingDeliveries(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      enabled: webhook.enabled,
      retryPolicy: webhook.retryPolicy,
      maxRetries: webhook.maxRetries,
      timeout: webhook.timeout,
      verifySsl: webhook.verifySsl ?? true,
    })
    setIsEditDialogOpen(true)
  }

  // Open deliveries dialog
  const openDeliveriesDialog = async (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setIsDeliveriesDialogOpen(true)
    await fetchDeliveries(webhook)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      enabled: true,
      retryPolicy: 'exponential',
      maxRetries: 3,
      timeout: 30,
      verifySsl: true,
    })
    setSelectedWebhook(null)
  }

  // Toggle event selection
  const toggleEvent = (eventValue: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue]
    }))
  }

  // Copy secret to clipboard
  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret)
    setSuccess('Secret copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage webhook endpoints
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Webhooks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first webhook to start receiving event notifications
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {webhooks.map((webhook) => (
            <Card key={webhook._id || webhook.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-xl">{webhook.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    {webhook.url}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                    {webhook.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook)}
                    disabled={testingWebhook === (webhook._id || webhook.id)}
                  >
                    {testingWebhook === (webhook._id || webhook.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(webhook)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleWebhook(webhook)}
                  >
                    {webhook.enabled ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWebhook(webhook)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Events */}
                  <div>
                    <Label className="text-sm font-semibold">Events:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Deliveries</p>
                      <p className="text-lg font-semibold">
                        {webhook.deliveryStats?.total || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Successful</p>
                      <p className="text-lg font-semibold text-green-600">
                        {webhook.deliveryStats?.successful || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="text-lg font-semibold text-red-600">
                        {webhook.deliveryStats?.failed || 0}
                      </p>
                    </div>
                  </div>

                  {/* Last Delivery */}
                  {webhook.lastDelivery && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Last Delivery:</strong> {new Date(webhook.lastDelivery).toLocaleString()}
                    </p>
                  )}

                  {/* View Deliveries Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeliveriesDialog(webhook)}
                    className="w-full mt-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Delivery Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Webhook Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? 'Update webhook configuration'
                : 'Configure a new webhook endpoint to receive event notifications'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Payment Notifications"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-domain.com/webhooks/endpoint"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            {/* Events */}
            <div className="space-y-2">
              <Label>Events to Subscribe *</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onCheckedChange={() => toggleEvent(event.value)}
                    />
                    <Label
                      htmlFor={event.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {formData.events.length} event(s)
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Advanced Settings</h3>

              {/* Retry Policy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retryPolicy">Retry Policy</Label>
                  <Select
                    value={formData.retryPolicy}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, retryPolicy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exponential">Exponential Backoff</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="none">No Retry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Retries */}
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxRetries}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Timeout */}
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="120"
                  value={formData.timeout}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                />
              </div>

              {/* Verify SSL */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verifySsl"
                  checked={formData.verifySsl}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verifySsl: checked as boolean }))}
                />
                <Label
                  htmlFor="verifySsl"
                  className="text-sm font-normal cursor-pointer"
                >
                  Verify SSL certificates (recommended)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditDialogOpen ? handleUpdateWebhook : handleCreateWebhook}>
              {isEditDialogOpen ? 'Update' : 'Create'} Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedWebhook?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWebhook}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliveries Dialog */}
      <Dialog open={isDeliveriesDialogOpen} onOpenChange={setIsDeliveriesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Delivery Logs</DialogTitle>
            <DialogDescription>
              Recent delivery attempts for &quot;{selectedWebhook?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          {loadingDeliveries ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deliveries yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell className="font-mono text-xs">
                      {delivery.event}
                    </TableCell>
                    <TableCell>
                      {delivery.success ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{delivery.statusCode}</TableCell>
                    <TableCell>{delivery.duration}ms</TableCell>
                    <TableCell>{delivery.attempt}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(delivery.deliveredAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}