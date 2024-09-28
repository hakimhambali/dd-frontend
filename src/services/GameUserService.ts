import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`gameusers?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('gameusers', data)
    },
    show(id: number) {
        return http.get(`gameusers/${id}`)
    },
    delete(id: number) {
        return http.delete(`gameusers/${id}`)
    }
}
