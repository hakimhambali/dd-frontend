<script setup lang="ts">
import TerrainService from '@/services/TerrainService'
import { useToastStore } from '@/stores/toast'
import type Terrain from '@/types/Terrain';
import { ref, watch, computed } from 'vue';

// Props for passing the terrain and mode (create or update)
const props = defineProps({
    terrain: {
        type: Object as () => Partial<Terrain>,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'create'
    }
})

const emit = defineEmits(['created', 'updated'])

const { addToast } = useToastStore()

// Form inputs, initialize with either empty values or passed terrain object
const input = ref({
    name: props.terrain.name || '',
    description: props.terrain.description || '',
    is_default: props.terrain.is_default || false,
    is_active: props.terrain.is_active || true
})

const isProcessing = ref<boolean>(false)

const isUpdateMode = computed(() => props.mode === 'update');

watch(
    () => props.terrain,
    (newTerrain) => {
        input.value = {
            name: newTerrain.name || '',
            description: newTerrain.description || '',
            is_default: newTerrain.is_default ?? false,
            is_active: newTerrain.is_active ?? true
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.terrain.id !== undefined) {
            const response = await TerrainService.update(props.terrain.id, input.value);
            if (response.status === 200) {
                addToast({
                    type: 'success',
                    title: 'Updated',
                    message: `Terrain ${input.value.name} is successfully updated.`,
                });
                emit('updated');
            } else {
                throw new Error(response.data.message || 'Unknown error occurred');
            }
        } else {
            const response = await TerrainService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Terrain ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddTerrainModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: `${error.response.data.error}. ${error.response.data.errors.name[0]}`,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        name: '',
        description: '',
        is_default: false,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addTerrainModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Terrain' : 'Add New Terrain' }}</h1>
            <button type="button" id="closeAddTerrainModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="terrainForm" @submit.prevent="handleSubmit">

                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>

                Description
                <textarea name="description" class="form-control mb-3" placeholder="Description" v-model="input.description" rows="2"></textarea>

                <div class="form-check mb-3">
                    <input type="checkbox" id="is_default" v-model="input.is_default" class="form-check-input">
                    <label for="is_default" class="form-check-label">
                        Default
                    </label>
                </div>

                <div class="form-check mb-3">
                    <input type="checkbox" id="is_active" v-model="input.is_active" class="form-check-input">
                    <label for="is_active" class="form-check-label">
                        Active
                    </label>
                </div>

            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="terrainForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>