import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`vouchers?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('vouchers', data)
    },
    update(id: number, data: object) {
        return http.put(`vouchers/${id}`, data)
    },   
    delete(id: number) {
        return http.delete(`vouchers/${id}`)
    },
    permanentDelete(id:number) {
        return http.delete(`vouchers/permanentDestroy/${id}`)
    },
    restore(id:number) {
        return http.patch(`vouchers/restore/${id}`)
    }
}
