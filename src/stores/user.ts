import { defineStore } from 'pinia'

interface UserState {
    id: string | null
    name: string | null
    email: string | null
}

const useUserStore = defineStore('user', {
    state: (): UserState => ({
        id: null,
        name: null,
        email: null,
    }),
    persist: true,
})

export default useUserStore
