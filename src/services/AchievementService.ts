import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`achievements?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('achievements', data)
    },
    update(id: number, data: object) {
        return http.put(`achievements/${id}`, data)
    },
    delete(id: number) {
        return http.delete(`achievements/${id}`)
    }
}
