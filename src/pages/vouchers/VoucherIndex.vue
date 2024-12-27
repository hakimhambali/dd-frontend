<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import VoucherService from '@/services/VoucherService'
import VoucherCreateModal from '@/pages/vouchers/VoucherCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Voucher from '@/types/Voucher'
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

const vouchers = ref<Array<Voucher>>([])
const selectedVoucherId = ref<number>()
const selectedVoucherName = ref<string>()
const voucherDeleteType = ref<string>()

const filter = ref<{
    name: string
    description: string | null
    is_percentage_flatprice: boolean | string
    status: string
}>({
    name: '',
    description: '',
    is_percentage_flatprice: '',
    status: '',
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

const voucherToEdit = ref<Voucher | undefined>(undefined)
    const setVoucherToEdit = (voucher: Voucher) => {
    voucherToEdit.value = voucher
    console.log("voucherToEdit.value", voucherToEdit.value)
}

// delete voucher (tempo & permanent)
const deleteVoucher = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete voucher: ',id,' + type: ',deleteType);

    if(deleteType === "temporary") {
        try {
            await VoucherService.delete(id)
            addToast({
                type: 'success',
                message: 'Voucher is successfully deleted. Voucher stil can be restore.'
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
    } else if (deleteType === "permanent") {
        try {
            await VoucherService.permanentDelete(id)
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
    }

    loading.value = false
}

const setVoucherToBeDeleted = (voucherId: number, voucherName: string, deleteType: string) => {
    selectedVoucherId.value = voucherId
    selectedVoucherName.value = voucherName
    voucherDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedVoucherId.value && voucherDeleteType.value) {
        deleteVoucher(selectedVoucherId.value, voucherDeleteType.value)
    }
}

// Restore voucher
const restoreVoucher = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore voucher: ',id);

    try {
        await VoucherService.restore(id)
        addToast({
            type: 'success',
            message: 'Voucher is successfully restored.'
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

const setVoucherToBeRestored = (voucherId: number, voucherName: string) => {
    selectedVoucherId.value = voucherId
    selectedVoucherName.value = voucherName
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedVoucherId.value) {
        restoreVoucher(selectedVoucherId.value)
    }
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
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
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVoucherModal" @click="voucherToEdit = undefined">
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
                    Discount Type
                    <select v-model="filter.is_percentage_flatprice" class="form-select">
                        <option value="">All types</option>
                        <option :value="true">Percentage</option>
                        <option :value="false">Flat Price</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto">
                    Status
                    <select v-model="filter.status" class="form-select">
                        <option value="">All statuses</option>
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
                        <option value="deleted">Deleted</option>
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
                            <th>Discount Value</th>
                            <th>Expired after Claimed (day)</th>
                            <th>Maximum user</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="vouchers.length > 0">
                            <tr class="align-middle" v-for="(voucher, index) in vouchers" :key="voucher.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ voucher.name }}</td>
                                <td>{{ voucher.description || 'N/A' }}</td>
                                <td>{{ voucher.min_price || 'No min price' }}</td>
                                <td>{{ voucher.is_percentage_flatprice ? '' : 'RM' }} {{ voucher.discount_value }} {{ voucher.is_percentage_flatprice ? '%' : '' }}</td>
                                <td>{{ voucher.expired_time || 'No expired time' }}</td>
                                <td>{{ voucher.max_claim || 'No max user' }}</td>
                                <td>{{ formatDate(voucher.start_date) }}</td>
                                <td>{{ formatDate(voucher.end_date) }}</td>
                                <td :class="{'text-danger': voucher.deleted_at}">
                                    {{ voucher.deleted_at ? 'Delete' : voucher.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="voucher.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setVoucherToBeRestored(voucher.id, voucher.name)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setVoucherToBeDeleted(voucher.id, voucher.name, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addVoucherModal" @click="setVoucherToEdit(voucher)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setVoucherToBeDeleted(voucher.id, voucher.name, 'temporary')">
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

    <VoucherCreateModal :voucher="voucherToEdit" :mode="voucherToEdit ? 'update' : 'create'" 
                    @created="getVouchers" 
                    @updated="getVouchers" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this voucher?"
        :message="`You able to restore ${selectedVoucherName} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this voucher?"
        :message="`You won't be able to retrieve this ${selectedVoucherName} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this voucher?"
        :message="`Restore ${selectedVoucherName} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>