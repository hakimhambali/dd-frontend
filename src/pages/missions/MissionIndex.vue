<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import MissionService from '@/services/MissionService'
import MissionCreateModal from '@/pages/missions/MissionCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Mission from '@/types/Mission'
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

const missions = ref<Array<Mission>>([])
const selectedMissionId = ref<number>()
const selectedMissionName = ref<string>()
const missionDeleteType = ref<string>()

const filter = ref<{
    name: string
    description: string | null
    max_score: number | null
    reward_type: string
    reward_value: number | null
    status: string
}>({
    name: '',
    description: '',
    max_score: null,
    reward_type: '',
    reward_value: null,
    status: ''
})

const getMissions = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await MissionService.index(query)
        console.log("responseMissionService.index", response);
        missions.value = response.data.data
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

const missionToEdit = ref<Mission | undefined>(undefined)
    const setMissionToEdit = (mission: Mission) => {
    missionToEdit.value = mission
    console.log("missionToEdit.value", missionToEdit.value)
}

// delete mission (tempo & permanent)
const deleteMission = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete mission: ',id,' + type: ',deleteType);

    if(deleteType === "temporary") {
        try {
            await MissionService.delete(id)
            addToast({
                type: 'success',
                message: 'Mission is successfully deleted. Mission stil can be restore.'
            })
            await getMissions()
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
            await MissionService.permanentDelete(id)
            addToast({
                type: 'success',
                message: 'Mission is successfully deleted.'
            })
            await getMissions()
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

const setMissionToBeDeleted = (missionId: number, missionName: string, deleteType: string) => {
    selectedMissionId.value = missionId
    selectedMissionName.value = missionName
    missionDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedMissionId.value && missionDeleteType.value) {
        deleteMission(selectedMissionId.value, missionDeleteType.value)
    }
}

// Restore Mission
const restoreMission = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore mission: ',id);

    try {
        await MissionService.restore(id)
        addToast({
            type: 'success',
            message: 'Mission is successfully restored.'
        })
        await getMissions()
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

const setMissionToBeRestored = (missionId: number, missionName: string) => {
    selectedMissionId.value = missionId
    selectedMissionName.value = missionName
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedMissionId.value) {
        restoreMission(selectedMissionId.value)
    }
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
}

watch(
    () => metaPageTriggered.value,
    () => getMissions()
)

getMissions()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addMissionModal" @click="missionToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Mission
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
                    Reward Type
                    <select v-model="filter.reward_type" class="form-select">
                        <option value="">All reward types</option>
                        <option value="gold">Gold</option>
                        <option value="gem">Gem</option>
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
                    <button class="btn btn-success" @click.prevent="getMissions">
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
                            <th>Max Score</th>
                            <th>Reward Value</th>
                            <!-- <th>Reward Product Code</th> -->
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="missions.length > 0">
                            <tr class="align-middle" v-for="(mission, index) in missions" :key="mission.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ mission.name }}</td>
                                <td>{{ mission.description }}</td>
                                <td>{{ mission.max_score }}</td>
                                <td>
                                    {{ (mission.reward_value != null || mission.reward_type != null) ? mission.reward_value + ' ' + mission.reward_type : 'N/A' }}
                                </td>
                                <!-- <td>
                                    <span v-if="mission.product_rewarded">{{ mission.product_rewarded.code }}</span>
                                    <span v-else>N/A</span>
                                </td> -->
                                <td :class="{'text-danger': mission.deleted_at}">
                                    {{ mission.deleted_at ? 'Delete' : mission.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="mission.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setMissionToBeRestored(mission.id, mission.name)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setMissionToBeDeleted(mission.id, mission.name, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addMissionModal" @click="setMissionToEdit(mission)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setMissionToBeDeleted(mission.id, mission.name, 'temporary')">
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

    <MissionCreateModal :mission="missionToEdit" :mode="missionToEdit ? 'update' : 'create'" 
                    @created="getMissions" 
                    @updated="getMissions" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this mission?"
        :message="`You able to restore ${selectedMissionName} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this mission?"
        :message="`You won't be able to retrieve this ${selectedMissionName} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this mission?"
        :message="`Restore ${selectedMissionName} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>