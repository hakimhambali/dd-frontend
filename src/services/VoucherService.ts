import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`vouchers?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('vouchers', data)
    },
    show(id: number) {
        return http.get(`vouchers/${id}`)
    },
    delete(id: number) {
        return http.delete(`vouchers/${id}`)
    }
}
