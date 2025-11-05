
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import planService, { Plan } from '@/services/plans';

interface QuickEditDialogProps {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type QuickEditField = 
  | 'displayName'
  | 'description' 
  | 'isActive'
  | 'isPopular'
  | 'isRecommended'
  | 'isFeatured'
  | 'sortOrder'
  | 'accessLevel'
  | 'monthlyPrice'
  | 'annualPrice'
  | 'oneTimePrice';

const fieldLabels: Record<QuickEditField, string> = {
  displayName: 'Display Name',
  description: 'Description',
  isActive: 'Active Status',
  isPopular: 'Popular',
  isRecommended: 'Recommended',
  isFeatured: 'Featured',
  sortOrder: 'Sort Order',
  accessLevel: 'Access Level',
  monthlyPrice: 'Monthly Price',
  annualPrice: 'Annual Price',
  oneTimePrice: 'One-Time Price'
};

export function QuickEditDialog({ plan, open, onOpenChange, onSuccess }: QuickEditDialogProps) {
  const [selectedField, setSelectedField] = useState<QuickEditField>('displayName');
  const [fieldValue, setFieldValue] = useState<string | number | boolean>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (plan && open) {
      // Set initial value based on selected field
      switch (selectedField) {
        case 'displayName':
          setFieldValue(plan.displayName || '');
          break;
        case 'description':
          setFieldValue(plan.description || '');
          break;
        case 'isActive':
          setFieldValue(plan.isActive ?? true);
          break;
        case 'isPopular':
          setFieldValue(plan.isPopular ?? false);
          break;
        case 'isRecommended':
          setFieldValue(plan.isRecommended ?? false);
          break;
        case 'isFeatured':
          setFieldValue(plan.isFeatured ?? false);
          break;
        case 'sortOrder':
          setFieldValue(plan.sortOrder ?? 0);
          break;
        case 'accessLevel':
          setFieldValue(plan.accessLevel ?? 1);
          break;
        case 'monthlyPrice':
          setFieldValue(plan.pricing?.monthly?.price ?? 0);
          break;
        case 'annualPrice':
          setFieldValue(plan.pricing?.annual?.price ?? 0);
          break;
        case 'oneTimePrice':
          setFieldValue(plan.pricing?.oneTime?.price ?? 0);
          break;
        default:
          setFieldValue('');
      }
    }
  }, [plan, selectedField, open]);

  const handleSubmit = async () => {
    if (!plan) return;

    try {
      setIsSubmitting(true);
      
      // Prepare update data based on selected field
      let updateData: any = {};
      
      switch (selectedField) {
        case 'displayName':
          updateData.displayName = fieldValue as string;
          break;
        case 'description':
          updateData.description = fieldValue as string;
          break;
        case 'isActive':
          updateData.isActive = fieldValue as boolean;
          break;
        case 'isPopular':
          updateData.isPopular = fieldValue as boolean;
          break;
        case 'isRecommended':
          updateData.isRecommended = fieldValue as boolean;
          break;
        case 'isFeatured':
          updateData.isFeatured = fieldValue as boolean;
          break;
        case 'sortOrder':
          updateData.sortOrder = Number(fieldValue);
          break;
        case 'accessLevel':
          updateData.accessLevel = Number(fieldValue);
          break;
        case 'monthlyPrice':
          updateData.pricing = {
            ...plan.pricing,
            monthly: {
              ...plan.pricing?.monthly,
              price: Number(fieldValue)
            }
          };
          break;
        case 'annualPrice':
          updateData.pricing = {
            ...plan.pricing,
            annual: {
              ...plan.pricing?.annual,
              price: Number(fieldValue)
            }
          };
          break;
        case 'oneTimePrice':
          updateData.pricing = {
            ...plan.pricing,
            oneTime: {
              ...plan.pricing?.oneTime,
              price: Number(fieldValue)
            }
          };
          break;
      }

      await planService.updatePlan(plan._id, updateData);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Quick edit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = () => {
    const booleanFields = ['isActive', 'isPopular', 'isRecommended', 'isFeatured'];
    const numberFields = ['sortOrder', 'accessLevel', 'monthlyPrice', 'annualPrice', 'oneTimePrice'];
    const textAreaFields = ['description'];

    if (booleanFields.includes(selectedField)) {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={selectedField}
            checked={fieldValue as boolean}
            onCheckedChange={setFieldValue}
          />
          <Label htmlFor={selectedField}>
            {(fieldValue as boolean) ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      );
    }

    if (numberFields.includes(selectedField)) {
      return (
        <Input
          type="number"
          value={fieldValue as number}
          onChange={(e) => setFieldValue(Number(e.target.value))}
          min={selectedField.includes('Price') ? 0 : undefined}
          step={selectedField.includes('Price') ? 0.01 : 1}
        />
      );
    }

    if (textAreaFields.includes(selectedField)) {
      return (
        <Textarea
          value={fieldValue as string}
          onChange={(e) => setFieldValue(e.target.value)}
          rows={4}
        />
      );
    }

    return (
      <Input
        type="text"
        value={fieldValue as string}
        onChange={(e) => setFieldValue(e.target.value)}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Quick Edit: {plan?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="field-select">Select Field to Edit</Label>
            <Select value={selectedField} onValueChange={(value: QuickEditField) => setSelectedField(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={selectedField}>{fieldLabels[selectedField]}</Label>
            {renderFieldInput()}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Field'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}