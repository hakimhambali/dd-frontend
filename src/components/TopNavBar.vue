<script setup lang="ts">
import AuthService from '@/services/AuthService'
import UserService from '@/services/UserService'
import useIsAuthStore from '@/stores/auth'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { revokeUser } = useIsAuthStore()

const links = computed(() => {
    const links = [
        {
            text: 'User',
            icon: 'user',
            active: false,
            children: [
                {
                    path: '/users',
                    text: 'Admin',
                    active: false,
                },
                {
                    path: '/gameusers',
                    text: 'Player',
                    active: false,
                }
            ]
        },
        {
            text: "Product",
            icon: "box",
            active: false,
            children: [
                {
                    path: "/products",
                    text: "Products",
                    active: false,
                },
                {
                    path: "/items",
                    text: "Items",
                    active: false,
                },
                {
                    path: "/skins",
                    text: "Skins",
                    active: false,
                },
                {
                    path: "/currencies",
                    text: "Currencies",
                    active: false,
                },
            ],
        },
        {
            path: '/vouchers',
            text: 'Vouchers',
            icon: 'ticket',
            active: false,
        },
        {
            path: '/terrains',
            text: 'Terrains',
            icon: 'road',
            active: false,
        },
        {
            text: "Mission & Achivement",
            icon: "award",
            active: false,
            children: [
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
                }
            ]
        },
        {
            text: "History",
            icon: "archive",
            active: false,
            children: [
                {
                    path: '/currencyHistories',
                    text: 'Currency Histories',
                    icon: 'user',
                    active: false,
                },
                {
                    path: '/transactionHistories',
                    text: 'Transaction Histories',
                    icon: 'user',
                    active: false,
                },
            ]
        },
    ]

    // Set the 'active' property of the link that matches the current route to true
    links.forEach((link) => {
        if (link.children) {
            // If there are children, check if any child is active
            link.children.forEach((child) => {
                child.active = route.path === child.path;
            });
            link.active = link.children.some((child) => child.active);
        } else {
            // For single links
            link.active = route.path === link.path;
        }
    });

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
                    <li v-for="link in links" :key="link.text" class="nav-item" :class="{ dropdown: link.children, active: link.active }">
                        
                        <!-- Contain Child list -->
                        <template v-if="link.children">
                            <!-- Parent -->
                            <a href="#" class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <BaseIcon :name="link.icon" />
                                </span>
                                {{ link.text }}
                            </a>

                            <!-- Dropdown Menu (Child) -->
                            <ul class="dropdown-menu">
                                <li v-for="child in link.children" :key="child.path">
                                    <router-link class="dropdown-item" :class="{'active': child.active}" :to="child.path" :aria-current="child.active ? 'page' : null">
                                        {{ child.text }}
                                    </router-link>
                                </li>
                            </ul>
                        </template>

                        <!-- Single Links -->
                        <template v-else>
                            <router-link class="nav-link" :to="link.path" :aria-current="link.active ? 'page' : null">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <BaseIcon :name="link.icon" />
                                </span>
                                {{ link.text }}
                            </router-link>
                        </template>
                    </li>
                </ul>
            </div>
            <div class="navbar-nav flex-row order-md-last">
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
                        <span class="avatar avatar-sm" style="background-image: url(profile1.png)"></span>
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