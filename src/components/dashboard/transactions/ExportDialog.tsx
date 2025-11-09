// components/transactions/ExportDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { transactionService } from '@/lib/services/transactio.service';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters?: any;
}

const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', icon: FileCode, description: 'Raw data format' },
];

const availableFields = [
    { id: 'transactionId', label: 'Transaction ID', checked: true },
    { id: 'type', label: 'Type', checked: true },
    { id: 'status', label: 'Status', checked: true },
    { id: 'amount', label: 'Amount', checked: true },
    { id: 'currency', label: 'Currency', checked: true },
    { id: 'customer', label: 'Customer', checked: true },
    { id: 'provider', label: 'Provider', checked: true },
    { id: 'createdAt', label: 'Created Date', checked: true },
    { id: 'paymentMethod', label: 'Payment Method', checked: false },
    { id: 'description', label: 'Description', checked: false },
    { id: 'fees', label: 'Fees', checked: false },
    { id: 'netAmount', label: 'Net Amount', checked: false },
];

export function ExportDialog({ open, onOpenChange, filters }: ExportDialogProps) {
    const [format, setFormat] = useState('csv');
    const [fields, setFields] = useState<string[]>(
        availableFields.filter(f => f.checked).map(f => f.id)
    );
    const [loading, setLoading] = useState(false);

    const handleFieldToggle = (fieldId: string, checked: boolean) => {
        if (checked) {
            setFields([...fields, fieldId]);
        } else {
            setFields(fields.filter(id => id !== fieldId));
        }
    };

    const handleExport = async () => {
        if (fields.length === 0) {
            toast.error('Please select at least one field to export');
            return;
        }

        setLoading(true);
        try {
            const response = await transactionService.getAllTransactions({
                ...filters,
                page: 1,
                limit: 10000,
            });

            const transactions = response.transactions;

            if (transactions.length === 0) {
                toast.error('No transactions to export');
                setLoading(false);
                return;
            }

            const formattedData = transactions.map((transaction: any) => {
                const row: any = {};

                fields.forEach(field => {
                    switch (field) {
                        case 'transactionId':
                            row['Transaction ID'] = transaction.transactionId;
                            break;
                        case 'type':
                            row['Type'] = transaction.type;
                            break;
                        case 'status':
                            row['Status'] = transaction.status;
                            break;
                        case 'amount':
                            row['Amount'] = transaction.amount.gross;
                            break;
                        case 'currency':
                            row['Currency'] = transaction.currency;
                            break;
                        case 'customer':
                            row['Customer'] = transaction.billing?.email || transaction.billing?.name || 'N/A';
                            break;
                        case 'provider':
                            row['Provider'] = transaction.psp.provider;
                            break;
                        case 'createdAt':
                            row['Created Date'] = new Date(transaction.timeline.initiatedAt).toLocaleString();
                            break;
                        case 'paymentMethod':
                            row['Payment Method'] = transaction.paymentMethod?.type || 'N/A';
                            break;
                        case 'description':
                            row['Description'] = transaction.description || '';
                            break;
                        case 'fees':
                            row['Fees'] = transaction.amount.fee;
                            break;
                        case 'netAmount':
                            row['Net Amount'] = transaction.amount.net;
                            break;
                    }
                });

                return row;
            });

            if (format === 'csv') {
                exportToCSV(formattedData);
            } else if (format === 'excel') {
                exportToExcel(formattedData);
            } else if (format === 'json') {
                exportToJSON(formattedData);
            }

            toast.success(`Exported ${transactions.length} transactions successfully`);
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to export transactions');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data: any[]) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        downloadFile(csvContent, `transactions-${Date.now()}.csv`, 'text/csv');
    };

    const exportToExcel = (data: any[]) => {
        exportToCSV(data);
        toast.info('Excel export uses CSV format. For true Excel, integrate xlsx library.');
    };

    const exportToJSON = (data: any[]) => {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, `transactions-${Date.now()}.json`, 'application/json');
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Export Transactions</DialogTitle>
                    <DialogDescription>
                        Choose format and fields to export your transaction data
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <RadioGroup value={format} onValueChange={setFormat}>
                            <div className="grid grid-cols-3 gap-3">
                                {exportFormats.map((fmt) => {
                                    const Icon = fmt.icon;
                                    return (
                                        <div
                                            key={fmt.value}
                                            className={`relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 ${format === fmt.value ? 'border-primary bg-muted/50' : ''
                                                }`}
                                            onClick={() => setFormat(fmt.value)}
                                        >
                                            <RadioGroupItem value={fmt.value} id={fmt.value} className="mt-1" />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <Label htmlFor={fmt.value} className="font-medium cursor-pointer">
                                                        {fmt.label}
                                                    </Label>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{fmt.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Fields to Export</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFields(availableFields.map(f => f.id))}
                                >
                                    Select All
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFields([])}
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg max-h-64 overflow-y-auto">
                            {availableFields.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={field.id}
                                        checked={fields.includes(field.id)}
                                        onCheckedChange={(checked) =>
                                            handleFieldToggle(field.id, checked as boolean)
                                        }
                                    />
                                    <Label
                                        htmlFor={field.id}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {fields.length} field{fields.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={loading || fields.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Exporting...' : 'Export'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}