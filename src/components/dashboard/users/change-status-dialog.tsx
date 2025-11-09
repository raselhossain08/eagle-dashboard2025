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
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ChangeStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
    onChangeStatus: (userId: string, status: string) => Promise<void>;
}

export function ChangeStatusDialog({
    open,
    onOpenChange,
    user,
    onChangeStatus,
}: ChangeStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedStatus(user.status);
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user || !selectedStatus) return;

        setLoading(true);
        try {
            await onChangeStatus(user._id, selectedStatus);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to change status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'inactive':
                return <XCircle className="w-4 h-4 text-gray-600" />;
            case 'suspended':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return null;
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'active':
                return 'User can access the system normally';
            case 'inactive':
                return 'User account is deactivated but not deleted';
            case 'suspended':
                return 'User is temporarily blocked from accessing the system';
            case 'pending':
                return 'User needs to verify their email or complete registration';
            default:
                return '';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Change User Status</DialogTitle>
                    <DialogDescription>
                        Update the status for <span className="font-semibold">{user?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div>
                            <Badge className={getStatusBadgeClass(user?.status || '')}>
                                <span className="flex items-center gap-1">
                                    {getStatusIcon(user?.status || '')}
                                    {user?.status || 'N/A'}
                                </span>
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon('active')}
                                        <span>Active</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon('inactive')}
                                        <span>Inactive</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="suspended">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon('suspended')}
                                        <span>Suspended</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon('pending')}
                                        <span>Pending</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedStatus && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getStatusDescription(selectedStatus)}
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
                        disabled={loading || !selectedStatus || selectedStatus === user?.status}
                    >
                        {loading ? 'Changing...' : 'Change Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
