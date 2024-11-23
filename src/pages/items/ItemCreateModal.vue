<script setup lang="ts">
import ItemService from '@/services/ItemService'
import { useToastStore } from '@/stores/toast'
import { ref, watch, computed } from 'vue';
import type Item from '@/types/Item';

const props = defineProps({
    item: {
        type: Object as () => Partial<Item>,
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
    code: props.item.code || '',
    item_type: props.item.item_type || '',
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');

watch(
    () => props.item,
    (newItem) => {
        input.value = {
            code: newItem.code || '',
            item_type: newItem.item_type || '',
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.item.id !== undefined) {
            await ItemService.update(props.item.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Item ${input.value.item_type} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await ItemService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Item ${input.value.item_type} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddItemModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: `Failed to process. ${error.response.data.message}`,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        code: '',
        item_type: '',
    }
}

</script>

<template>
    <BaseModal modal-id="addItemModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Item' : 'Add New Item' }}</h1>
            <button type="button" id="closeAddItemModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="itemForm" @submit.prevent="handleSubmit">
                <div v-if="isUpdateMode">
                    Code
                    <input type="text" name="code" class="form-control mb-3" placeholder="Code" v-model="input.code" disabled>
                </div>
                Item Type*
                <input type="text" name="item_type" class="form-control mb-3" placeholder="Item Type" v-model="input.item_type" required>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="itemForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>