import type Toast from '@/types/ToastType'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore(
    'toast',
    () => {
        const TOASTS_MAX = 5
        const toasts = ref<Toast[]>([])
        const toastIdCounter = ref<number>(1)

        const addToast = (toast: Toast) => {
            toast.id = toastIdCounter.value++

            if (toast.id === TOASTS_MAX) {
                toasts.value.shift()
            }

            toasts.value.push(toast)
        }

        const removeToast = (id: number) => {
            toasts.value = toasts.value.filter(toast => id !== toast.id)
        }

        return { toasts, addToast, removeToast }
    }
)