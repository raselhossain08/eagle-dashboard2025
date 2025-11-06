import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { billingService } from '@/lib/services/billing.service';
import { Download, Loader2 } from 'lucide-react';

interface ExportDataDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExportDataDialog({ open, onOpenChange }: ExportDataDialogProps) {
    const [exporting, setExporting] = useState(false);
    const [formData, setFormData] = useState({
        format: 'CSV',
        dataType: 'invoices',
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        currency: 'USD',
        status: 'PAID',
    });

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await billingService.exportData(formData);

            // Create and download the file
            const blob = new Blob([JSON.stringify(response.data, null, 2)], {
                type: 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export-${formData.dataType}-${formData.dateFrom}-to-${formData.dateTo}.${formData.format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to export data:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Data
                    </DialogTitle>
                    <DialogDescription>
                        Export billing data in various formats for analysis
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="format">Format</Label>
                            <Select
                                value={formData.format}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    format: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSV">CSV</SelectItem>
                                    <SelectItem value="JSON">JSON</SelectItem>
                                    <SelectItem value="XLSX">Excel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataType">Data Type</Label>
                            <Select
                                value={formData.dataType}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    dataType: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoices">Invoices</SelectItem>
                                    <SelectItem value="receipts">Receipts</SelectItem>
                                    <SelectItem value="transactions">Transactions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={formData.dateFrom}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    dateFrom: e.target.value
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={formData.dateTo}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    dateTo: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    currency: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    status: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="ALL">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={exporting}>
                            {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Export Data
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}