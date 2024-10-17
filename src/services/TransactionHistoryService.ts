import useObjectToQueryStringConverter from '@/composables/object-to-url-string'
import http from '@/http'

export default {
    index(query: Object) {
        return http.get(`transactionHistories?${useObjectToQueryStringConverter(query)}`)
    }
}
