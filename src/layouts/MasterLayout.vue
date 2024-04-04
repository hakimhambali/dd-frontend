<script setup lang="ts">
import BaseToast from '@/components/BaseToast.vue'
import TopNavBar from '@/components/TopNavBar.vue'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const { toasts } = storeToRefs(useToastStore())

const index = async () => {

}

onMounted(() => {
    index()
})
</script>

<template>
    <div class="page">
        <TopNavBar />
        <div class="page-wrapper">
            <div class="container" v-if="$route.meta.title">
                <div class="page-header d-print-none">
                    <div class="row g-2 align-items-center">
                        <div class="col">
                            <!-- <a href="#" @click.prevent="$router.go(-1)" role="button" class="mb-2 d-inline-block"
                            v-if="showBackButton($route.meta.title)">
                            <icon name="chevron-left" />
                            <span>Back</span>
                        </a> -->
                            <h2 class="page-title">
                                {{ $route.meta.title }}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page-body">
                <div class="container" id="page-container">
                    <router-view></router-view>
                </div>
            </div>
        </div>
        <div class="toast-container position-fixed top-0 end-0 p-3">
            <BaseToast v-for="toast in toasts" :key="toast.id" :toast="toast" />
        </div>
    </div>
</template>
