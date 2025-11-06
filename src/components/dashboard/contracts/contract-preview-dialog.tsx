import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Mail, Phone, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

interface ContractPreviewDialogProps {
    contract: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ContractPreviewDialog: React.FC<ContractPreviewDialogProps> = ({
    contract,
    open,
    onOpenChange,
}) => {
    if (!contract) return null;

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            pending_review: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            payment_pending: 'bg-yellow-100 text-yellow-800',
            expired: 'bg-red-100 text-red-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[75vw] sm:max-w-[75vw] lg:max-w-6xl xl:max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl lg:text-3xl">Contract Preview</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        View detailed information about this contract
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 mt-4">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold wrap-break-word">{contract.contractTitle || 'Untitled Contract'}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground break-all">ID: {contract._id}</p>
                        </div>
                        <Badge className={`${getStatusColor(contract.status)} text-xs sm:text-sm whitespace-nowrap`}>
                            {contract.status?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            Customer Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Name</p>
                                <p className="font-medium break-all">{contract.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Email</p>
                                <p className="font-medium flex items-center gap-1 break-all">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="break-all">{contract.email || 'N/A'}</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Phone</p>
                                <p className="font-medium flex items-center gap-1">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    {contract.phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Discord</p>
                                <p className="font-medium break-all">{contract.discordUsername || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Address Information */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                            Address
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Street Address</p>
                                <p className="font-medium break-all">{contract.streetAddress || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Flat/Suite/Unit</p>
                                <p className="font-medium">{contract.flatSuiteUnit || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Town/City</p>
                                <p className="font-medium">{contract.townCity || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">State/County</p>
                                <p className="font-medium">{contract.stateCounty || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Postcode/ZIP</p>
                                <p className="font-medium">{contract.postcodeZip || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Country</p>
                                <p className="font-medium">{contract.country || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Subscription Details */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            Subscription Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Product Type</p>
                                <p className="font-medium capitalize break-all">{contract.productType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Subscription Type</p>
                                <p className="font-medium capitalize">{contract.subscriptionType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Price</p>
                                <p className="font-medium flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 shrink-0" />
                                    {contract.subscriptionPrice ? `$${contract.subscriptionPrice}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Auto Renew</p>
                                <p className="font-medium">
                                    {contract.autoRenew ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Yes
                                        </span>
                                    ) : (
                                        <span className="text-red-600">No</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                            Important Dates
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Created At</p>
                                <p className="font-medium break-all">
                                    {contract.createdAt ? new Date(contract.createdAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Signed Date</p>
                                <p className="font-medium break-all">
                                    {contract.signedDate ? new Date(contract.signedDate).toLocaleString() : 'Not signed'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Subscription Start</p>
                                <p className="font-medium break-all">
                                    {contract.subscriptionStartDate ? new Date(contract.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Subscription End</p>
                                <p className="font-medium break-all">
                                    {contract.subscriptionEndDate ? new Date(contract.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Information */}
                    {contract.paymentProvider && (
                        <>
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Payment Provider</p>
                                        <p className="font-medium capitalize">{contract.paymentProvider || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Payment ID</p>
                                        <p className="font-medium text-xs break-all">{contract.paymentId || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Signature */}
                    {contract.signature && (
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                Signature
                            </h4>
                            <div className="border rounded-lg p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
                                <img
                                    src={contract.signature}
                                    alt="Signature"
                                    className="max-h-24 sm:max-h-32 lg:max-h-40 mx-auto object-contain w-full"
                                />
                            </div>
                            <div className="mt-2 text-xs sm:text-sm text-muted-foreground space-y-1">
                                <p className="break-all"><span className="font-medium">IP Address:</span> {contract.ipAddress || 'N/A'}</p>
                                <p className="break-all"><span className="font-medium">User Agent:</span> {contract.userAgent || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    {(contract.pdfStorageProvider || contract.pdfGenerationMethod || contract.isGuestContract !== undefined) && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-3 text-sm sm:text-base">Additional Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    {contract.pdfStorageProvider && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">PDF Storage</p>
                                            <p className="font-medium capitalize">{contract.pdfStorageProvider}</p>
                                        </div>
                                    )}
                                    {contract.pdfGenerationMethod && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">PDF Generation</p>
                                            <p className="font-medium capitalize">{contract.pdfGenerationMethod}</p>
                                        </div>
                                    )}
                                    {contract.isGuestContract !== undefined && (
                                        <div>
                                            <p className="text-muted-foreground mb-1">Guest Contract</p>
                                            <p className="font-medium">{contract.isGuestContract ? 'Yes' : 'No'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContractPreviewDialog;
