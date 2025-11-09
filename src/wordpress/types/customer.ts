export interface Customer {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    display_name?: string;
    username?: string;
    email: string;
    phone: string;
    total_orders: number;
    order_count?: number;
    total_spent: string;
    average_order_value: string;
    last_order_date: string | null;
    date_created: string;
    registered_date?: string;
    status: 'active' | 'inactive';
    roles?: string[];
    billing_address?: {
        first_name?: string;
        last_name?: string;
        company?: string;
        address_1?: string;
        address_2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
        phone?: string;
    };
}
export interface CustomerSummary {
    total_customers: number;
    active_customers: number;
    new_customers_this_month: number;
    total_revenue: string;
    average_customer_value: string;
}

export interface CustomerPagination {
    page: number;
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
}

export interface CustomersData {
    customers: Customer[];
    summary: CustomerSummary;
    pagination: CustomerPagination;
}

export interface CustomersResponse {
    success: boolean;
    message: string;
    data: CustomersData;
    timeframe: string;
    generated_at: string;
}
