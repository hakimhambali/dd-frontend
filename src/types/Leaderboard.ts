import type GameUser from './GameUser'

export default interface Skin {
    id: number
    game_user_id: string
    score: number
    game_user: GameUser
}