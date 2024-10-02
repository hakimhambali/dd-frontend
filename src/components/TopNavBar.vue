<script setup lang="ts">
import AuthService from '@/services/AuthService'
import useIsAuthStore from '@/stores/auth'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { revokeUser } = useIsAuthStore()

const links = computed(() => {
    const links = [
        {
            path: '/users',
            text: 'Users',
            icon: 'user',
            active: false,
        },
        {
            path: '/gameusers',
            text: 'Game Users',
            icon: 'user',
            active: false,
        },
        {
            path: '/items',
            text: 'Items',
            icon: 'user',
            active: false,
        },
        {
            path: '/skins',
            text: 'Skins',
            icon: 'user',
            active: false,
        },
        {
            path: '/vouchers',
            text: 'Vouchers',
            icon: 'user',
            active: false,
        },
        {
            path: '/terrains',
            text: 'Terrains',
            icon: 'user',
            active: false,
        },
        {
            path: '/missions',
            text: 'Missions',
            icon: 'user',
            active: false,
        },
        {
            path: '/achievements',
            text: 'Achievements',
            icon: 'user',
            active: false,
        },
        // {
        //     path: '/departments',
        //     text: 'Departments',
        //     icon: 'building',
        //     active: false,
        // },
    ]

    // Set the 'active' property of the link that matches the current route to true
    links.forEach(link => {
        link.active = route.path === link.path
    })

    return links
})

const logout = async (): Promise<void> => {
    try {
        await AuthService.logout()
        revokeUser()
        router.push({ name: 'login' })
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-light d-print-none px-5">
        <div class="container-fluid">
            <router-link :to="{ name: 'home-page' }" class="navbar-brand fw-bold me-5">Home</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavDropdown">
                <ul class="navbar-nav">
                    <li class="nav-item" v-for="link in links" :key="link.path" :class="{ 'active': link.active }">
                        <router-link class="nav-link" :to="link.path" :aria-current="link.active ? 'page' : null">
                            <span class="nav-link-icon d-md-none d-lg-inline-block">
                                <BaseIcon :name="link.icon" />
                            </span>
                            {{ link.text }}
                        </router-link>
                    </li>
                    <!-- <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                            aria-expanded="false">Settings</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </li> -->
                </ul>
            </div>
            <div class="navbar-nav flex-row order-md-last">
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
                        <span class="avatar avatar-sm" style="background-image: url(...)"></span>
                        <div class="d-none d-xl-block ps-2">
                            <div>John</div>
                            <div class="mt-1 small text-secondary">Full Stack Developer</div>
                        </div>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#">Profile</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
</template>