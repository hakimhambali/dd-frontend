import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`gameusers?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('gameusers', data)
    },
    update(id: number, data: object) {
        return http.put(`gameusers/${id}`, data)
    },
    delete(id: number) {
        return http.delete(`gameusers/${id}`)
    },
    permanentDelete(id:number) {
        return http.delete(`gameusers/permanentDestroy/${id}`)
    },
    restore(id:number) {
        return http.patch(`gameusers/restore/${id}`)
    }
}
