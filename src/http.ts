import useIsAuthStore from '@/stores/auth'
import axios, { type AxiosInstance } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'vue-router'

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json'
    },
})

// axiosInstance.interceptors.request.use(
//     request => {
//         const { token } = useTokenStore()
//         if (token) {
//             request.headers.Authorization = `Bearer ${token}`
//         }
//         return request
//     },
//     error => {
//         if (error.response) {
//             if (error.response.status === StatusCodes.UNAUTHORIZED) {
//                 const router = useRouter()
//                 router.push({ name: 'login' })
//             }
//         }
//         return Promise.reject(error)
//     }
// )

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === StatusCodes.UNAUTHORIZED) {
            const { isLoggedIn, revokeUser } = useIsAuthStore()

            if (isLoggedIn) {
                revokeUser()
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance