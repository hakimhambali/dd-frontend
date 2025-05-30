<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import TransactionHistoryService from '@/services/TransactionHistoryService'
import { useToastStore } from '@/stores/toast'
import type TransactionHistory from '@/types/TransactionHistory'
import { AxiosError } from 'axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

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

const transactionHistories = ref<Array<TransactionHistory>>([])

const filter = ref<{
    username: string
    product_code: string
    product_name: string
    product_type: string
    voucher_used_name: string
    voucher_used_is_percentage_flatprice: boolean | string
    voucher_earned_name: string
    voucher_earned_is_percentage_flatprice: boolean | string
    platform: string
}>({
    username: '',
    product_code: '',
    product_name: '',
    product_type: '',
    voucher_used_name: '',
    voucher_used_is_percentage_flatprice: '',
    voucher_earned_name: '',
    voucher_earned_is_percentage_flatprice: '',
    platform: '',
})

const getTransactionHistories = async () => {
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
        const response = await TransactionHistoryService.index(query)
        console.log("responseTransactionHistoryService.index", response);
        transactionHistories.value = response.data.data
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

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
}

watch(
    () => metaPageTriggered.value,
    () => getTransactionHistories()
)

getTransactionHistories()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Username
                    <input v-model="filter.username" type="text" class="form-control" placeholder="Username">
                </div>
                <div class="col-12 col-md-auto">
                    Product Code
                    <input v-model="filter.product_code" type="text" class="form-control" placeholder="Product Code">
                </div>
                <div class="col-12 col-md-auto">
                    Voucher Used Name
                    <input v-model="filter.voucher_used_name" type="text" class="form-control" placeholder="Voucher Used Name">
                </div>
                <div class="col-12 col-md-auto">
                    Voucher Earned Name
                    <input v-model="filter.voucher_earned_name" type="text" class="form-control" placeholder="Voucher Earned Name">
                </div>
                <div class="col-12 col-md-auto">
                    Platform
                    <select v-model="filter.platform" class="form-select">
                        <option value="">All platforms</option>
                        <option value="Ios">Ios</option>
                        <option value="Android">Android</option>
                        <option value="Huawei">Huawei</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <br>
                    <button class="btn btn-success" @click.prevent="getTransactionHistories">
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
                            <th>Product Code</th>
                            <th>Total Real Price</th>
                            <th>Transaction Date</th>
                            <th>Voucher Used Name</th>
                            <th>Voucher Earned Name</th>
                            <th>Platform</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="transactionHistories.length > 0">
                            <tr class="align-middle" v-for="(transactionHistory, index) in transactionHistories" :key="transactionHistory.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ transactionHistory.game_user.username }}</td>
                                <td>{{ transactionHistory.product.code }}</td>
                                <td>
                                    <span v-if="transactionHistory.paid_price_real">RM {{ transactionHistory.paid_price_real }}</span>
                                    <span v-else>N/A</span>
                                </td>
                                <td>{{ formatDate(transactionHistory.transaction_date) }}</td>
                                <td>{{ transactionHistory.voucher_used?.name || 'N/A' }}</td>
                                <td>{{ transactionHistory.voucher_earned.name }}</td>
                                <td>{{ transactionHistory.platform }}</td>
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