"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "@/lib/types/billing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Mail, FileText } from "lucide-react";

interface ViewReceiptDialogProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResendReceipt?: (receipt: Receipt) => void;
}

export function ViewReceiptDialog({
  receipt,
  open,
  onOpenChange,
  onResendReceipt,
}: ViewReceiptDialogProps) {
  if (!receipt) return null;

  const handleResend = () => {
    if (onResendReceipt) {
      onResendReceipt(receipt);
    }
  };

  const handleDownload = () => {
    // TODO: Implement receipt PDF download
    console.log("Download receipt:", receipt.receiptNumber);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Details
          </DialogTitle>
          <DialogDescription>
            Receipt #{receipt.receiptNumber} - {formatDate(receipt.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Receipt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Receipt Number:
                  </span>
                  <span className="text-sm font-medium">
                    {receipt.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm">
                    {formatDate(receipt.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Date:
                  </span>
                  <span className="text-sm">
                    {formatDate(receipt.paymentDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {receipt.status?.toLowerCase() || "Completed"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Method:
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {receipt.paymentMethod.toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">
                    {typeof receipt.customerId === "string"
                      ? receipt.customerName || "N/A"
                      : `${receipt.customerId.firstName} ${receipt.customerId.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">
                    {typeof receipt.customerId === "string"
                      ? receipt.customerEmail || "N/A"
                      : receipt.customerId.email}
                  </span>
                </div>
                {receipt.invoiceId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Invoice ID:
                    </span>
                    <span className="text-sm font-mono">
                      {receipt.invoiceId}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction ID:
                </span>
                <span className="text-sm font-mono">
                  {receipt.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Currency:</span>
                <span className="text-sm font-medium">{receipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Method:
                </span>
                <Badge variant="outline" className="capitalize">
                  {receipt.paymentMethod.toLowerCase().replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-medium text-lg">
                <span>Total Amount:</span>
                <span>{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Paid on {formatDate(receipt.paymentDate)} via{" "}
                {receipt.paymentMethod.toLowerCase().replace("_", " ")}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleResend}>
              <Mail className="mr-2 h-4 w-4" />
              Resend Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
