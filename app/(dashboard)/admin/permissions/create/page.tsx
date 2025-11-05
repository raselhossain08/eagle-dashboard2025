// app/admin/permissions/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { permissionService } from '@/lib/services/admin/permission.service'
import { toast } from 'sonner'

const categories = [
  { value: 'user_management', label: 'User Management' },
  { value: 'system_admin', label: 'System Administration' },
  { value: 'security_settings', label: 'Security Settings' },
  { value: 'analytics_reports', label: 'Analytics & Reports' },
  { value: 'billing_settings', label: 'Billing Settings' },
  { value: 'content_management', label: 'Content Management' }
]

const actions = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'manage', label: 'Manage' }
]

export default function CreatePermissionPage() {
  const [formData, setFormData] = useState({
    resource: '',
    action: 'read',
    description: '',
    category: 'user_management'
  })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await permissionService.createPermission(formData)
      toast.success('Permission created successfully')
      router.push('/admin/permissions')
    } catch (error: any) {
      console.error('Failed to create permission:', error)
      toast.error(error.response?.data?.message || 'Failed to create permission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/permissions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Permission</h1>
          <p className="text-gray-600">Define a new system permission</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Permission Details</CardTitle>
            <CardDescription>
              Define the resource, action, and scope for this permission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Input
                  id="resource"
                  placeholder="e.g., users, billing, settings"
                  value={formData.resource}
                  onChange={(e) => handleChange('resource', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  The resource this permission applies to
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value) => handleChange('action', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map(action => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  The action allowed on the resource
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Category for organizing permissions
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this permission allows..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                required
              />
              <p className="text-sm text-gray-500">
                Clear description of what this permission enables
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Permission'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/permissions">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}