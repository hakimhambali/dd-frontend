<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import ProductService from '@/services/ProductService'
import ProductCreateModal from '@/pages/products/ProductCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Product from '@/types/Product'
import { AxiosError } from 'axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const { addToast } = useToastStore()
const router = useRouter()

const loading = ref<boolean>(false)

const {
    metaPage,
    metaPageTriggered,
    updateMetaPage,
    updatePerPage,
    prevPage,
    nextPage,
    gotoPage
} = useMetaPage()

const products = ref<Array<Product>>([])
const productIdToBeDeleted = ref<number>()
const productNameToBeDeleted = ref<string>()

const filter = ref<{
    code: string
    name: string
    product_type: string
    description: string | null
    is_active: boolean
}>({
    code: '',
    name: '',
    product_type: '',
    description: '',
    is_active: true,
})

const getProducts = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    console.log("Query being sent: ", query);

    try {
        const response = await ProductService.index(query)
        console.log("responseProductService.index", response);
        products.value = response.data.data
        updateMetaPage(response.data.meta)
    } catch (error) {
        if (error instanceof AxiosError) {
            addToast({
                type: 'danger',
                message: error.response?.data.message
            })
        }
    }

    loading.value = false
}

const deleteProduct = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("product id",id);
        await ProductService.delete(id)
        addToast({
            type: 'success',
            message: 'Product is successfully deleted.'
        })
        await getProducts()
    } catch (error) {
        if (error instanceof AxiosError) {
            addToast({
                type: 'danger',
                message: error.response?.data.message
            })
        }
    }

    loading.value = false
}

const productToEdit = ref<Product | undefined>(undefined)
    const setProductToEdit = (product: Product) => {
    productToEdit.value = product
    console.log("productToEdit.value", productToEdit.value)
}

const setProductToBeDeleted = (productId: number, productName: string) => {
    productIdToBeDeleted.value = productId
    productNameToBeDeleted.value = productName
}

const isProceed = (proceed: boolean) => {
    if (proceed && productIdToBeDeleted.value) {
        deleteProduct(productIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getProducts()
)

getProducts()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal" @click="productToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Product
                    </button>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Code
                    <input v-model="filter.code" type="text" class="form-control" placeholder="Code">
                </div>
                <div class="col-12 col-md-auto">
                    Name
                    <input v-model="filter.name" type="text" class="form-control" placeholder="Name">
                </div>
                <div class="col-12 col-md-auto">
                    Product Type
                    <select v-model="filter.product_type" class="form-select">
                        <option value="">All types</option>
                        <option value="Item">Item Consumable</option>
                        <option value="Skin">Skin</option>
                        <option value="Currency">Currency</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto">
                    Description
                    <input v-model="filter.description" type="text" class="form-control" placeholder="Description">
                </div>
                <div class="col-12 col-md-auto">
                    Status
                    <select v-model="filter.is_active" class="form-select">
                        <option value="">All statuses</option>
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <br>
                    <button class="btn btn-success" @click.prevent="getProducts">
                        <BaseIcon name="filter" />
                        Filter
                    </button>
                </div>
            </div>

            <Pagination
                :meta-page="metaPage"
                @prev-page="prevPage"
                @next-page="nextPage"
                @goto-page="gotoPage"
                @per-page-updated="updatePerPage"
                :is-showing-per-page="true"
            />

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Real Price</th>
                            <th>Game Price</th>
                            <th>Product Type</th>
                            <th>Detail Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="products.length > 0">
                            <tr class="align-middle" v-for="(product, index) in products" :key="product.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ product.code }}</td>
                                <td>{{ product.name }}</td>
                                <td>RM {{ product.price_real }}</td>
                                <td>
                                    {{ (product.price_game != null || product.price_game_type != null) ? product.price_game + ' ' + product.price_game_type : 'N/A' }}
                                </td>
                                <td>{{ product.product_type }}</td>
                                <td>
                                    <template v-if="product.skin">
                                        {{ product.skin.skin_type }}
                                    </template>
                                    <template v-else-if="product.currency">
                                        {{ product.currency.currency_type }}
                                    </template>
                                    <template v-else>
                                        <ul v-if="product.items.length > 0">
                                            <li v-for="item in product.items" :key="item.id">{{ item.item_type }} - {{ item.count }}</li>
                                        </ul>
                                        <p v-else>No items available</p>
                                    </template>
                                </td>
                                <td>{{ product.description || 'N/A' }}</td>
                                <td>{{ product.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <template v-if="product.skin || product.currency"></template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal" @click="setProductToEdit(product)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setProductToBeDeleted(product.id, product.name)">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr class="text-center">
                                <td colspan="11">No data</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <Pagination
                    :meta-page="metaPage"
                    @prev-page="prevPage"
                    @next-page="nextPage"
                    @goto-page="gotoPage"
                    @per-page-updated="updatePerPage"
                />
                <SpinnerOverlay :is-showing="loading" />
            </div>
        </div>
    </div>

    <!-- <ProductCreateModal :product="productToEdit" :mode="productToEdit ? 'update' : 'create'" 
                    @created="getProducts" 
                    @updated="getProducts" /> -->

    <ProductCreateModal :product="productToEdit ? { ...productToEdit } : undefined" :mode="productToEdit ? 'update' : 'create'"
        @created="getProducts"
        @updated="getProducts"
    />
                    
    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this product?"
        :message="`You won't be able to retrieve this ${productNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>