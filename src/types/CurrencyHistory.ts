import type GameUser from './GameUser'

export default interface CurrencyHistory {
    id: number
    game_user_id: number
    amount: number
    currency_type: string
    description: string
    game_user: GameUser
}