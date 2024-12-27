import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`currencies?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('currencies', data)
    },
    update(id: number, data: object) {
        return http.put(`currencies/${id}`, data)
    },    
    delete(id: number) {
        return http.delete(`currencies/${id}`)
    }
}
