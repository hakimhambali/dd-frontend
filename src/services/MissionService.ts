import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`missions?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('missions', data)
    },
    show(id: number) {
        return http.get(`missions/${id}`)
    },
    delete(id: number) {
        return http.delete(`missions/${id}`)
    }
}
