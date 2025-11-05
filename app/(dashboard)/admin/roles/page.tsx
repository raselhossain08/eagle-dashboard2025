// app/admin/roles/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'

import { toast } from 'sonner'
import { PaginatedResponse } from '@/lib/types'
import { Role } from '@/lib/types/auth'
import { roleService } from '@/lib/services/admin'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRoles()
  }, [page, search])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const response = await roleService.getRoles({
        page,
        limit,
        search: search || undefined
      })

      // The service now handles the response structure conversion
      setRoles(response.items)
      setTotal(response.pagination.total)
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      await roleService.deleteRole(roleId)
      toast.success('Role deleted successfully')
      loadRoles()
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast.error('Failed to delete role')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Button asChild>
          <Link href="/admin/roles/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                {total} role{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search roles..."
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
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {role.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permission => (
                            <Badge key={permission.id} variant="secondary" className="text-xs">
                              {permission.resource}:{permission.action}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(role.createdAt).toLocaleDateString()}
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
                              <Link href={`/admin/roles/${role.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteRole(role.id)}
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

              {roles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No roles found
                </div>
              )}

              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
                    .filter(pageNum => 
                      pageNum === 1 || 
                      pageNum === Math.ceil(total / limit) || 
                      Math.abs(pageNum - page) <= 1
                    )
                    .map((pageNum, index) => (
                      <PaginationItem key={`page-${pageNum}-${index}`}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(pageNum)
                          }}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < Math.ceil(total / limit)) setPage(page + 1)
                      }}
                      className={page >= Math.ceil(total / limit) ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}