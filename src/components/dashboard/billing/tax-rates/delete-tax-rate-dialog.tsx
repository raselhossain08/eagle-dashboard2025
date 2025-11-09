import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { billingService } from "@/lib/services/billing.service";
import { TaxRate } from "@/types/billing";
import { Loader2 } from "lucide-react";

interface DeleteTaxRateDialogProps {
  taxRate: TaxRate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaxRateDeleted: () => void;
}

export function DeleteTaxRateDialog({
  taxRate,
  open,
  onOpenChange,
  onTaxRateDeleted,
}: DeleteTaxRateDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!taxRate) return;

    try {
      setDeleting(true);
      await billingService.deleteTaxRate(taxRate._id);
      onTaxRateDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete tax rate:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!taxRate) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate the tax rate &quot;
            {taxRate.name}&quot;? This action cannot be undone and will affect
            future tax calculations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Tax Rate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
