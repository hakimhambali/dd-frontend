import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`admin/users?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('admin/users', data)
    },
    update(id: number, data: object) {
        return http.put(`admin/users/${id}`, data)
    },   
    delete(id: number) {
        return http.delete(`admin/users/${id}`)
    },

    getMyProfile() {
        return http.get('profiles/get-my-profile')
    }
}
