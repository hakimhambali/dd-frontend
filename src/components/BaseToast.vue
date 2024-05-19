<script setup lang="ts">
import { useToastStore } from '@/stores/toast';
import type ToastType from '@/types/ToastType';
import Toast from 'bootstrap/js/dist/toast';
import { onMounted } from 'vue';

const { removeToast } = useToastStore()

const props = defineProps<{
    toast: ToastType
}>()

onMounted(() => {
    let toastElement = document.getElementById(`toast${props.toast.id}`)

    if (toastElement) {
        let toastInstance = Toast.getOrCreateInstance(toastElement)
        toastInstance?.show()

        toastElement.addEventListener('hidden.bs.toast', () => {
            if (props.toast.id) {
                removeToast(props.toast.id)
            }
        })
    }
})
</script>

<template>
    <div class="toast text-white" :class="[`bg-${toast.type}`]" :id="`toast${toast.id}`" role="alert"
        aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-toggle="toast">
        <div class="toast-header">
            <strong class="me-auto">{{ toast.title }}</strong>
            <button type="button" :ref="`closeToast${toast.id}`" class="ms-2 btn-close" data-bs-dismiss="toast"
                aria-label="Close"></button>
        </div>
        <div class="toast-body">
            {{ toast.message }}
        </div>
    </div>
</template>