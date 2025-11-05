// components/admin/assign-role-dialog.tsx
'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { roleService } from '@/lib/services/admin'
import { Role } from '@/lib/types/auth'
import { toast } from 'sonner'

interface AssignRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  availableRoles: Role[]
  onRoleAssigned: () => void
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  userId,
  availableRoles,
  onRoleAssigned
}: AssignRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role')
      return
    }

    setIsLoading(true)

    try {
      await roleService.assignRole(
        userId, 
        selectedRoleId, 
        expiresAt || undefined
      )

      toast.success('Role assigned successfully')

      // Reset form
      setSelectedRoleId('')
      setExpiresAt('')
      onRoleAssigned()
    } catch (error: any) {
      console.error('Failed to assign role:', error)
      toast.error(error.response?.data?.message || 'Failed to assign role')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = availableRoles.find(role => role.id === selectedRoleId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            Assign a new role to this user. You can set an expiration date if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm">
                <div className="font-medium">{selectedRole.name}</div>
                <div className="text-gray-600 mt-1">{selectedRole.description}</div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">Permissions:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRole.permissions.slice(0, 3).map(permission => (
                      <span key={permission.id} className="text-xs bg-white px-2 py-1 rounded border">
                        {permission.resource}:{permission.action}
                      </span>
                    ))}
                    {selectedRole.permissions.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{selectedRole.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <input
              type="datetime-local"
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-sm text-gray-500">
              Leave empty for permanent assignment
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedRoleId}
          >
            {isLoading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}