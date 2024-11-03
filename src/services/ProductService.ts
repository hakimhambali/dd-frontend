import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`products?${useObjectToQueryStringConverter(query)}`)
    },
    store(data: object) {
        return http.post('products', data)
    },
    update(id: number, data: object) {
        return http.put(`products/${id}`, data)
    },
    delete(id: number) {
        return http.delete(`products/${id}`)
    },
    getItems() {
        return http.get(`products/items`)
    },    
    getProducts() {
        return http.get(`products/products`)
    },    
}
