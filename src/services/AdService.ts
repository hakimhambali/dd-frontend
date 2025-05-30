import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`ads?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('ads', data)
    },
    update(id: number, data: object) {
        return http.put(`ads/${id}`, data)
    },    
    delete(id: number) {
        return http.delete(`ads/${id}`)
    },
    permanentDelete(id:number) {
        return http.delete(`ads/permanentDestroy/${id}`)
    },
    restore(id:number) {
        return http.patch(`ads/restore/${id}`)
    }
}
