<script setup lang="ts">
import router from '@/router'
import { ref, onMounted } from 'vue'

const numOfUsers = ref<number>(0)

const index = async (): Promise<void> => {

}

onMounted(() => {
    index()
})
</script>

<template>
    <div class="row">
        <div class="col-3">
            <div class="card clickable-card text-center" @click="router.push('/users')">
                <div class="card-body mx-5">
                    <h5 class="card-title">Number of Users: {{ numOfUsers }}</h5>
                </div>
            </div>
        </div>
        <div class="col-3">
            <div class="card clickable-card text-center" @click="router.push('/users')">
                <div class="card-body mx-5">
                    <h5 class="card-title">Number of Users: {{ numOfUsers }}</h5>
                </div>
            </div>
        </div>
    </div>
</template>