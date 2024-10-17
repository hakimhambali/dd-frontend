import type GameUser from './GameUser'
import type Product from './Product'
import type Voucher from './Voucher'

export default interface TransactionHistory {
    id: number
    product_id: number
    game_user_id: number
    voucher_earned_id: number
    voucher_used_id: number
    buy_price: number
    platform: string
    transaction_date: string
    game_user: GameUser
    product: Product
    voucher_earned: Voucher
    voucher_used: Voucher
}