import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`items?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('items', data)
    },
    show(id: number) {
        return http.get(`items/${id}`)
    },
    delete(id: number) {
        return http.delete(`items/${id}`)
    }
}
