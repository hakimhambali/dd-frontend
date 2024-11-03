import type GameUser from './GameUser'
import type Product from './Product'
import type Voucher from './Voucher'

export default interface TransactionHistory {
    id: number
    product_id: number
    game_user_id: number
    voucher_earned_id: number
    voucher_used_id: number
    paid_real_price: number
    game_price_type: string
    paid_game_price: number
    platform: string
    transaction_date: string
    game_user: GameUser
    product: Product
    voucher_earned: Voucher
    voucher_used: Voucher
}