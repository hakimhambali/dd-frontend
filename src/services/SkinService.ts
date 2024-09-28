import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`skins?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('skins', data)
    },
    show(id: number) {
        return http.get(`skins/${id}`)
    },
    delete(id: number) {
        return http.delete(`skins/${id}`)
    }
}
