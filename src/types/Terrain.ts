export default interface Terrain {
    id: number;
    name: string;
    description?: string; 
    is_default: boolean;
    is_active: boolean;
}