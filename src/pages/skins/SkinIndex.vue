<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import SkinService from '@/services/SkinService'
import SkinCreateModal from '@/pages/skins/SkinCreateModal.vue'
import { SkinTypeNameEnum } from '@/enums/SkinTypeEnum'
import { SkinTierNameEnum } from '@/enums/SkinTierEnum'
import { useToastStore } from '@/stores/toast'
import type Skin from '@/types/Skin'
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

const skins = ref<Array<Skin>>([])
const skinIdToBeDeleted = ref<number>()
const skinNameToBeDeleted = ref<string>()

const filter = ref<{
    code: string
    name: string
    skin_type: string
    skin_tier: string
    description: string | null
    is_active: boolean
}>({
    code: '',
    name: '',
    skin_type: '',
    skin_tier: '',
    description: '',
    is_active: true,
})

const getSkins = async () => {
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
        const response = await SkinService.index(query)
        console.log("responseSkinService.index", response);
        skins.value = response.data.data
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

const deleteSkin = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("skin id",id);
        await SkinService.delete(id)
        addToast({
            type: 'success',
            message: 'Skin is successfully deleted.'
        })
        await getSkins()
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

const skinToEdit = ref<Skin | undefined>(undefined)
    const setSkinToEdit = (skin: Skin) => {
    skinToEdit.value = skin
    console.log("skinToEdit.value", skinToEdit.value)
}

const setSkinToBeDeleted = (skinId: number, skinName: string) => {
    skinIdToBeDeleted.value = skinId
    skinNameToBeDeleted.value = skinName
}

const isProceed = (proceed: boolean) => {
    if (proceed && skinIdToBeDeleted.value) {
        deleteSkin(skinIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getSkins()
)

getSkins()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSkinModal" @click="skinToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Skin
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
                    Skin Type
                    <select v-model="filter.skin_type" class="form-select">
                        <option value="">All types</option>
                        <option value="skateboard">Skateboard</option>
                        <option value="outfit">Outfit</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto">
                    Skin Tier
                    <select v-model="filter.skin_tier" class="form-select">
                        <option value="">All types</option>
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="lagendary">Lagendary</option>
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
                    <button class="btn btn-success" @click.prevent="getSkins">
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
                            <th>Skin Type</th>
                            <th>Skin Tier</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="skins.length > 0">
                            <tr class="align-middle" v-for="(skin, index) in skins" :key="skin.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ skin.product.code }}</td>
                                <td>{{ skin.product.name }}</td>
                                <td>RM {{ skin.product.price_real }}</td>
                                <td>
                                    {{ (skin.product.price_game != null || skin.product.price_game_type != null) ? skin.product.price_game + ' ' + skin.product.price_game_type : 'N/A' }}
                                </td>
                                <td>{{ skin.skin_type }}</td>
                                <td>{{ skin.skin_tier }}</td>
                                <td>{{ skin.product.description }}</td>
                                <td>{{ skin.product.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addSkinModal" @click="setSkinToEdit(skin)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setSkinToBeDeleted(skin.id, skin.product.name)">
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

    <SkinCreateModal :skin="skinToEdit" :mode="skinToEdit ? 'update' : 'create'" 
                    @created="getSkins" 
                    @updated="getSkins" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this skin?"
        :message="`You won't be able to retrieve this ${skinNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>