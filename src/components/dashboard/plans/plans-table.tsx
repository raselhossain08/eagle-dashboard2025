
import React from 'react';
import {
  MoreHorizontal,
  Edit3,
  Copy,
  Star,
  TrendingUp,
  Archive,
  Trash2,
  Eye,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plan } from '@/services/plans';
import { formatCurrency } from '@/lib/utils';

interface PlansTableProps {
  plans: Plan[];
  loading: boolean;
  onEdit: (plan: Plan) => void;
  onQuickEdit: (plan: Plan) => void;
  onView: (plan: Plan) => void;
  onDuplicate: (plan: Plan) => void;
  onToggleFeatured: (plan: Plan) => void;
  onTogglePopular: (plan: Plan) => void;
  onToggleArchive: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

const PlansTable: React.FC<PlansTableProps> = ({
  plans,
  loading,
  onEdit,
  onQuickEdit,
  onView,
  onDuplicate,
  onToggleFeatured,
  onTogglePopular,
  onToggleArchive,
  onDelete,
}) => {
  const getPlanTypeColor = (type: string) => {
    const colors = {
      subscription: 'bg-blue-100 text-blue-800',
      mentorship: 'bg-purple-100 text-purple-800',
      script: 'bg-green-100 text-green-800',
      addon: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      basic: 'bg-slate-100 text-slate-800',
      diamond: 'bg-blue-100 text-blue-800',
      infinity: 'bg-purple-100 text-purple-800',
      ultimate: 'bg-gold-100 text-gold-800',
      script: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrimaryPrice = (plan: Plan) => {
    // Safe access to pricing object
    if (!plan.pricing) return 'Free';
    
    if (plan.pricing.monthly?.price) {
      return formatCurrency(plan.pricing.monthly.price);
    }
    if (plan.pricing.annual?.price) {
      return formatCurrency(plan.pricing.annual.price);
    }
    if (plan.pricing.oneTime?.price) {
      return formatCurrency(plan.pricing.oneTime.price);
    }
    return 'Free';
  };

  const getPriceType = (plan: Plan) => {
    // Safe access to pricing object
    if (!plan.pricing) return '';
    
    if (plan.pricing.monthly) return '/month';
    if (plan.pricing.annual) return '/year';
    if (plan.pricing.oneTime) return 'one-time';
    return '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No plans found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No plans match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans List</CardTitle>
        <CardDescription>
          Manage your subscription plans, mentorship packages, and scripts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Details</TableHead>
              <TableHead>Type & Category</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Analytics</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{plan.displayName}</div>
                      {plan.isPopular && (
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      )}
                      {plan.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {plan.features?.length || 0} feature{(plan.features?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getPlanTypeColor(plan.planType)}>
                      {plan.planType}
                    </Badge>
                    <div>
                      <Badge variant="outline" className={getCategoryColor(plan.category)}>
                        {plan.category}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {getPrimaryPrice(plan)}
                      <span className="text-sm text-muted-foreground">
                        {getPriceType(plan)}
                      </span>
                    </div>
                    {plan.pricing?.monthly && plan.pricing?.annual && (
                      <div className="text-xs text-muted-foreground">
                        Multiple pricing options
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {plan.ui?.badgeText && (
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {plan.ui.badgeText}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {plan.analytics?.totalSubscribers || 0} subscriber{(plan.analytics?.totalSubscribers || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(plan.analytics?.totalRevenue || 0)} revenue
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((plan.analytics?.conversionRate || 0) * 100).toFixed(1)}% conversion
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(plan)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(plan)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onQuickEdit(plan)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Quick Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(plan)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleFeatured(plan)}>
                        <Star className="mr-2 h-4 w-4" />
                        {plan.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTogglePopular(plan)}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {plan.isPopular ? 'Remove from Popular' : 'Mark as Popular'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleArchive(plan)}>
                        <Archive className="mr-2 h-4 w-4" />
                        {plan.isActive ? 'Archive Plan' : 'Restore Plan'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(plan)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlansTable;