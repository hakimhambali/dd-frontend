<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import CurrencyService from '@/services/CurrencyService'
import CurrencyCreateModal from '@/pages/currencies/CurrencyCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Currency from '@/types/Currency'
import { GameCurrencyNameEnum } from '@/enums/GameCurrencyEnum'
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

const currencies = ref<Array<Currency>>([])
const currencyIdToBeDeleted = ref<number>()
const currencyNameToBeDeleted = ref<string>()

const filter = ref<{
    code: string
    name: string
    currency_type: string
    description: string | null
    is_active: boolean
}>({
    code: '',
    name: '',
    currency_type: '',
    description: '',
    is_active: true,
})

const getCurrencies = async () => {
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
        const response = await CurrencyService.index(query)
        console.log("responseCurrencyService.index", response);
        currencies.value = response.data.data
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

const deleteCurrency = async (id: number): Promise<void> => {
    loading.value = true

    try {
        await CurrencyService.delete(id)
        addToast({
            type: 'success',
            message: 'Currency is successfully deleted.'
        })
        await getCurrencies()
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

const currencyToEdit = ref<Currency | undefined>(undefined)
    const setCurrencyToEdit = (currency: Currency) => {
        currencyToEdit.value = currency
    console.log("currencyToEdit.value", currencyToEdit.value)
}

const setCurrencyToBeDeleted = (currencyId: number, currencyName: string) => {
    currencyIdToBeDeleted.value = currencyId
    currencyNameToBeDeleted.value = currencyName
}

const isProceed = (proceed: boolean) => {
    if (proceed && currencyIdToBeDeleted.value) {
        deleteCurrency(currencyIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getCurrencies()
)

getCurrencies()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCurrencyModal" @click="currencyToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Currency
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
                    Currency Type
                    <select v-model="filter.currency_type" class="form-select">
                        <option value="">All types</option>
                        <option value="Gem">Gem</option>
                        <option value="Gold">Gold</option>
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
                    <button class="btn btn-success" @click.prevent="getCurrencies">
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
                            <th>Currency Type</th>
                            <th>Currency value</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="currencies.length > 0">
                            <tr class="align-middle" v-for="(currency, index) in currencies" :key="currency.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ currency.product.code }}</td>
                                <td>{{ currency.product.name }}</td>
                                <td>RM {{ currency.product.price_real }}</td>
                                <td>
                                    {{ (currency.product.price_game != null || currency.product.price_game_type != null) ? currency.product.price_game + ' ' + currency.product.price_game_type : 'N/A' }}
                                </td>
                                <td>{{ currency.currency_type }}</td>
                                <td>{{ currency.currency_value }}</td>
                                <td>{{ currency.product.description }}</td>
                                <td>{{ currency.product.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addCurrencyModal" @click="setCurrencyToEdit(currency)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setCurrencyToBeDeleted(currency.id, currency.product.name)">
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

    <CurrencyCreateModal :currency="currencyToEdit" :mode="currencyToEdit ? 'update' : 'create'" 
                    @created="getCurrencies" 
                    @updated="getCurrencies" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this currency?"
        :message="`You won't be able to retrieve this ${currencyNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>