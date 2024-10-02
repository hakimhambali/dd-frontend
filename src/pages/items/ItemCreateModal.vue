<script setup lang="ts">
import ItemService from '@/services/ItemService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import { ItemTypeNameEnum } from '@/enums/ItemTypeEnum'

interface Input {
    name: string
    price: number | null
    description: string | null
    item_type: ItemTypeNameEnum
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    price: null,
    description: null,
    item_type: ItemTypeNameEnum.VEHICLE,
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const itemTypes = Object.values(ItemTypeNameEnum)

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
    input.value.description = null
    input.value.item_type = ItemTypeNameEnum.VEHICLE
    input.value.price = null
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
                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                Price*
                <input type="number" name="price" class="form-control mb-3" placeholder="Price" v-model="input.price" required step="0.01" min="0.01">
                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                Item Type*
                <select name="item_type" class="form-control mb-3" v-model="input.item_type" required>
                    <option v-for="item_type in itemTypes" :key="item_type" :value="item_type">
                        {{ item_type }}
                    </option>
                </select>
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