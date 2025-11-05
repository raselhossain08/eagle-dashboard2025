// app/admin/permissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { permissionService } from '@/lib/services/admin/permission.service'
import { Permission, PaginatedResponse } from '@/lib/types'
import { toast } from 'sonner'

const categories = [
  'user_management',
  'system_admin',
  'security_settings',
  'analytics_reports',
  'billing_settings',
  'content_management'
]

const actions = ['read', 'create', 'update', 'delete', 'manage']

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {
    loadPermissions()
  }, [page, search, selectedCategory, selectedAction])

  const loadPermissions = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page,
        limit,
        search: search || undefined
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      if (selectedAction !== 'all') {
        params.action = selectedAction
      }

      const response = await permissionService.getPermissions(params) as any
      setPermissions(response.items || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return

    try {
      await permissionService.deletePermission(permissionId)
      toast.success('Permission deleted successfully')
      loadPermissions()
    } catch (error) {
      console.error('Failed to delete permission:', error)
      toast.error('Failed to delete permission')
    }
  }

  const getActionBadge = (action: string) => {
    const variants = {
      read: 'default',
      create: 'secondary',
      update: 'outline',
      delete: 'destructive',
      manage: 'default'
    } as const

    return (
      <Badge variant={variants[action as keyof typeof variants] || 'default'}>
        {action}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600">Manage system permissions and access controls</p>
        </div>
        <Button asChild>
          <Link href="/admin/permissions/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Permission
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                {total} permission{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category, index) => (
                      <SelectItem key={`category-${category}-${index}`} value={category} className="capitalize">
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actions.map((action, index) => (
                      <SelectItem key={`action-${action}-${index}`} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search permissions..."
                  className="pl-8 w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission, index) => (
                    <TableRow key={permission.id || `permission-${index}`}>
                      <TableCell>
                        <div className="font-medium capitalize">
                          {permission.resource.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(permission.action)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {permission.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 max-w-md">
                          {permission.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(permission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/permissions/${permission.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeletePermission(permission.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {permissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No permissions found
                </div>
              )}

              {Math.ceil(total / limit) > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    Page {page} of {Math.ceil(total / limit)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))}
                    disabled={page === Math.ceil(total / limit)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}