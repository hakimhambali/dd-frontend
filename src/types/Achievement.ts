export default interface Achievement {
    id: number;
    name: string;
    description?: string; 
    max_score: number;
    reward_type?: string; 
    reward_value: number;
    is_active: boolean;
}