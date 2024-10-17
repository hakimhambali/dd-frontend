import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`skins?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('skins', data)
    },
    update(id: number, data: object) {
        return http.put(`skins/${id}`, data)
    },    
    delete(id: number) {
        return http.delete(`skins/${id}`)
    }
}
