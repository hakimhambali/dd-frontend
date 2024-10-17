<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import ItemService from '@/services/ItemService'
import ItemCreateModal from '@/pages/items/ItemCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Item from '@/types/Item'
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

const items = ref<Array<Item>>([])
const itemIdToBeDeleted = ref<number>()
const itemNameToBeDeleted = ref<string>()

const filter = ref<{
    name: string
    // price: number
    item_type: string
    description: string | null
    is_active: boolean
}>({
    name: '',
    // price: '',
    item_type: '',
    description: '',
    is_active: true,
})

const getItems = async () => {
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
        const response = await ItemService.index(query)
        console.log("responseItemService.index", response);
        items.value = response.data.data
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

const deleteItem = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("item id",id);
        await ItemService.delete(id)
        addToast({
            type: 'success',
            message: 'Item is successfully deleted.'
        })
        await getItems()
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

const itemToEdit = ref<Item | undefined>(undefined)
    const setItemToEdit = (item: Item) => {
    itemToEdit.value = item
    console.log("itemToEdit.value", itemToEdit.value)
}

const setItemToBeDeleted = (itemId: number, itemName: string) => {
    itemIdToBeDeleted.value = itemId
    itemNameToBeDeleted.value = itemName
}

const isProceed = (proceed: boolean) => {
    if (proceed && itemIdToBeDeleted.value) {
        deleteItem(itemIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getItems()
)

getItems()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addItemModal" @click="itemToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Item
                    </button>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Name
                    <input v-model="filter.name" type="text" class="form-control" placeholder="Name">
                </div>
                <div class="col-12 col-md-auto">
                    Description
                    <input v-model="filter.description" type="text" class="form-control" placeholder="Description">
                </div>
                <div class="col-12 col-md-auto">
                    Item Type
                    <select v-model="filter.item_type" class="form-select">
                        <option value="">All types</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="Gold 2X Multiplier">Gold 2X Multiplier</option>
                        <option value="Coin Magnet">Coin Magnet</option>
                        <option value="Life">Life</option>
                    </select>
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
                    <button class="btn btn-success" @click.prevent="getItems">
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
                            <th>Price</th>
                            <th>Item Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="items.length > 0">
                            <tr class="align-middle" v-for="(item, index) in items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.product.code }}</td>
                                <td>{{ item.product.name }}</td>
                                <td>{{ item.product.price }}</td>
                                <td>{{ item.item_type }}</td>
                                <td>{{ item.product.description }}</td>
                                <td>{{ item.product.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addItemModal" @click="setItemToEdit(item)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setItemToBeDeleted(item.id, item.product.name)">
                                            <BaseIcon name="trash" />
                                        </button>
                                    </div>
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

    <ItemCreateModal :item="itemToEdit" :mode="itemToEdit ? 'update' : 'create'" 
                    @created="getItems" 
                    @updated="getItems" />

    <ItemCreateModal @created="getItems" />
    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${itemNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>