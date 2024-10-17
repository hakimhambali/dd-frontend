<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import TerrainService from '@/services/TerrainService'
import TerrainCreateModal from '@/pages/terrains/TerrainCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Terrain from '@/types/Terrain'
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

const terrains = ref<Array<Terrain>>([])
const terrainIdToBeDeleted = ref<number>()
const terrainNameToBeDeleted = ref<string>()

const filter = ref<{
    name: string
    description: string | null
    is_default: boolean | string
    is_active: boolean
}>({
    name: '',
    description: '',
    is_default: '',
    is_active: true,
})

const getTerrains = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await TerrainService.index(query)
        console.log("responseTerrainService.index", response);
        terrains.value = response.data.data
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

const deleteTerrain = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("terrain id",id);
        await TerrainService.delete(id)
        addToast({
            type: 'success',
            message: 'Terrain is successfully deleted.'
        })
        await getTerrains()
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

const terrainToEdit = ref<Terrain | undefined>(undefined)
    const setTerrainToEdit = (terrain: Terrain) => {
    terrainToEdit.value = terrain
    console.log("terrainToEdit.value", terrainToEdit.value)
}

const setTerrainToBeDeleted = (terrainId: number, terrainName: string) => {
    terrainIdToBeDeleted.value = terrainId
    terrainNameToBeDeleted.value = terrainName
}

const isProceed = (proceed: boolean) => {
    if (proceed && terrainIdToBeDeleted.value) {
        deleteTerrain(terrainIdToBeDeleted.value)
    }
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
}

watch(
    () => metaPageTriggered.value,
    () => getTerrains()
)

getTerrains()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTerrainModal" @click="terrainToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Terrain
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
                    Default or Seasonal
                    <select v-model="filter.is_default" class="form-select">
                        <option value="">All terrains</option>
                        <option :value="true">Default</option>
                        <option :value="false">Not Default</option>
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
                    <button class="btn btn-success" @click.prevent="getTerrains">
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
                            <th>Is Default</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="terrains.length > 0">
                            <tr class="align-middle" v-for="(terrain, index) in terrains" :key="terrain.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ terrain.name }}</td>
                                <td>{{ terrain.description }}</td>
                                <td>{{ terrain.is_default ? 'Default' : 'Not Default' }}</td>
                                <td>{{ terrain.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addTerrainModal" @click="setTerrainToEdit(terrain)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setTerrainToBeDeleted(terrain.id, terrain.name)">
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

    <TerrainCreateModal :terrain="terrainToEdit" :mode="terrainToEdit ? 'update' : 'create'" 
                    @created="getTerrains" 
                    @updated="getTerrains" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${terrainNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>