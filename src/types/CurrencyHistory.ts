import type GameUser from './GameUser'

export default interface Skin {
    id: number
    game_user_id: string
    amount: number
    currency_type: string
    description: string
    game_user: GameUser
}