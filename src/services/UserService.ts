import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`users?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('users', data)
    },
    show(id: number) {
        return http.get(`users/${id}`)
    },
    delete(id: number) {
        return http.delete(`users/${id}`)
    }
}
