"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  CheckCircle,
  Crown,
  Edit,
  Eye,
  Shield,
  Trash2,
  UserCheck,
  Users,
  Copy,
} from "lucide-react"
import { User } from "@/lib/services/user.service"

const ROLE_LEVELS = [
  { value: 1, label: 'User', icon: Users },
  { value: 2, label: 'Read Only', icon: Eye },
  { value: 3, label: 'Support', icon: Shield },
  { value: 4, label: 'Growth Marketing', icon: Users },
  { value: 5, label: 'Finance Admin', icon: Shield },
  { value: 6, label: 'Admin', icon: Crown },
  { value: 7, label: 'Super Admin', icon: Crown }
];

const getRoleIcon = (level: number) => {
  const roleLevel = ROLE_LEVELS.find(rl => rl.value === level);
  const Icon = roleLevel?.icon || Shield;
  return <Icon className="h-4 w-4" />;
};

interface UsersTableActionsProps {
  user: User;
  canEdit: boolean;
  canDelete: boolean;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

function UsersTableActions({ user, canEdit, canDelete, onView, onEdit, onDelete }: UsersTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView?.(user)}>
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit?.(user)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(user)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createUsersColumns = (
  canEdit: boolean,
  canDelete: boolean,
  onView?: (user: User) => void,
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {user._id.slice(-8)}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 w-fit"
          style={{ 
            backgroundColor: user.roleMetadata?.roleInfo?.color || '#6B7280',
            color: 'white' 
          }}
        >
          {getRoleIcon(user.roleMetadata?.roleInfo?.hierarchy || 1)}
          {user.roleMetadata?.roleInfo?.displayName || user.role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </div>
          {user.isEmailVerified && (
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Badge variant={user.isActive ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
          {user.isActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {user.lastLoginAt 
            ? new Date(user.lastLoginAt).toLocaleDateString()
            : 'Never'
          }
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Member Since
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UsersTableActions 
          user={user} 
          canEdit={canEdit}
          canDelete={canDelete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

// Keep the old export for backward compatibility
export const usersColumns: ColumnDef<User>[] = createUsersColumns(false, false);