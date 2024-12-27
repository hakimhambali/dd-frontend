import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`terrains?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('terrains', data)
    },
    update(id: number, data: object) {
        return http.put(`terrains/${id}`, data)
    },    
    delete(id: number) {
        return http.delete(`terrains/${id}`)
    },
    permanentDelete(id:number) {
        return http.delete(`terrains/permanentDestroy/${id}`)
    },
    restore(id:number) {
        return http.patch(`terrains/restore/${id}`)
    }
}
