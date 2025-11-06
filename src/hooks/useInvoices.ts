import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/lib/services/invoice.service';
import { CreateInvoiceRequest, RefundRequest, EmailRequest, ExportFilters } from '@/types/invoice';
import { toast } from 'sonner';

export const useInvoices = (params?: any) => {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => invoiceService.getInvoices(params),
    });
};

export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceService.getInvoice(id),
        enabled: !!id,
    });
};

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInvoiceRequest) => invoiceService.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        },
    });
};

export const useProcessRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ invoiceId, data }: { invoiceId: string; data: RefundRequest }) =>
            invoiceService.processRefund(invoiceId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Refund processed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to process refund');
        },
    });
};

export const useSendEmail = () => {
    return useMutation({
        mutationFn: ({ invoiceId, data }: { invoiceId: string; data: EmailRequest }) =>
            invoiceService.sendEmail(invoiceId, data),
        onSuccess: () => {
            toast.success('Email sent successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to send email');
        },
    });
};

export const useExportFinancials = () => {
    return useMutation({
        mutationFn: (filters: ExportFilters) => invoiceService.exportFinancials(filters),
        onSuccess: (data: any) => {
            toast.success('Export completed successfully');
            // Trigger download
            const blob = new Blob([JSON.stringify(data.data)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `financial-export-${new Date().toISOString()}.json`;
            link.click();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to export data');
        },
    });
};