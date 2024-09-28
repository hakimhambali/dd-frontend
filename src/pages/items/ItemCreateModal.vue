<script setup lang="ts">
import ItemService from '@/services/ItemService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'

interface Input {
    name: string
    price: number
    description: string
    item_type: string
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    price: 0,
    description: '',
    item_type: '',
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const addItem = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);
        await ItemService.store(input.value)

        addToast({
            type: 'success',
            title: 'Success',
            message: `Item ${input.value.name} is successfully added with type ${input.value.item_type}.`,
        })

        document.getElementById('closeAddItemModalButton')?.click()

        emit('created')
        clearInput()
    } catch (error) {
        addToast({
            type: 'danger',
            title: 'Error',
            message: `Failed to add item.`,
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.description = ''
    input.value.item_type = ''
    input.value.price = 0
}

</script>

<template>
    <BaseModal modal-id="addItemModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Item</h1>
            <button type="button" id="closeAddItemModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="addItemForm" @submit.prevent="addItem">
                Name
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name">
                Price
                <input type="number" name="price" class="form-control mb-3" placeholder="Price" v-model="input.price">
                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                Item Type
                <input type="text" name="item_type" class="form-control mb-3" placeholder="Item Type" v-model="input.item_type">
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="addItemForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>