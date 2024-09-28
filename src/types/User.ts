import type Profile from './Profile'

export default interface User {
    id: number
    email: string
    role: string
    profile: Profile
}
