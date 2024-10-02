import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`terrains?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('terrains', data)
    },
    show(id: number) {
        return http.get(`terrains/${id}`)
    },
    delete(id: number) {
        return http.delete(`terrains/${id}`)
    }
}
