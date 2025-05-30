<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import AdService from '@/services/AdService'
import AdCreateModal from '@/pages/ads/AdCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Ad from '@/types/Ad'
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

const ads = ref<Array<Ad>>([])
const selectedAdId = ref<number>()
const selectedAdSkips = ref<number>()
const adDeleteType = ref<string>()

const filter = ref<{
    status: string
}>({
    status: '',
})

const getAds = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await AdService.index(query)
        console.log("responseAdService.index", response);
        ads.value = response.data.data
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

const adToEdit = ref<Ad | undefined>(undefined)
    const setAdToEdit = (ad: Ad) => {
    adToEdit.value = ad
    console.log("adToEdit.value", adToEdit.value)
}

// delete ad (tempo & permanent)
const deleteAd = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete ad: ',id,' + type: ',deleteType);

    if(deleteType === "temporary") {
        try {
            await AdService.delete(id)
            addToast({
                type: 'success',
                message: 'Ad is successfully deleted. Ad stil can be restore.'
            })
            await getAds()
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
            await AdService.permanentDelete(id)
            addToast({
                type: 'success',
                message: 'Ad is successfully deleted.'
            })
            await getAds()
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

const setAdToBeDeleted = (adId: number, adSkips: number, deleteType: string) => {
    selectedAdId.value = adId
    selectedAdSkips.value = adSkips
    adDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedAdId.value && adDeleteType.value) {
        deleteAd(selectedAdId.value, adDeleteType.value)
    }
}

// Restore ad
const restoreAd = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore ad: ',id);

    try {
        await AdService.restore(id)
        addToast({
            type: 'success',
            message: 'Ad is successfully restored.'
        })
        await getAds()
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

const setAdToBeRestored = (adId: number, adSkips: number) => {
    selectedAdId.value = adId
    selectedAdSkips.value = adSkips
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedAdId.value) {
        restoreAd(selectedAdId.value)
    }
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
}

watch(
    () => metaPageTriggered.value,
    () => getAds()
)

getAds()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAdModal" @click="adToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Ad
                    </button>
                </div>
            </div>

            <div class="row mb-3">
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
                    <button class="btn btn-success" @click.prevent="getAds">
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
                            <th>Skips</th>
                            <th>Real Price</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="ads.length > 0">
                            <tr class="align-middle" v-for="(ad, index) in ads" :key="ad.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ ad.skips }}</td>
                                <td>{{ ad.price_real }}</td>
                                <td :class="{'text-danger': ad.deleted_at}">
                                    {{ ad.deleted_at ? 'Delete' : ad.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="ad.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setAdToBeRestored(ad.id, ad.skips)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setAdToBeDeleted(ad.id, ad.skips, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addAdModal" @click="setAdToEdit(ad)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setAdToBeDeleted(ad.id, ad.skips, 'temporary')">
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

    <AdCreateModal :ad="adToEdit" :mode="adToEdit ? 'update' : 'create'" 
                    @created="getAds" 
                    @updated="getAds" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this ad?"
        :message="`You able to restore ${selectedAdSkips} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this ad?"
        :message="`You won't be able to retrieve this ${selectedAdSkips} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this ad?"
        :message="`Restore ${selectedAdSkips} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>