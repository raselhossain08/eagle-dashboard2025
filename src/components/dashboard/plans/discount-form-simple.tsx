"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 
import { useToast } from "@/hooks/use-toast";
import { discountService, type Discount, type CreateDiscountData } from "@/lib/services/plans/discount.service";interface DiscountFormProps {
  discount?: Discount | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DiscountForm({ discount, onSuccess, onCancel }: DiscountFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDiscountData>({
    code: discount?.code || "",
    name: discount?.name || "",
    description: discount?.description || "",
    type: discount?.type || "percentage",
    value: discount?.value || 0,
    currency: discount?.currency || "USD",
    status: (discount?.status === "expired" || discount?.status === "exhausted") ? "inactive" : discount?.status || "inactive",
    isPublic: discount?.isPublic || false,
    constraints: {
      maxTotalUses: discount?.constraints?.maxTotalUses || undefined,
      maxUsesPerUser: discount?.constraints?.maxUsesPerUser || undefined,
      minimumOrderAmount: discount?.constraints?.minimumOrderAmount || undefined,
      maximumOrderAmount: discount?.constraints?.maximumOrderAmount || undefined,
      maximumDiscountAmount: discount?.constraints?.maximumDiscountAmount || undefined,
      validFrom: discount?.constraints?.validFrom || undefined,
      validUntil: discount?.constraints?.validUntil || undefined,
      firstTimeUsersOnly: discount?.constraints?.firstTimeUsersOnly || false,
      stackable: discount?.constraints?.stackable || false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate discount code format
      const codeValidation = discountService.validateDiscountCodeFormat(formData.code);
      if (!codeValidation.isValid) {
        toast({
          title: "Invalid Code",
          description: codeValidation.errors[0],
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let response;
      if (discount?._id) {
        response = await discountService.updateDiscount(discount._id, formData);
      } else {
        response = await discountService.createDiscount(formData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Discount ${discount ? 'updated' : 'created'} successfully`,
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to ${discount ? 'update' : 'create'} discount`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${discount ? 'update' : 'create'} discount`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Set up the basic details for your discount code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code *</Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  placeholder="SAVE20"
                  className="font-mono uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomCode}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                placeholder="20% Off Sale"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Limited time offer for new customers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Discount Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Discount Value */}
          {(formData.type === "percentage" || formData.type === "fixed_amount") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === "percentage" ? "Percentage *" : "Amount *"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={formData.type === "percentage" ? "20" : "10.00"}
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  step="0.01"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              {formData.type === "fixed_amount" && (
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
            <Label htmlFor="isPublic">Public Discount (show in public listings)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Constraints</CardTitle>
          <CardDescription>
            Set usage limits and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTotalUses">Max Total Uses</Label>
              <Input
                id="maxTotalUses"
                type="number"
                placeholder="100"
                min="1"
                value={formData.constraints?.maxTotalUses || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      maxTotalUses: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                placeholder="1"
                min="1"
                value={formData.constraints?.maxUsesPerUser || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      maxUsesPerUser: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
              <Input
                id="minimumOrderAmount"
                type="number"
                placeholder="50.00"
                min="0"
                step="0.01"
                value={formData.constraints?.minimumOrderAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      minimumOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumDiscountAmount">Max Discount Cap</Label>
              <Input
                id="maximumDiscountAmount"
                type="number"
                placeholder="100.00"
                min="0"
                step="0.01"
                value={formData.constraints?.maximumDiscountAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From (Date)</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.constraints?.validFrom || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      validFrom: e.target.value || undefined,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until (Date)</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.constraints?.validUntil || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      validUntil: e.target.value || undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="firstTimeUsersOnly"
                checked={formData.constraints?.firstTimeUsersOnly || false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      firstTimeUsersOnly: checked,
                    },
                  })
                }
              />
              <Label htmlFor="firstTimeUsersOnly">First-time Users Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stackable"
                checked={formData.constraints?.stackable || false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      stackable: checked,
                    },
                  })
                }
              />
              <Label htmlFor="stackable">Stackable with other discounts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
              {discount ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            discount ? 'Update Discount' : 'Create Discount'
          )}
        </Button>
      </div>
    </form>
  );
}