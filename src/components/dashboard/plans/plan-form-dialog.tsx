
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, ControllerRenderProps, FieldPath } from 'react-hook-form';
import { Plus, X, Palette } from 'lucide-react';
import { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/services/plans';

// Form data interface
interface PlanFormData extends CreatePlanRequest {}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  onSubmit: (data: CreatePlanRequest | UpdatePlanRequest) => Promise<void>;
  loading?: boolean;
}

const PlanFormDialog: React.FC<PlanFormDialogProps> = ({
  open,
  onOpenChange,
  plan,
  onSubmit,
  loading = false,
}) => {
  const [currentTag, setCurrentTag] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');

  const form = useForm<PlanFormData>({
    mode: 'onChange', // Allow real-time validation
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      planType: 'subscription',
      category: 'basic',
      pricing: {
        monthly: { price: 0 },
        annual: { price: 0 },
        oneTime: { price: 0 }
      },
      features: [],
      ui: {
        icon: '',
        gradient: 'from-blue-500 to-purple-600',
        color: 'blue',
        badgeColor: 'blue',
        badgeText: ''
      },
      isActive: true,
      isPopular: false,
      isRecommended: false,
      isFeatured: false,
      sortOrder: 0,
      accessLevel: 1,
      tags: [],
      contractTemplate: '',
      termsOfService: ''
    },
  });

  // Watch features and tags arrays directly
  const watchedFeatures = form.watch('features') || [];
  const watchedTags = form.watch('tags') || [];

  // Pre-populate form when editing
  useEffect(() => {
    if (plan && open) {
      form.reset({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        planType: plan.planType,
        category: plan.category,
        pricing: plan.pricing || {
          monthly: { price: 0 },
          annual: { price: 0 },
          oneTime: { price: 0 }
        },
        features: plan.features || [],
        ui: plan.ui || {
          icon: '',
          gradient: 'from-blue-500 to-purple-600',
          color: 'blue',
          badgeColor: 'blue',
          badgeText: ''
        },
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        isRecommended: plan.isRecommended,
        isFeatured: plan.isFeatured,
        sortOrder: plan.sortOrder,
        accessLevel: plan.accessLevel,
        tags: plan.tags || [],
        contractTemplate: plan.contractTemplate || '',
        termsOfService: plan.termsOfService || '',
      });
    } else if (!plan && open) {
      form.reset({
        name: '',
        displayName: '',
        description: '',
        planType: 'subscription',
        category: 'basic',
        pricing: {
          monthly: { price: 0 },
          annual: { price: 0 },
          oneTime: { price: 0 }
        },
        features: [],
        ui: {
          icon: '',
          gradient: 'from-blue-500 to-purple-600',
          color: 'blue',
          badgeColor: 'blue',
          badgeText: ''
        },
        isActive: true,
        isPopular: false,
        isRecommended: false,
        isFeatured: false,
        sortOrder: 0,
        accessLevel: 1,
        tags: [],
        contractTemplate: '',
        termsOfService: ''
      });
    }
  }, [plan, open, form]);

  const handleSubmit = async (data: PlanFormData) => {
    try {
      // For updates, only send fields that have been modified or are meaningful
      if (plan) {
        const updateData: Partial<PlanFormData> = {};
        
        // Helper function to check if a value is meaningful (not empty/default)
        const isMeaningful = (value: any): boolean => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'number') return true; // Allow 0 as valid
          if (typeof value === 'boolean') return true; // Allow false as valid
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'object') {
            return Object.values(value).some(v => isMeaningful(v));
          }
          return true;
        };
        
        // Only include fields with meaningful values
        Object.keys(data).forEach(key => {
          const value = data[key as keyof PlanFormData];
          if (isMeaningful(value)) {
            (updateData as any)[key] = value;
          }
        });
        
        // Ensure we have at least one field to update
        if (Object.keys(updateData).length === 0) {
          throw new Error('At least one field must be provided for update');
        }
        
        await onSubmit(updateData);
      } else {
        // For new plans, use all data but validate required fields
        if (!data.name || !data.planType) {
          throw new Error('Name and Plan Type are required for new plans');
        }
        await onSubmit(data);
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      const currentFeatures = form.getValues('features') || [];
      form.setValue('features', [...currentFeatures, currentFeature.trim()]);
      setCurrentFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', currentFeatures.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim()) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const gradientOptions = [
    { label: 'Blue to Purple', value: 'from-blue-500 to-purple-600' },
    { label: 'Green to Blue', value: 'from-green-500 to-blue-500' },
    { label: 'Purple to Pink', value: 'from-purple-500 to-pink-500' },
    { label: 'Orange to Red', value: 'from-orange-500 to-red-500' },
    { label: 'Gold to Yellow', value: 'from-yellow-500 to-amber-500' },
    { label: 'Gray to Slate', value: 'from-gray-500 to-slate-600' },
  ];

  const colorOptions = [
    'blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'gray'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
          <DialogDescription>
            {plan 
              ? 'Update the plan details below.'
              : 'Create a new subscription plan, mentorship package, or script.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Configure the basic details of your plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: { field: ControllerRenderProps<PlanFormData, 'name'> }) => (
                          <FormItem>
                            <FormLabel>Plan Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., diamond-monthly" {...field} />
                            </FormControl>
                            <FormDescription>
                              Internal identifier (no spaces, lowercase)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Diamond Plan" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name shown to users
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what this plan offers..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="planType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select plan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="subscription">Subscription</SelectItem>
                                <SelectItem value="mentorship">Mentorship</SelectItem>
                                <SelectItem value="script">Script</SelectItem>
                                <SelectItem value="addon">Add-on</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="diamond">Diamond</SelectItem>
                                <SelectItem value="infinity">Infinity</SelectItem>
                                <SelectItem value="ultimate">Ultimate</SelectItem>
                                <SelectItem value="script">Script</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Configuration</CardTitle>
                    <CardDescription>
                      Set up pricing options for this plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Monthly Pricing */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Monthly Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricing.monthly.price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pricing.monthly.originalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Price (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Annual Pricing */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Annual Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricing.annual.price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pricing.annual.originalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Price (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* One-time Pricing */}
                    <div className="space-y-3">
                      <h4 className="font-medium">One-time Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricing.oneTime.price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>One-time Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pricing.oneTime.memberPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Member Price (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Features</CardTitle>
                    <CardDescription>
                      Add and manage the features included in this plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature..."
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {watchedFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...watchedFeatures];
                              newFeatures[index] = e.target.value;
                              form.setValue('features', newFeatures);
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Tags */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Tags</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {watchedTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Settings</CardTitle>
                    <CardDescription>
                      Configure display and behavior settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* UI Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        UI Configuration
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="ui.icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., crown, star, diamond" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ui.gradient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gradient</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {gradientOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="ui.color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color Theme</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      {color.charAt(0).toUpperCase() + color.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ui.badgeText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Badge Text</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Popular, New" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ui.badgeColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Badge Color</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      {color.charAt(0).toUpperCase() + color.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Status Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Status Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>Plan is available for purchase</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isPopular"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Popular</FormLabel>
                                  <FormDescription>Mark as popular choice</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="isRecommended"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Recommended</FormLabel>
                                  <FormDescription>Show as recommended option</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Featured</FormLabel>
                                  <FormDescription>Highlight in featured section</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Numeric Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sort Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accessLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Level</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormDescription>1-10, higher = more access</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;