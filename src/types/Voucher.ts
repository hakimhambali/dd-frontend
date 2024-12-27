export default interface Voucher {
    id: number;
    name: string;
    description?: string; 
    min_price?: number;
    is_percentage_flatprice: boolean;
    discount_value: number;
    expired_time?: number;
    max_claim?: number;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    deleted_at: Date;
}