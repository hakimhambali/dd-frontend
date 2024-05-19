<script setup lang="ts">
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import type User from '@/types/User'
import { AxiosError, HttpStatusCode } from 'axios'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { addToast } = useToastStore()

const userId = computed(() => Number(route.params.userId))
const user = ref<User>()
const isFetching = ref<boolean>(false)

const show = async () => {
    isFetching.value = true

    try {
        const response = await UserService.show(userId.value)
        user.value = response.data.data
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response && error.response.status === HttpStatusCode.NotFound) {
                addToast({
                    title: 'Not found',
                    type: 'danger',
                    message: 'User not found'
                })
            }
        }
    } finally {
        isFetching.value = false
    }
}

show()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <template v-if="user">
                <h1>Name: {{ user.profile.full_name }}</h1>
            </template>
        </div>
        <SpinnerOverlay :is-showing="isFetching" />
    </div>
</template>