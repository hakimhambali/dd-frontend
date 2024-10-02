<script setup lang="ts">
import TerrainService from '@/services/TerrainService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'

interface Input {
    name: string
    description: string | null
    is_default: boolean
    is_active: boolean
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    description: null,
    is_default: false,
    is_active: true
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const addTerrain = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);

        const response = await TerrainService.store(input.value)
        
        if (response && response.status === 201) {
            addToast({
                type: 'success',
                title: 'Success',
                message: `Terrain ${input.value.name} is successfully added.`,
            })

            document.getElementById('closeAddTerrainModalButton')?.click()

            emit('created')
            clearInput()
        } else {
            addToast({
                type: 'danger',
                title: 'Error',
                message: 'Failed to add terrain. Please try again.',
            })
        }
    } catch (error) {
        console.error("Error adding terrain:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: 'Failed to add terrain. An error occurred.',
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.description = null
    input.value.is_default = false
    input.value.is_active = true
}

</script>

<template>
    <BaseModal modal-id="addTerrainModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Terrain</h1>
            <button type="button" id="closeAddTerrainModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="addTerrainForm" @submit.prevent="addTerrain">

                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>

                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">

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
            <button type="submit" class="btn btn-primary" form="addTerrainForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>