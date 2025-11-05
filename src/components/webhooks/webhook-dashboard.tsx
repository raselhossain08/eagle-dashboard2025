'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Play, Pause } from 'lucide-react'

export default function WebhookDashboard() {
  const [webhooks] = useState([
    {
      id: '1',
      name: 'Payment Notifications',
      url: 'https://api.example.com/webhooks/payments',
      status: 'active',
      events: ['payment.created', 'payment.updated'],
      lastTriggered: '2025-11-01T10:30:00Z'
    },
    {
      id: '2',
      name: 'User Registration',
      url: 'https://api.example.com/webhooks/users',
      status: 'inactive',
      events: ['user.created', 'user.updated'],
      lastTriggered: '2025-10-30T15:20:00Z'
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <div className="grid gap-6">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">{webhook.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                  {webhook.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  {webhook.status === 'active' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>URL:</strong> {webhook.url}
                </p>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Last Triggered:</strong> {new Date(webhook.lastTriggered).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}