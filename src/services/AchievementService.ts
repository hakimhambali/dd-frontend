import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`achievements?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('achievements', data)
    },
    show(id: number) {
        return http.get(`achievements/${id}`)
    },
    delete(id: number) {
        return http.delete(`achievements/${id}`)
    }
}
