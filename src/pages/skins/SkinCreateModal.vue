<script setup lang="ts">
import SkinService from '@/services/SkinService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import { SkinTypeNameEnum } from '@/enums/SkinTypeEnum'

interface Input {
    name: string
    price: number | null
    description: string | null
    skin_type: SkinTypeNameEnum
    is_active: boolean
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    price: null,
    description: null,
    skin_type: SkinTypeNameEnum.SHIRT,
    is_active: true
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const skinTypes = Object.values(SkinTypeNameEnum)

const addSkin = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);
        await SkinService.store(input.value)

        addToast({
            type: 'success',
            title: 'Success',
            message: `Skin ${input.value.name} is successfully added with type ${input.value.skin_type}.`,
        })

        document.getElementById('closeAddSkinModalButton')?.click()

        emit('created')
        clearInput()
    } catch (error) {
        addToast({
            type: 'danger',
            title: 'Error',
            message: `Failed to add skin.`,
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.description = null
    input.value.skin_type = SkinTypeNameEnum.SHIRT
    input.value.price = null
    input.value.is_active = true
}

</script>

<template>
    <BaseModal modal-id="addSkinModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Skin</h1>
            <button type="button" id="closeAddSkinModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

            <form action="" id="addSkinForm" @submit.prevent="addSkin">
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
            <button type="submit" class="btn btn-primary" form="addSkinForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>