"use client";

import { UserProfile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export function UserDetailsDialog({
  open,
  onOpenChange,
  user,
}: UserDetailsDialogProps) {
  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    user.role === "administrator" ? "destructive" : "default"
                  }
                >
                  {user.role}
                </Badge>
                <Badge
                  variant={user.status === "active" ? "default" : "secondary"}
                  className={
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Contact Information
              </h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Email: {user.email}</p>
                {user.phone && <p>Phone: {user.phone}</p>}
                <p>Email Verified: {user.isEmailVerified ? "Yes" : "No"}</p>
              </div>
            </div>

            {user.address && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Address
                </h4>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {user.address.street && <p>{user.address.street}</p>}
                  <p>
                    {[
                      user.address.city,
                      user.address.state,
                      user.address.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {user.address.country && <p>{user.address.country}</p>}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Account Information
              </h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                <p>
                  Last Updated: {new Date(user.updatedAt).toLocaleDateString()}
                </p>
                {user.lastLogin && (
                  <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
                )}
                <p>Login Count: {user.loginCount}</p>
                {user.isOnline !== undefined && (
                  <p>Status: {user.isOnline ? "Online" : "Offline"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
