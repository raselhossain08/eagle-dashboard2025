'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Discount } from '@/lib/services/discount.service';

interface EditDiscountDialogProps {
    discount: Discount | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Partial<Discount>) => void;
}

export function EditDiscountDialog({ discount, open, onOpenChange, onSave }: EditDiscountDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        value: 0,
    });

    useEffect(() => {
        if (discount) {
            setFormData({
                name: discount.name,
                code: discount.code,
                value: discount.value,
            });
        }
    }, [discount]);

    const handleSave = () => {
        onSave(formData);
        onOpenChange(false);
    };

    if (!discount) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Discount</DialogTitle>
                    <DialogDescription>Update discount details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                            id="value"
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
