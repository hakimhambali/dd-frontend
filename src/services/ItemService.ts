import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`items?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('items', data)
    },
    update(id: number, data: object) {
        return http.put(`items/${id}`, data)
    },
    delete(id: number) {
        return http.delete(`items/${id}`)
    }
}
