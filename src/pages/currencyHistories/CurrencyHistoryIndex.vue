<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import CurrencyHistoryService from '@/services/CurrencyHistoryService'
import { useToastStore } from '@/stores/toast'
import type CurrencyHistory from '@/types/CurrencyHistory'
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

const currencyHistories = ref<Array<CurrencyHistory>>([])

const filter = ref<{
    username: string
    amount: number | null
    currency_type: string
    description: string
}>({
    username: '',
    amount: null,
    currency_type: '',
    description: '',
})

const getCurrencyHistories = async () => {
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
        const response = await CurrencyHistoryService.index(query)
        console.log("responseCurrencyHistoryService.index", response);
        currencyHistories.value = response.data.data
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

watch(
    () => metaPageTriggered.value,
    () => getCurrencyHistories()
)

getCurrencyHistories()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Currency Type
                    <select v-model="filter.currency_type" class="form-select">
                        <option value="">All currency types</option>
                        <option value="gold">Gold</option>
                        <option value="gem">Gem</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto">
                    Description
                    <input v-model="filter.description" type="text" class="form-control" placeholder="Description">
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <br>
                    <button class="btn btn-success" @click.prevent="getCurrencyHistories">
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
                            <th>Username</th>
                            <th>Amount</th>
                            <th>Currency Type</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="currencyHistories.length > 0">
                            <tr class="align-middle" v-for="(currencyHistory, index) in currencyHistories" :key="currencyHistory.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ currencyHistory.game_user.username }}</td>
                                <td>{{ currencyHistory.amount }}</td>
                                <td>{{ currencyHistory.currency_type }}</td>
                                <td>{{ currencyHistory.description }}</td>
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
</template>