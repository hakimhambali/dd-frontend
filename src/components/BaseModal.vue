<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    modalId: string
    modalSize?: string
    modalBackdrop?: string | boolean
    modalKeyboard?: boolean
    verticallyCentered?: boolean
}>(), {
    modalSize: 'sm',
    modalBackdrop: true,
    modalKeyboard: true,
    verticallyCentered: true
})

const verticallyCenteredClass = computed(() => props.verticallyCentered ? 'modal-dialog-centered ' : null)
</script>

<template>
    <div class="modal fade" role="dialog" tabindex="-1" :id="modalId" :data-bs-backdrop="modalBackdrop"
        :data-bs-keyboard="modalKeyboard">
        <div :class="`modal-dialog modal-${modalSize} ${verticallyCenteredClass}`" role="document">
            <div class="modal-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
