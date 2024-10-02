import MasterLayout from '@/layouts/MasterLayout.vue'
import HomePage from '@/pages/HomePage.vue'
import UserIndex from '@/pages/users/UserIndex.vue'
import GameUserIndex from '@/pages/gameusers/GameUserIndex.vue'
import ItemIndex from '@/pages/items/ItemIndex.vue'
import SkinIndex from '@/pages/skins/SkinIndex.vue'
import VoucherIndex from '@/pages/vouchers/VoucherIndex.vue'
import TerrainIndex from '@/pages/terrains/TerrainIndex.vue'
import MissionIndex from '@/pages/missions/MissionIndex.vue'
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
                path: '/gameusers',
                name: 'gameusers-index',
                component: GameUserIndex,
                meta: {
                    title: 'Game Users'
                },
            },
            {
                path: '/items',
                name: 'items-index',
                component: ItemIndex,
                meta: {
                    title: 'Item'
                },
            },
            {
                path: '/skins',
                name: 'skins-index',
                component: SkinIndex,
                meta: {
                    title: 'Skin'
                },
            },
            {
                path: '/vouchers',
                name: 'vouchers-index',
                component: VoucherIndex,
                meta: {
                    title: 'Voucher'
                },
            },
            {
                path: '/terrains',
                name: 'terrains-index',
                component: TerrainIndex,
                meta: {
                    title: 'Terrain'
                },
            },
            {
                path: '/missions',
                name: 'missions-index',
                component: MissionIndex,
                meta: {
                    title: 'Mission'
                },
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
