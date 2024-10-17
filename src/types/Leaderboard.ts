import type GameUser from './GameUser'

export default interface Leaderboard {
    id: number
    game_user_id: string
    score: number
    game_user: GameUser
}