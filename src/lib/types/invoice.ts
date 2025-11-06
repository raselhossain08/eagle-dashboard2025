export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface Subscription {
    _id: string;
    planName: string;
    status: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    userId: User | string;
    subscriptionId?: string | Subscription;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    taxRate?: number;
    total: number;
    status: 'pending' | 'paid' | 'overdue' | 'refunded' | 'partially_refunded';
    paymentMethod?: string;
    transactionId?: string;
    dueDate: string;
    paidAt?: string;
    notes?: string;
    pdfUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceResponse {
    success: boolean;
    data: Invoice[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateInvoiceRequest {
    userId: string;
    subscriptionId?: string;
    items: InvoiceItem[];
    dueDate: string;
    notes?: string;
}

export interface RefundRequest {
    amount: number;
    reason: string;
}

export interface RefundResponse {
    success: boolean;
    message: string;
    data: {
        invoiceId: string;
        refundAmount: number;
        refundReason: string;
        refundId: string;
        refundedAt: string;
        status: string;
        originalAmount: number;
        remainingBalance: number;
    };
}

export interface EmailRequest {
    recipient: string;
    subject: string;
    message: string;
}

export interface ExportFilters {
    format: 'csv' | 'json';
    start_date: string;
    end_date: string;
    include_invoices?: boolean;
    include_payments?: boolean;
    include_refunds?: boolean;
}