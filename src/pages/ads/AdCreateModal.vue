<script setup lang="ts">
import AdService from '@/services/AdService'
import { useToastStore } from '@/stores/toast'
import type Ad from '@/types/Ad';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    ad: {
        type: Object as () => Partial<Ad>,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'create'
    }
})

const emit = defineEmits(['created', 'updated'])

const { addToast } = useToastStore()

const input = ref({
    skips: props.ad.skips || 0,
    real_price: props.ad.real_price || null,
    is_active: props.ad.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');

watch(
    () => props.ad,
    (newAd) => {
        input.value = {
            skips: newAd.skips || 0,
            real_price: newAd.real_price || null,
            is_active: newAd.is_active ?? true
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.ad.id !== undefined) {
            await AdService.update(props.ad.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Ad ${input.value.skips} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await AdService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Ad ${input.value.skips} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddAdModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
        addToast({
            type: 'danger',
            title: 'Error',
            message: errorMessages,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        skips: 0,
        real_price: null,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addAdModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Ad' : 'Add New Ad' }}</h1>
            <button type="button" id="closeAddAdModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="adForm" @submit.prevent="handleSubmit">
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Skips
                        <input type="number" name="skips" class="form-control mb-3" placeholder="Skips" v-model="input.skips">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Real Price
                        <input type="number" name="real_price" class="form-control mb-3" placeholder="Real Price" v-model="input.real_price" step="0.01" min="0.01">
                    </div>
                    <div class="form-check mb-3">
                        <input type="checkbox" id="is_active" v-model="input.is_active" class="form-check-input">
                        <label for="is_active" class="form-check-label">
                            Active
                        </label>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="adForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>