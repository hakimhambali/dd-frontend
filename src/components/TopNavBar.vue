<script setup lang="ts">
import AuthService from '@/services/AuthService'
import useIsAuthStore from '@/stores/auth'
import useUserStore from '@/stores/user'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { revokeUser } = useIsAuthStore()
const userStore = useUserStore()

const links = computed(() => {
    const links = [
        {
            path: '/users',
            text: 'Users',
            icon: 'user',
            active: false,
        },
        {
            path: '/departments',
            text: 'Departments',
            icon: 'building',
            active: false,
        },
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
    <nav class="navbar navbar-expand-lg navbar-light d-print-none">
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
                </ul>
            </div>
            <div class="d-flex align-items-center">
                <span class="me-3">Hi, {{ userStore.name }}!</span>
                <button class="btn btn-dark" @click.prevent="logout">Logout</button>
            </div>
        </div>
    </nav>
</template>@/stores/auth