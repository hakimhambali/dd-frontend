import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`admin/users?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('admin/users', data)
    },
    show(id: number) {
        return http.get(`admin/users/${id}`)
    },
    delete(id: number) {
        return http.delete(`admin/users/${id}`)
    }
}
