// app/admin/roles/create/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Search, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { permissionService, roleService } from '@/lib/services/admin'
import { Permission } from '@/lib/types'
import { toast } from 'sonner'

interface SelectedPermission extends Permission {
  selected: boolean
}

export default function CreateRolePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [permissions, setPermissions] = useState<SelectedPermission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)

  const router = useRouter()

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setIsLoadingPermissions(true)
      const response = await permissionService.getPermissions({ limit: 100 })
      const permissionsWithSelection = response.items.map(permission => ({
        ...permission,
        selected: false
      }))
      setPermissions(permissionsWithSelection)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setIsLoadingPermissions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return
    }

    const selectedPermissionIds = permissions
      .filter(p => p.selected)
      .map(p => p.id)

    if (selectedPermissionIds.length === 0) {
      toast.warning('No permissions selected. Are you sure you want to create a role without permissions?')
    }

    setIsLoading(true)

    try {
      await roleService.createRole({
        name: formData.name,
        description: formData.description,
        permissions: permissions.filter(p => p.selected)
      })

      toast.success('Role created successfully')
      router.push('/admin/roles')
    } catch (error: any) {
      console.error('Failed to create role:', error)
      toast.error(error.response?.data?.message || 'Failed to create role')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === permissionId 
          ? { ...permission, selected: !permission.selected }
          : permission
      )
    )
  }

  const handleSelectAll = (category: string) => {
    setPermissions(prev =>
      prev.map(permission =>
        (category === 'all' || permission.category === category)
          ? { ...permission, selected: true }
          : permission
      )
    )
  }

  const handleDeselectAll = (category: string) => {
    setPermissions(prev =>
      prev.map(permission =>
        (category === 'all' || permission.category === category)
          ? { ...permission, selected: false }
          : permission
      )
    )
  }

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(permissions.map(p => p.category))]
  const selectedCount = permissions.filter(p => p.selected).length
  const totalCount = permissions.length

  const getActionBadge = (action: string) => {
    const variants = {
      read: 'default',
      create: 'secondary',
      update: 'outline',
      delete: 'destructive',
      manage: 'default'
    } as const

    return (
      <Badge variant={variants[action as keyof typeof variants] || 'default'} className="text-xs">
        {action}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
          <p className="text-gray-600">Define a new role with specific permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Details</CardTitle>
                <CardDescription>
                  Basic information about the role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Content Moderator, Billing Manager"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and scope of this role..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Summary</div>
                    <div>{selectedCount} of {totalCount} permissions selected</div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating Role...' : 'Create Role'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Assignment</CardTitle>
                <CardDescription>
                  Select the permissions to assign to this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search permissions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="capitalize">
                          {category.replace('_', ' ')}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSelectAll(selectedCategory)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Select All
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeselectAll(selectedCategory)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                {isLoadingPermissions ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {categories.map(category => {
                      const categoryPermissions = filteredPermissions.filter(p => p.category === category)
                      if (categoryPermissions.length === 0) return null

                      const selectedInCategory = categoryPermissions.filter(p => p.selected).length
                      const totalInCategory = categoryPermissions.length

                      return (
                        <div key={category} className="border rounded-lg">
                          <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                            <div>
                              <h3 className="font-medium capitalize">
                                {category.replace('_', ' ')}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {selectedInCategory} of {totalInCategory} selected
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAll(category)}
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeselectAll(category)}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-4 space-y-3">
                            {categoryPermissions.map(permission => (
                              <div
                                key={permission.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  permission.selected
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => handlePermissionToggle(permission.id)}
                              >
                                <div className={`flex items-center justify-center w-5 h-5 mt-0.5 rounded border ${
                                  permission.selected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {permission.selected && <Check className="h-3 w-3" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium capitalize">
                                      {permission.resource.replace('_', ' ')}
                                    </span>
                                    {getActionBadge(permission.action)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    {filteredPermissions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No permissions found matching your criteria
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}