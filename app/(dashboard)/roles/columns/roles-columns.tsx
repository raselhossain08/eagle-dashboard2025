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

// Extended Role type for the table
export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy: number;
  level: number; // For backward compatibility
  color: string;
  icon: string;
  isActive: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
  email?: string;
}

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

const getRoleLabel = (level: number) => {
  const roleLevel = ROLE_LEVELS.find(rl => rl.value === level);
  return roleLevel?.label || 'Unknown';
};

interface RolesTableActionsProps {
  role: Role;
  canEditRoles: boolean;
  canDeleteRoles: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onCopy: (role: Role) => void;
  onAssignUsers: (role: Role) => void;
  onRefresh?: () => void;
}

function RolesTableActions({ 
  role, 
  canEditRoles, 
  canDeleteRoles,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onAssignUsers,
  onRefresh
}: RolesTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(role)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {canEditRoles && (
          <>
            <DropdownMenuItem onClick={() => onAssignUsers(role)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(role)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy(role)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Role
            </DropdownMenuItem>
          </>
        )}
        {canDeleteRoles && 
         !['superadmin', 'admin', 'user'].includes(role.name) && (
          <DropdownMenuItem 
            onClick={() => onDelete(role)}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Role
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createRolesColumns = (
  canEditRoles: boolean,
  canDeleteRoles: boolean,
  onView: (role: Role) => void,
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void,
  onCopy: (role: Role) => void,
  onAssignUsers: (role: Role) => void
): ColumnDef<Role>[] => [
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
    accessorKey: "displayName",
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
      const role = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {getRoleIcon(role.level)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {role.displayName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {role.name}
            </div>
            {role.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {role.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original;
      return (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
          {getRoleIcon(role.level)}
          {getRoleLabel(role.level)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {role.permissions.length} permissions
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <Badge variant={role.isActive ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
          {role.isActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {role.isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Users
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {role.userCount || 0} users
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
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(role.createdAt).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const role = row.original;
      return (
        <RolesTableActions 
          role={role}
          canEditRoles={canEditRoles}
          canDeleteRoles={canDeleteRoles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
          onAssignUsers={onAssignUsers}
        />
      );
    },
  },
]