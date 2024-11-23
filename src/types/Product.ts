export default interface Product {
    id: number
    code: string
    name: string
    price_real: number
    price_game: number
    price_game_type: string
    description: string
    is_active: boolean
    product_type: string
    items: { code: string; item_id: number; count: number }[];
    skin: { skin_type: string };
}
