import MasterLayout from '@/layouts/MasterLayout.vue'
import DepartmentIndex from '@/pages/departments/DepartmentIndex.vue'
import HomePage from '@/pages/HomePage.vue'
import UserIndex from '@/pages/users/UserIndex.vue'
import UserShow from '@/pages/users/UserShow.vue'
import AuthService from '@/services/AuthService'
import useIsAuthStore from '@/stores/auth'
import {
    createRouter,
    createWebHistory,
    type RouteRecordRaw,
} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
    },
    {
        path: '/',
        name: 'master',
        component: MasterLayout,
        children: [
            {
                path: '/',
                name: 'home-page',
                component: HomePage
            },
            {
                path: '/users',
                name: 'users-index',
                component: UserIndex,
                meta: {
                    title: 'Users'
                },
            },
            {
                path: '/users/:userId',
                name: 'users-show',
                component: UserShow,
                meta: {
                    title: 'User Details'
                },
            },
            {
                path: '/departments',
                name: 'department-index',
                component: DepartmentIndex,
                meta: {
                    title: 'Departments'
                }
            },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const { isLoggedIn } = useIsAuthStore()

    if (isLoggedIn && to.matched.some(match => match.name === 'login')) {
        next({name: 'home-page'})
    } else if (!isLoggedIn && to.matched.some(match => match.name === 'master')) {
        next({name: 'login'})
    } else {
        next()
    }
})

export default router
