import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`missions?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('missions', data)
    },
    update(id: number, data: object) {
        return http.put(`missions/${id}`, data)
    },
    delete(id: number) {
        return http.delete(`missions/${id}`)
    },
    permanentDelete(id:number) {
        return http.delete(`missions/permanentDestroy/${id}`)
    },
    restore(id:number) {
        return http.patch(`missions/restore/${id}`)
    }
}
