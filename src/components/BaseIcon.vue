<script setup lang="ts">
interface Props {
    size?: number
    strokeWidth?: number
    name: string
}

withDefaults(defineProps<Props>(), {
    size: 20,
    strokeWidth: 1.8,
    name: 'search',
})
</script>

<template>
    <svg :width="size" :height="size" class="icon" :stroke-width="strokeWidth">
        <use :xlink:href="`/node_modules/@tabler/icons/tabler-sprite-nostroke.svg#tabler-${name}`" />
    </svg>
</template>

<style scoped>
.icon {
    width: v-bind(size) !important;
    height: v-bind(size) !important;
    stroke-width: v-bind(strokeWidth) !important;
}
</style>