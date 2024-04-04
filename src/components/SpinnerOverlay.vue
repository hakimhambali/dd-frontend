<script setup lang="ts">
withDefaults(defineProps<{
    isShowing: boolean
}>(), {
    isShowing: false
})
</script>

<template>
    <div class="position-absolute spinner-overlay w-100 h-100" :class="[isShowing ? 'd-flex' : 'd-none']">
        <div class="d-flex align-self-center mx-auto">
            <div class="spinner-border"></div>
        </div>
    </div>
</template>

<style scoped>
.spinner-overlay {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.5);
}
</style>
