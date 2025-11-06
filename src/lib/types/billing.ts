// Billing Types
export interface TaxRate {
    _id: string;
    name: string;
    description?: string;
    country: string;
    state: string;
    taxType: 'SALES_TAX' | 'VAT' | 'GST' | 'WITHHOLDING' | 'EXCISE' | 'OTHER';
    rate: number;
    active: boolean;
    effectiveFrom?: string;
    effectiveTo?: string;
    applicableToProducts?: string[];
    customerTypes?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    customerId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    customerName: string;
    customerEmail: string;
    status: 'draft' | 'pending' | 'paid' | 'void' | 'overdue';
    currency: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    dueDate: string;
    paidDate?: string;
    items: InvoiceItem[];
    notes?: string;
    paymentMethod?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxRate?: number;
}

export interface Receipt {
    _id: string;
    receiptNumber: string;
    customerId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    customerName: string;
    customerEmail: string;
    invoiceId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    status: string;
    paymentDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaxCalculationRequest {
    amount: number;
    country: string;
    state?: string;
    city?: string;
    taxType?: string;
    productType?: string;
    customerType?: string;
    date?: string;
}

export interface TaxCalculationResponse {
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    taxBreakdown: TaxBreakdownItem[];
    appliedTaxRates: AppliedTaxRate[];
}

export interface TaxBreakdownItem {
    name: string;
    rate: number;
    amount: number;
    jurisdiction: string;
}

export interface AppliedTaxRate {
    id: string;
    name: string;
    rate: number;
    amount: number;
}

export interface BillingDashboard {
    summary: {
        totalRevenue: number;
        totalInvoices: number;
        paidInvoices: number;
        pendingInvoices: number;
        overdueInvoices: number;
        totalTaxCollected: number;
    };
    recentInvoices: Invoice[];
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        taxCollected: number;
    }>;
    topCustomers: Array<{
        customerId: string;
        customerName: string;
        totalSpent: number;
    }>;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    enabled: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
