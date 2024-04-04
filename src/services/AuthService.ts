import http from '@/http'
import type Login from '@/types/Login'

export default {
    getCsrfCookie() {
        return http.get('get-csrf-cookie');
    },
    login(data: Login) {
        return http.post('login', data);
    },
    logout() {
        return http.post('logout')
    },
}
