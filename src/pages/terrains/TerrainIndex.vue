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
const selectedTerrainId = ref<number>()
const selectedTerrainName = ref<string>()
const terrainDeleteType = ref<string>()

const filter = ref<{
    name: string
    description: string | null
    is_default: boolean | string
    status: string
}>({
    name: '',
    description: '',
    is_default: '',
    status: '',
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

const terrainToEdit = ref<Terrain | undefined>(undefined)
    const setTerrainToEdit = (terrain: Terrain) => {
    terrainToEdit.value = terrain
    console.log("terrainToEdit.value", terrainToEdit.value)
}

// delete terrain (tempo & permanent)
const deleteTerrain = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete terrain: ',id,' + type: ',deleteType);

    if(deleteType === "temporary") {
        try {
            await TerrainService.delete(id)
            addToast({
                type: 'success',
                message: 'Terrain is successfully deleted. Terrain stil can be restore.'
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
    } else if (deleteType === "permanent") {
        try {
            await TerrainService.permanentDelete(id)
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
    }

    loading.value = false
}

const setTerrainToBeDeleted = (terrainId: number, terrainName: string, deleteType: string) => {
    selectedTerrainId.value = terrainId
    selectedTerrainName.value = terrainName
    terrainDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedTerrainId.value && terrainDeleteType.value) {
        deleteTerrain(selectedTerrainId.value, terrainDeleteType.value)
    }
}

// Restore terrain
const restoreTerrain = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore terrain: ',id);

    try {
        await TerrainService.restore(id)
        addToast({
            type: 'success',
            message: 'Terrain is successfully restored.'
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

const setTerrainToBeRestored = (terrainId: number, terrainName: string) => {
    selectedTerrainId.value = terrainId
    selectedTerrainName.value = terrainName
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedTerrainId.value) {
        restoreTerrain(selectedTerrainId.value)
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
                    <select v-model="filter.status" class="form-select">
                        <option value="">All statuses</option>
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
                        <option value="deleted">Deleted</option>
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
                                <td :class="{'text-danger': terrain.deleted_at}">
                                    {{ terrain.deleted_at ? 'Delete' : terrain.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="terrain.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setTerrainToBeRestored(terrain.id, terrain.name)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setTerrainToBeDeleted(terrain.id, terrain.name, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addTerrainModal" @click="setTerrainToEdit(terrain)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setTerrainToBeDeleted(terrain.id, terrain.name, 'temporary')">
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

    <TerrainCreateModal :terrain="terrainToEdit" :mode="terrainToEdit ? 'update' : 'create'" 
                    @created="getTerrains" 
                    @updated="getTerrains" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this terrain?"
        :message="`You able to restore ${selectedTerrainName} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this terrain?"
        :message="`You won't be able to retrieve this ${selectedTerrainName} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this terrain?"
        :message="`Restore ${selectedTerrainName} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>