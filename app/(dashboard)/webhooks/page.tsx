'use client'

import { DashboardLayout } from '@/components/layout'
import WebhookDashboard from '@/components/webhooks/webhook-dashboard'

export default function WebhooksPage() {
  return (
    <DashboardLayout>
      <WebhookDashboard />
    </DashboardLayout>
  )
}