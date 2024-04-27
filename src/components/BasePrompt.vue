<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    id: string
    type?: 'success' | 'danger'
    title: string
    message: string
    action?: string
}>(), {
    type: 'danger',
    action: 'Proceed',
})

const emit = defineEmits<{
    dismiss: [proceed: boolean]
}>()

const modalStatusClassObject = computed(() => ({
    'bg-success': props.type === 'success',
    'bg-danger': props.type === 'danger'
}))

const iconClassObject = computed(() => ({
    'text-success': props.type === 'success',
    'text-danger': props.type === 'danger'
}))

const isProceed = (proceed: boolean) => emit('dismiss', proceed)
</script>

<template>
    <BaseModal :modal-id="id" :fade="false">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="modal-status" :class="modalStatusClassObject"></div>
        <div class="modal-body text-center py-4">
            <BaseIcon
                :name="type === 'danger' ? 'alert-triangle' : 'circle-check'"
                :size="24"
                class="mb-2"
                :class="iconClassObject"
            />
            <h3>{{ title }}</h3>
            <div class="text-secondary">{{ message }}</div>
        </div>
        <div class="modal-footer">
            <div class="w-100">
                <div class="row">
                    <div class="col">
                        <button class="btn w-100" data-bs-dismiss="modal" @click="isProceed(false)">
                            Cancel
                        </button>
                    </div>
                    <div class="col">
                        <button class="btn w-100" :class="[ type === 'success' ? 'btn-success' : 'btn-danger' ]" data-bs-dismiss="modal" @click="isProceed(true)">
                            {{ action }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </BaseModal>
</template>