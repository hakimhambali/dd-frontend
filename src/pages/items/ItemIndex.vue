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
    code: string,
    item_type: string
}>({
    code: '',
    item_type: '',
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
                    Code
                    <input v-model="filter.code" type="text" class="form-control" placeholder="Code">
                </div>
                <div class="col-12 col-md-auto">
                    Item Type
                    <input v-model="filter.item_type" type="text" class="form-control" placeholder="Item Type">
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
                            <th>Item Type</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="items.length > 0">
                            <tr class="align-middle" v-for="(item, index) in items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.code }}</td>
                                <td>{{ item.item_type }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addItemModal" @click="setItemToEdit(item)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setItemToBeDeleted(item.id, item.item_type)">
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

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this item?"
        :message="`You won't be able to retrieve this ${itemNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>