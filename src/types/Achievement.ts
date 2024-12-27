import type Product from './Product'
export default interface Achievement {
    id: number;
    name: string;
    description?: string; 
    max_score: number;
    reward_type?: string; 
    reward_value: number;
    is_active: boolean;
    product_rewarded: Product | null;
    product_rewarded_id?: number | null;
    deleted_at: Date;
}