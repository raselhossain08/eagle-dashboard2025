"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Info, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { discountService, type Discount, type CreateDiscountData, type Constraints } from "@/lib/services/plans/discount.service";
import { cn } from "@/lib/utils";

// Validation schema
const discountSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50, "Code cannot exceed 50 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"]),
  value: z.number().min(0).optional(),
  currency: z.string().optional(),
  buyXGetY: z.object({
    buyQuantity: z.number().min(1),
    getQuantity: z.number().min(1),
    discountPercent: z.number().min(0).max(100).optional(),
  }).optional(),
  status: z.enum(["active", "inactive", "scheduled"]).optional(),
  isPublic: z.boolean().optional(),
  constraints: z.object({
    maxTotalUses: z.number().min(1).optional(),
    maxUsesPerUser: z.number().min(1).optional(),
    minimumOrderAmount: z.number().min(0).optional(),
    maximumOrderAmount: z.number().min(0).optional(),
    maximumDiscountAmount: z.number().min(0).optional(),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
    eligibleUserRoles: z.array(z.string()).optional(),
    eligibleUserIds: z.array(z.string()).optional(),
    excludedUserIds: z.array(z.string()).optional(),
    applicableProducts: z.array(z.object({
      productType: z.enum(["subscription", "course", "mentorship", "all"]),
      productIds: z.array(z.string()),
    })).optional(),
    allowedCountries: z.array(z.string()).optional(),
    excludedCountries: z.array(z.string()).optional(),
    firstTimeUsersOnly: z.boolean().optional(),
    stackable: z.boolean().optional(),
    validDaysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    validTimeRange: z.object({
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
  }).optional(),
  campaign: z.object({
    name: z.string().optional(),
    channel: z.enum(["email", "social", "affiliate", "referral", "organic", "paid_ads", "other"]).optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
  }).optional(),
  autoDeactivate: z.object({
    enabled: z.boolean().optional(),
    conditions: z.object({
      maxUses: z.number().optional(),
      maxAmount: z.number().optional(),
      date: z.date().optional(),
    }).optional(),
  }).optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
  discount?: Discount | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

const USER_ROLES = ["user", "premium", "pro", "enterprise"];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function DiscountForm({ discount, onSuccess, onCancel }: DiscountFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      currency: "USD",
      status: "inactive",
      isPublic: false,
      constraints: {
        firstTimeUsersOnly: false,
        stackable: false,
      },
      autoDeactivate: {
        enabled: false,
        conditions: {},
      },
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (discount) {
      const formData: any = {
        code: discount.code,
        name: discount.name,
        description: discount.description || "",
        type: discount.type,
        value: discount.value || 0,
        currency: discount.currency || "USD",
        status: discount.status,
        isPublic: discount.isPublic || false,
        buyXGetY: discount.buyXGetY,
        constraints: {
          ...discount.constraints,
          validFrom: discount.constraints?.validFrom ? new Date(discount.constraints.validFrom) : undefined,
          validUntil: discount.constraints?.validUntil ? new Date(discount.constraints.validUntil) : undefined,
        },
        campaign: discount.campaign,
        autoDeactivate: discount.autoDeactivate || { enabled: false, conditions: {} },
      };
      
      form.reset(formData);
      setShowAdvanced(true);
    }
  }, [discount, form]);

  const watchedType = form.watch("type");
  const watchedConstraints = form.watch("constraints");

  const onSubmit = async (data: DiscountFormData) => {
    setLoading(true);

    try {
      // Validate discount code format
      const codeValidation = discountService.validateDiscountCodeFormat(data.code);
      if (!codeValidation.isValid) {
        form.setError("code", { message: codeValidation.errors[0] });
        setLoading(false);
        return;
      }

      // Prepare data for API
      const formattedData: CreateDiscountData = {
        ...data,
        constraints: data.constraints ? {
          ...data.constraints,
          validFrom: data.constraints.validFrom?.toISOString(),
          validUntil: data.constraints.validUntil?.toISOString(),
        } : undefined,
        autoDeactivate: data.autoDeactivate?.enabled ? {
          enabled: data.autoDeactivate.enabled,
          conditions: {
            ...data.autoDeactivate.conditions,
            date: data.autoDeactivate.conditions?.date?.toISOString(),
          },
        } : undefined,
      };

      let response;
      if (discount?._id) {
        response = await discountService.updateDiscount(discount._id, formattedData);
      } else {
        response = await discountService.createDiscount(formattedData);
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
    form.setValue("code", code);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Code *</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="SAVE20" 
                          className="font-mono uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateRandomCode}
                      >
                        Generate
                      </Button>
                    </div>
                    <FormDescription>
                      Unique code customers will use (letters, numbers, hyphens, underscores only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="20% Off Sale" {...field} />
                    </FormControl>
                    <FormDescription>
                      Internal name for this discount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Limited time offer for new customers..."
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of this discount
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discount Value */}
            {watchedType === "percentage" && (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Percentage discount (0-100%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedType === "fixed_amount" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10.00"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Fixed discount amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedType === "buy_x_get_y" && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="buyXGetY.buyQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyXGetY.getQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Get Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyXGetY.discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 100)}
                        />
                      </FormControl>
                      <FormDescription>
                        100% = free items
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Public Discount</FormLabel>
                      <FormDescription>
                        Show in public discount listings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Constraints */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Constraints & Rules</CardTitle>
                <CardDescription>
                  Set usage limits, time restrictions, and eligibility rules
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-6">
              {/* Usage Limits */}
              <div className="space-y-4">
                <h4 className="font-medium">Usage Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="constraints.maxTotalUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Total Uses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of times this discount can be used
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints.maxUsesPerUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Uses Per User</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum uses per individual user
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Order Amount Constraints */}
              <div className="space-y-4">
                <h4 className="font-medium">Order Amount Rules</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="constraints.minimumOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50.00"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints.maximumOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Order Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500.00"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints.maximumDiscountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Discount Cap</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100.00"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Cap the maximum discount amount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Time Constraints */}
              <div className="space-y-4">
                <h4 className="font-medium">Time Restrictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="constraints.validFrom"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constraints.validUntil"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid Until</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) =>
                                date < new Date() || 
                                (watchedConstraints?.validFrom ? date <= watchedConstraints.validFrom : false)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Days of Week */}
                <FormField
                  control={form.control}
                  name="constraints.validDaysOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Days of Week</FormLabel>
                      <FormDescription>
                        Select which days of the week this discount is valid
                      </FormDescription>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(day.value) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, day.value]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== day.value));
                                }
                              }}
                            />
                            <Label className="text-sm">{day.label.substring(0, 3)}</Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* User Constraints */}
              <div className="space-y-4">
                <h4 className="font-medium">User Eligibility</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="constraints.firstTimeUsersOnly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>First-time Users Only</FormLabel>
                            <FormDescription>
                              Restrict to new customers only
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="constraints.stackable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Stackable</FormLabel>
                            <FormDescription>
                              Can be used with other discounts
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="constraints.eligibleUserRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligible User Roles</FormLabel>
                      <FormDescription>
                        Select which user roles can use this discount
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {USER_ROLES.map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(role) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, role]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== role));
                                }
                              }}
                            />
                            <Label className="capitalize">{role}</Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Geographic Constraints */}
              <div className="space-y-4">
                <h4 className="font-medium">Geographic Restrictions</h4>
                
                <FormField
                  control={form.control}
                  name="constraints.allowedCountries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Countries</FormLabel>
                      <FormDescription>
                        Leave empty to allow all countries
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {COUNTRIES.map((country) => (
                          <div key={country.code} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes(country.code) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, country.code]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== country.code));
                                }
                              }}
                            />
                            <Label className="text-sm">{country.name}</Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Campaign Information */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Tracking (Optional)</CardTitle>
            <CardDescription>
              Track the performance of marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campaign.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign.channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Channel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="affiliate">Affiliate</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="paid_ads">Paid Ads</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="campaign.utmSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Source</FormLabel>
                    <FormControl>
                      <Input placeholder="newsletter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign.utmMedium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Medium</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign.utmCampaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Campaign</FormLabel>
                    <FormControl>
                      <Input placeholder="summer-sale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
    </Form>
  );
}