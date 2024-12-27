export default interface GameUser {
    id: number
    email: string
    username: string
    gem_amount: number
    gold_amount: number
    date_of_birth: Date;
    country: string
    platform: string
    register_date: Date
    total_play_time: number
    is_active: boolean
    highest_score: number
    last_login: Date
    deleted_at: Date
}
