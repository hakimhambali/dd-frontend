import { defineStore } from 'pinia'
import { ref } from 'vue'

const useIsAuthStore = defineStore(
    'isLoggedIn',
    () => {
        const isLoggedIn = ref<boolean>(false)

        const authUser = () => isLoggedIn.value = true
        const revokeUser = () => isLoggedIn.value = false

        return { isLoggedIn, authUser, revokeUser }
    },
    {
        persist: true,
    }
)

export default useIsAuthStore
