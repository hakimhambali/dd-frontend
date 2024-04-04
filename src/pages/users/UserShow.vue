<script setup lang="ts">
import UserService from '@/services/UserService'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const { addToast } = useToastStore()

const userId = computed(() => Number(route.params.userId))
const userName = ref('')

const show = (id: number) => {
    UserService.show(id)
        .then(({ data: { data } }) => userName.value = data.name)
        .catch(() => {
            
        })
}

onMounted(() => {
    show(userId.value)
})
</script>

<template>

    <h1>{{ userName }}</h1>

</template>