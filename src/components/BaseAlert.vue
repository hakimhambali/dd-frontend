<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    type?: string
    message: string
}>(), {
    type: 'success'
})

const title = computed(() => props.type === 'danger' ? 'An error has occured' : '')

</script>

<template>
    <div class="alert alert-danger" role="alert">
        <h4 class="alert-title">{{ title }}</h4>
        <div class="text-secondary">{{ message }}</div>
    </div>
</template>