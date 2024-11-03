<script setup lang="ts">
import ProductService from '@/services/ProductService'
import { useToastStore } from '@/stores/toast'
import { GameCurrencyNameEnum } from '@/enums/GameCurrencyEnum'
import { ref, watch, computed, onMounted } from 'vue';
import type Product from '@/types/Product';

const props = defineProps({
    product: {
        type: Object as () => Partial<Product>,
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
    code: props.product?.code || '',
    name: props.product?.name || '',
    price_real: props.product?.price_real || null,
    price_game: props.product?.price_game || null,
    price_game_type: props.product?.price_game_type || '',
    product_type: 'Item',
    description: props.product?.description || '',
    is_active: props.product.is_active || true,
    items: props.product?.items || []
})

if (props.product?.items) {
    console.log("DATA", props.product?.items)
    for (const item of props.product.items) {
        input.value.items.push({
            item_id: item.id,
            count: item.count || 1
        });
    }
}

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');

const price_game_types = Object.values(GameCurrencyNameEnum)

const items = ref<{ id: number; item_type: string }[]>([]);

const isItemSelected = computed(() => {
    return (id: number) => input.value.items.some(item => item.item_id === id);
});

const fetchItems = async () => {
    try {
        const response = await ProductService.getItems()
        items.value = response.data;
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

onMounted(fetchItems);

watch(
    () => props.product,
    (newProduct) => {
        input.value = {
            code: newProduct?.code || '',
            name: newProduct?.name || '',
            price_real: newProduct?.price_real || null,
            price_game: newProduct?.price_game || null,
            price_game_type: newProduct?.price_game_type || '',
            product_type: 'Item',
            description: newProduct?.description || '',
            is_active: newProduct?.is_active ?? true,
            items: newProduct?.items || []
        }
    },
    { immediate: true }
)

watch(
    () => input.value.price_game,
    (newPriceGame) => {
        const gameTypeInput = document.getElementById('game_type') as HTMLSelectElement;
        if (newPriceGame) {
            gameTypeInput.setAttribute('required', 'true');
        } else {
            gameTypeInput.removeAttribute('required');
        }
    }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.product.id !== undefined) {
            await ProductService.update(props.product.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Product ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await ProductService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Product ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }
        document.getElementById('closeAddProductModalButton')?.click()
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
        name: '',
        price_real: null,
        price_game: null,
        price_game_type: '',
        product_type: 'Item Consumable',
        description: '',
        is_active: true,
        items: []
    }
}

const addItem = () => {
    input.value.items.push({ item_id: '', count: 1 });
}

const removeItem = (index: number) => {
    input.value.items.splice(index, 1);
}

</script>

<template>
    <BaseModal modal-id="addProductModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Product' : 'Add New Product' }}</h1>
            <button type="button" id="closeAddProductModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="productForm" @submit.prevent="handleSubmit">
                <div v-if="isUpdateMode">
                    Code
                    <input type="text" name="code" class="form-control mb-3" placeholder="Code" v-model="input.code" disabled>
                </div>
                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                Price Real*
                <input type="number" name="price_real" class="form-control mb-3" placeholder="Price Real" v-model="input.price_real" required step="0.01" min="0.01">
                Price Game
                <input type="number" name="price_game" class="form-control mb-3" placeholder="Price Game" v-model="input.price_game" min="1">
                Price Game Type
                <select name="price_game_type" class="form-select mb-3" v-model="input.price_game_type" id="game_type">
                    <option value="">Select Price Game Type</option>
                    <option v-for="price_game_type in price_game_types" :key="price_game_type" :value="price_game_type">
                        {{ price_game_type }}
                    </option>
                </select>
                Product Type*
                <input type="text" name="product_type" class="form-control mb-3" placeholder="Product Type" v-model="input.product_type" disabled>
                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                <br>
                Select Item(s) for this Product and their count
                <br>
                <br>
                <div v-for="(item, index) in input.items" :key="index" class="mb-3">
                    Item
                    <select v-model="item.item_id" class="form-select mb-3" required>
                        <option value="">Select Item</option>
                        <option v-for="option in items" :key="option.id" :value="option.id" :disabled="isItemSelected(option.id) && option.id !== item.item_id">
                            {{ option.item_type }}
                        </option>
                    </select>
                    Count
                    <input type="number" v-model="item.count" class="form-control mb-3" placeholder="Count" min="1" required>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button type="button" @click="removeItem(index)" class="btn btn-danger">Remove</button>
                    </div>
                    <hr>
                </div>

                <button type="button" class="btn btn-secondary" @click="addItem">Add Item</button>
                <br>
                <br>
                <div class="form-check mb-3">
                    <input type="checkbox" id="is_active" v-model="input.is_active" class="form-check-input">
                    <label for="is_active" class="form-check-label">
                        Active
                    </label>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="productForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>