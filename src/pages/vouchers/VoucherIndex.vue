<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import VoucherService from '@/services/VoucherService'
import VoucherCreateModal from '@/pages/vouchers/VoucherCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Voucher from '@/types/Voucher'
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

const vouchers = ref<Array<Voucher>>([])
const voucherIdToBeDeleted = ref<number>()
const voucherNameToBeDeleted = ref<string>()

const filter = ref<{
    name: string
    description: string
    // min_price: number
    is_percentage_flatprice: boolean
    is_active: boolean
    // discount_value: number
}>({
    name: '',
    description: '',
    is_percentage_flatprice: true,
    is_active: true,
})

const getVouchers = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await VoucherService.index(query)
        console.log("responseVoucherService.index", response);
        vouchers.value = response.data.data
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

const deleteVoucher = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("voucher id",id);
        await VoucherService.delete(id)
        addToast({
            type: 'success',
            message: 'Voucher is successfully deleted.'
        })
        await getVouchers()
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

const setVoucherToBeDeleted = (voucherId: number, voucherName: string) => {
    voucherIdToBeDeleted.value = voucherId
    voucherNameToBeDeleted.value = voucherName
}

const isProceed = (proceed: boolean) => {
    if (proceed && voucherIdToBeDeleted.value) {
        deleteVoucher(voucherIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getVouchers()
)

getVouchers()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVoucherModal">
                        <BaseIcon name="user-plus" />
                        Add Voucher
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
                    Percentage or Flat Price
                    <select v-model="filter.is_percentage_flatprice" class="form-select">
                        <option value=""></option>
                        <option :value="true">Percentage</option>
                        <option :value="false">Flat Price</option>
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
                    <button class="btn btn-success" @click.prevent="getVouchers">
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
                            <th>Name</th>
                            <th>Description</th>
                            <th>Min Price</th>
                            <th>Percentage or Flat Price</th>
                            <th>Discount Value</th>
                            <th>Expired after(day)</th>
                            <th>Maximum user</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Is Active</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="vouchers.length > 0">
                            <tr class="align-middle" v-for="(voucher, index) in vouchers" :key="voucher.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ voucher.name }}</td>
                                <td>{{ voucher.description }}</td>
                                <td>{{ voucher.min_price }}</td>
                                <td>{{ voucher.is_percentage_flatprice ? 'Percentage-based' : 'Flat price' }}</td>
                                <td>{{ voucher.discount_value }}</td>
                                <td>{{ voucher.expired_time }}</td>
                                <td>{{ voucher.max_claim }}</td>
                                <td>{{ voucher.start_date }}</td>
                                <td>{{ voucher.end_date }}</td>
                                <td>{{ voucher.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setVoucherToBeDeleted(voucher.id, voucher.name)">
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

    <VoucherCreateModal @created="getVouchers" />
    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${voucherNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>