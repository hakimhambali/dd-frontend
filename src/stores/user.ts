// stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  id: number | null
  email: string | null
  fullName: string | null
  role: string | null
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    email: null,
    fullName: null,
    role: null,
  }),
  actions: {
    reset() {
      this.$patch({
        id: null,
        email: null,
        fullName: null,
        role: null,
      })
    }
  },
  persist: true,
})

export default useUserStore