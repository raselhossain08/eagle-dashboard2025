export interface Order {
    id: number;
    order_number: string;
    status: 'processing' | 'completed' | 'failed' | 'pending' | 'on-hold' | 'cancelled';
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    date_created: string;
    total: string;
    currency: string;
    payment_method: string;
    payment_method_title: string;
    billing_address: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    shipping_address: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        phone: string;
    };
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    price: string;
    total: string;
    sku: string;
}

export interface OrdersData {
    orders: Order[];
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: OrdersData;
    timeframe: string;
    generated_at: string;
}
