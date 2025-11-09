import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  Download,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";

interface ContractsTableProps {
  contracts: any[];
  loading: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  selectedContracts?: string[];
  getOperationLoadingState?: (operation: string, contractId: string) => boolean;
  onPageChange?: (page: number) => void;
  onSelectContract?: (contractId: string, selected: boolean) => void;
  onSelectAllContracts?: (selected: boolean) => void;
  onView: (contract: any) => void;
  onEdit?: (contract: any) => void;
  onDownload: (contract: any) => void;
  onSendForSignature?: (contract: any) => void;
  onCancel?: (contract: any) => void;
  onDelete: (contract: any) => void;
  onSignContract?: (
    contract: any,
    partyType: "primary" | "secondary" | "additional",
    partyIndex?: number
  ) => void;
  onViewAuditTrail?: (contract: any) => void;
  onSendReminder?: (
    contract: any,
    partyType: string,
    partyIndex?: number
  ) => void;
}

const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  loading,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  selectedContracts = [],
  getOperationLoadingState,
  onPageChange,
  onSelectContract,
  onSelectAllContracts,
  onView,
  onEdit,
  onDownload,
  onSendForSignature,
  onCancel,
  onDelete,
  onSignContract,
  onViewAuditTrail,
  onSendReminder,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      pending_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      pending_approval: {
        color: "bg-orange-100 text-orange-800",
        icon: AlertCircle,
      },
      approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      sent_for_signature: {
        color: "bg-purple-100 text-purple-800",
        icon: Clock,
      },
      partially_signed: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
      },
      fully_signed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      executed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      expired: { color: "bg-red-100 text-red-800", icon: XCircle },
      terminated: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      disputed: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      payment_pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    // Provide a default config for unknown status values
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status ? status.replace(/_/g, " ") : "Unknown"}
      </Badge>
    );
  };

  const getSignatureStatus = (signatures: any[]) => {
    const primarySigned = signatures.find(
      (s: any) => s.partyType === "primary" && s.signedAt
    );
    const secondarySigned = signatures.find(
      (s: any) => s.partyType === "secondary" && s.signedAt
    );
    const totalSignatures = signatures.filter((s: any) => s.signedAt).length;
    const totalRequired = signatures.length;

    if (primarySigned && secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Fully Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else if (primarySigned || secondarySigned) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Partially Signed ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending ({totalSignatures}/{totalRequired})
          </Badge>
        </div>
      );
    }
  };

  const canEdit = (contract: any) => {
    return contract.status === "draft";
  };

  const canSendForSignature = (contract: any) => {
    return ["draft", "approved"].includes(contract.status);
  };

  const canCancel = (contract: any) => {
    return [
      "sent_for_signature",
      "partially_signed",
      "pending_approval",
    ].includes(contract.status);
  };

  const canDelete = (contract: any) => {
    return ["draft", "cancelled", "terminated"].includes(contract.status);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Contracts Found</CardTitle>
          <CardDescription>
            No contracts match your current filters. Try adjusting your search
            criteria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Contracts</CardTitle>
        <CardDescription>
          {contracts.length} contract{contracts.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectContract && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      contracts.length > 0 &&
                      selectedContracts.length === contracts.length
                    }
                    onCheckedChange={(checked: boolean) =>
                      onSelectAllContracts?.(checked)
                    }
                    aria-label="Select all contracts"
                  />
                </TableHead>
              )}
              <TableHead>Title</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Signatures</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract: any) => (
              <TableRow key={contract._id}>
                {onSelectContract && (
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedContracts.includes(contract._id)}
                      onCheckedChange={(checked: boolean) =>
                        onSelectContract(contract._id, checked)
                      }
                      aria-label={`Select contract ${
                        contract.title || contract._id
                      }`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {contract.contractTitle || contract.title || "Untitled"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #
                      {contract._id?.slice(-8) ||
                        contract.contractNumber ||
                        "N/A"}
                    </span>
                    {contract.subscriptionEndDate && (
                      <span className="text-xs text-muted-foreground">
                        Expires:{" "}
                        {new Date(
                          contract.subscriptionEndDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {contract.productType || "N/A"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {contract.subscriptionType || ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                      {contract.name || "N/A"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {contract.email || ""}
                    </span>
                    {contract.phone && (
                      <span className="text-muted-foreground text-xs mt-1">
                        {contract.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                <TableCell>
                  {contract.signature ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Unsigned
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(contract.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(contract)}
                      title="View Contract"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {contract.signature && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(contract)}
                        title="Download Contract"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    {canDelete(contract) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(contract)}
                        title="Delete Contract"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading &&
          contracts.length > 0 &&
          onPageChange &&
          totalCount > pageSize && (
            <div className="flex items-center justify-between px-2 py-4 border-t">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                contracts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="hidden md:flex"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, Math.ceil(totalCount / pageSize)) },
                    (_, i) => {
                      const totalPages = Math.ceil(totalCount / pageSize);
                      let pageNum: number;

                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => onPageChange(pageNum)}
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPageChange(
                      Math.min(
                        Math.ceil(totalCount / pageSize),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                  className="hidden md:flex"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default ContractsTable;
