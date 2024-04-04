import http from '@/http'

const endpoint = 'addresses'

export default {
    index() {
        return http.get(`${endpoint}`)
    },
    store() {
        return http.post(`${endpoint}`)
    }
}