<script setup lang="ts">
import SkinService from '@/services/SkinService'
import { useToastStore } from '@/stores/toast'
import { SkinTypeNameEnum } from '@/enums/SkinTypeEnum'
import type Skin from '@/types/Skin';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    skin: {
        type: Object as () => Partial<Skin>,
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
    name: props.skin.product?.name || '',
    description: props.skin.product?.description || '',
    price: props.skin.product?.price || null,
    skin_type: props.skin.skin_type || SkinTypeNameEnum.SHIRT,
    is_active: props.skin.product?.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const skinTypes = Object.values(SkinTypeNameEnum)

watch(
    () => props.skin,
    (newSkin) => {
        input.value = {
            name: newSkin.product?.name || '',
            description: newSkin.product?.description || '',
            price: newSkin.product?.price || null,
            skin_type: newSkin.skin_type || SkinTypeNameEnum.SHIRT,
            is_active: newSkin.product?.is_active ?? true
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.skin.id !== undefined) {
            await SkinService.update(props.skin.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Skin ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await SkinService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Skin ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddSkinModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: 'Failed to process. An error occurred.',
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        name: '',
        description: '',
        price: null,
        skin_type: SkinTypeNameEnum.SHIRT,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addSkinModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Skin' : 'Add New Skin' }}</h1>
            <button type="button" id="closeAddSkinModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

            <form action="" id="skinForm" @submit.prevent="handleSubmit">
                    Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                Price*
                <input type="number" name="price" class="form-control mb-3" placeholder="Price" v-model="input.price" required step="0.01" min="0.01">
                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                Skin Type*
                <select name="skin_type" class="form-control mb-3" v-model="input.skin_type" required>
                    <option v-for="skin_type in skinTypes" :key="skin_type" :value="skin_type">
                        {{ skin_type }}
                    </option>
                </select>
                <div class="form-check mb-3">
                    <input type="checkbox" id="is_active" v-model="input.is_active" class="form-check-input">
                    <label for="is_active" class="form-check-label">
                        Active
                    </label>
                </div>
            </form>

        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="skinForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>