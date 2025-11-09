import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Customer } from "@/wordpress/types/customer";
import { customerService } from "@/wordpress/services/customerService";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  Building,
} from "lucide-react";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  if (!customer) return null;

  const status = customerService.getCustomerStatus(customer);
  const hasBillingAddress = !!(
    customer.billing_address?.first_name || customer.billing_address?.address_1
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {customer.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Display Name
                </label>
                <p className="text-sm">{customer.display_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Username
                </label>
                <p className="text-sm">@{customer.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Registered
                </label>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {customerService.formatDateTime(customer.registered_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Roles
                </label>
                <div className="flex gap-1 flex-wrap">
                  {customer.roles?.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground">
                      No roles
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Order Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{customer.order_count}</div>
                <div className="text-sm text-muted-foreground">
                  Total Orders
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  {customerService.formatCurrency(customer.total_spent)}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold">
                  {customerService.formatDate(customer.last_order_date)}
                </div>
                <div className="text-sm text-muted-foreground">Last Order</div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {hasBillingAddress && (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                {customer.billing_address?.first_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm">
                      {customer.billing_address?.first_name}{" "}
                      {customer.billing_address?.last_name}
                    </p>
                  </div>
                )}
                {customer.billing_address?.company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Company
                    </label>
                    <p className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {customer.billing_address?.company}
                    </p>
                  </div>
                )}
                {customer.billing_address?.address_1 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">
                      {customer.billing_address?.address_1}
                    </p>
                  </div>
                )}
                {(customer.billing_address?.city ||
                  customer.billing_address?.state) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      City/State
                    </label>
                    <p className="text-sm">
                      {customer.billing_address?.city}
                      {customer.billing_address?.city &&
                      customer.billing_address?.state
                        ? ", "
                        : ""}
                      {customer.billing_address?.state}
                    </p>
                  </div>
                )}
                {customer.billing_address?.country && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <p className="text-sm">
                      {customer.billing_address?.country}
                    </p>
                  </div>
                )}
                {customer.billing_address?.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {customer.billing_address?.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              View Orders
            </Button>
            <Button variant="outline" className="flex-1">
              Edit Profile
            </Button>
            <Button className="flex-1">Send Email</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
