"use client";

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ChangeRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
    onChangeRole: (userId: string, role: string) => Promise<void>;
}

export function ChangeRoleDialog({
    open,
    onOpenChange,
    user,
    onChangeRole,
}: ChangeRoleDialogProps) {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role);
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user || !selectedRole) return;

        setLoading(true);
        try {
            await onChangeRole(user._id, selectedRole);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to change role:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'moderator':
                return 'default';
            case 'subscriber':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Full access to all features and settings';
            case 'moderator':
                return 'Can manage users and content';
            case 'subscriber':
                return 'Access to subscribed content';
            case 'user':
                return 'Basic user access';
            default:
                return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                        Update the role for <span className="font-semibold">{user?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Current Role</Label>
                        <div>
                            <Badge variant={getRoleBadgeVariant(user?.role || '')}>
                                {user?.role || 'N/A'}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">New Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="subscriber">Subscriber</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="author">Author</SelectItem>
                                <SelectItem value="contributor">Contributor</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="administrator">Administrator</SelectItem>
                                <SelectItem value="shop_manager">Shop Manager</SelectItem>
                                <SelectItem value="group_leader">Group Leader</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="web_designer">Web Designer</SelectItem>
                                <SelectItem value="seo_manager">SEO Manager</SelectItem>
                                <SelectItem value="seo_editor">SEO Editor</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedRole && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getRoleDescription(selectedRole)}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedRole || selectedRole === user?.role}
                    >
                        {loading ? 'Changing...' : 'Change Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
