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
    code: '',
    name: '',
    price_real: null,
    price_game: null,
    price_game_type: '',
    product_type: 'Item',
    description: '',
    is_active: true,
    items: [] as Array<{ item_id: number; count: number }>
})

const isProcessing = ref(false)
const isUpdateMode = computed(() => props.mode === 'update');
const price_game_types = Object.values(GameCurrencyNameEnum);
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

// Update `input` fields whenever `props.product` changes
watch(
    () => props.product,
    (newProduct) => {
        input.value = {
            code: newProduct?.code || '',
            name: newProduct?.name || '',
            price_real: newProduct?.price_real || null,
            price_game: newProduct?.price_game || null,
            price_game_type: newProduct?.price_game_type || '',
            product_type: newProduct?.product_type || 'Item',
            description: newProduct?.description || '',
            is_active: newProduct?.is_active ?? true,
            items: newProduct.items
                ? newProduct.items.map(item => ({
                    item_id: item.id,
                    count: item.count || 1
                }))
                : []
        };
    },
    { immediate: true }
);

onMounted(fetchItems);

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
        const dataToSubmit = {
            ...input.value,
            items: input.value.items.map(item => ({
                item_id: item.item_id,
                count: item.count
            }))
        };

        if (isUpdateMode.value && props.product.id !== undefined) {
            await ProductService.update(props.product.id, dataToSubmit)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Product ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await ProductService.store(dataToSubmit)
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
        console.error("Error in operation:", error);
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
        code: '',
        name: '',
        price_real: null,
        price_game: null,
        price_game_type: '',
        product_type: 'Item',
        description: '',
        is_active: true,
        items: []
    }
}

const addItem = () => {
    input.value.items.push({ item_id: null, count: 1 });
}

const removeItem = (index: number) => {
    input.value.items.splice(index, 1);
}
</script>

<template>
    <BaseModal modal-id="addProductModal" modal-size="xl">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Product' : 'Add New Product' }}</h1>
            <button type="button" id="closeAddProductModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="productForm" @submit.prevent="handleSubmit">
                <div class="row">
                    <div v-if="isUpdateMode" class="col-md-6 col-sm-12">
                        Code
                        <input type="text" name="code" class="form-control mb-3" placeholder="Code" v-model="input.code" disabled>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Name*
                        <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 col-sm-12">
                        Price Real*
                        <input type="number" name="price_real" class="form-control mb-3" placeholder="Price Real" v-model="input.price_real" required step="0.01" min="0.01">   
                    </div>
                    <div class="col-md-4 col-sm-12">
                        Price Game
                        <input type="number" name="price_game" class="form-control mb-3" placeholder="Price Game" v-model="input.price_game" min="1">
                    </div>
                    <div class="col-md-4 col-sm-12">
                        Price Game Type
                        <select name="price_game_type" class="form-select mb-3" v-model="input.price_game_type" id="game_type">
                            <option value="">Select Price Game Type</option>
                            <option v-for="price_game_type in price_game_types" :key="price_game_type" :value="price_game_type">
                                {{ price_game_type }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Product Type*
                        <input type="text" name="product_type" class="form-control mb-3" placeholder="Product Type" v-model="input.product_type" disabled>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Description
                        <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                    </div>
                </div>
                
                <div class="row mb-2">Select Item(s) for this Product and their count:</div>

                <div v-for="(item, index) in input.items" :key="index">
                    <div class="row">
                        <div class="col-md-6 col-sm-12">
                            Item
                            <select v-model="item.item_id" class="form-select mb-3" required>
                                <option value="">Select Item</option>
                                <option v-for="option in items" :key="option.id" :value="option.id" :disabled="isItemSelected(option.id) && option.id !== item.item_id">
                                    {{ option.item_type }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-6 col-sm-12">
                            Count
                            <input type="number" v-model="item.count" class="form-control mb-3" placeholder="Count" min="1" required>
                        </div>
                        <div class="d-grid d-md-flex justify-content-md-end">
                            <button type="button" @click="removeItem(index)" class="btn btn-danger">Remove</button>
                        </div>
                    </div>
                    <hr>
                </div>

                <button type="button" class="btn btn-secondary mb-3" @click="addItem">Add Item</button>
                
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
                {{ isProcessing ? (isUpdateMode ? 'Updating...' : 'Adding...') : (isUpdateMode ? 'Update' : 'Add') }}
            </button>
        </div>
    </BaseModal>
</template>
