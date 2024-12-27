<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import AchievementService from '@/services/AchievementService'
import AchievementCreateModal from '@/pages/achievements/AchievementCreateModal.vue'
import { useToastStore } from '@/stores/toast'
import type Achievement from '@/types/Achievement'
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

const achievements = ref<Array<Achievement>>([])
const selectedAchievementId = ref<number>()
const selectedAchievementName = ref<string>()
const achievementDeleteType = ref<string>()

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

const getAchievements = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await AchievementService.index(query)
        console.log("responseAchievementService.index", response);
        achievements.value = response.data.data
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

const achievementToEdit = ref<Achievement | undefined>(undefined)
    const setAchievementToEdit = (achievement: Achievement) => {
    achievementToEdit.value = achievement
    console.log("achievementToEdit.value", achievementToEdit.value)
}

// Delete achievement (tempo & permanent)
const deleteAchievement = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete achievement: ',id,' + type: ',deleteType);

    if(deleteType === "temporary") {
        try {
            await AchievementService.delete(id)
            addToast({
                type: 'success',
                message: 'Achievement is successfully deleted. Achievement stil can be restore.'
            })
            await getAchievements()
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
            await AchievementService.permanentDelete(id)
            addToast({
                type: 'success',
                message: 'Achievement is successfully deleted.'
            })
            await getAchievements()
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

const setAchievementToBeDeleted = (achievementId: number, achievementName: string, deleteType: string) => {
    selectedAchievementId.value = achievementId
    selectedAchievementName.value = achievementName
    achievementDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedAchievementId.value && achievementDeleteType.value) {
        deleteAchievement(selectedAchievementId.value, achievementDeleteType.value)
    }
}

// Restore achievement
const restoreAchievement = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore achievement: ',id);

    try {
        await AchievementService.restore(id)
        addToast({
            type: 'success',
            message: 'Achievement is successfully restored.'
        })
        await getAchievements()
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

const setAchievementToBeRestored = (achievementId: number, achievementName: string) => {
    selectedAchievementId.value = achievementId
    selectedAchievementName.value = achievementName
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedAchievementId.value) {
        restoreAchievement(selectedAchievementId.value)
    }
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY hh:mm A');
}

watch(
    () => metaPageTriggered.value,
    () => getAchievements()
)

getAchievements()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAchievementModal" @click="achievementToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add Achievement
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
                    <button class="btn btn-success" @click.prevent="getAchievements">
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
                            <th>Reward Product Code</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="achievements.length > 0">
                            <tr class="align-middle" v-for="(achievement, index) in achievements" :key="achievement.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ achievement.name }}</td>
                                <td>{{ achievement.description }}</td>
                                <td>{{ achievement.max_score }}</td>
                                <td>
                                    {{ (achievement.reward_value != null || achievement.reward_type != null) ? achievement.reward_value + ' ' + achievement.reward_type : 'N/A' }}
                                </td>
                                <td>
                                    <span v-if="achievement.product_rewarded">{{ achievement.product_rewarded.code }}</span>
                                    <span v-else>N/A</span>
                                </td>
                                <td :class="{'text-danger': achievement.deleted_at}">
                                    {{ achievement.deleted_at ? 'Delete' : achievement.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="achievement.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setAchievementToBeRestored(achievement.id, achievement.name)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setAchievementToBeDeleted(achievement.id, achievement.name, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addAchievementModal" @click="setAchievementToEdit(achievement)">
                                                <BaseIcon name="pencil" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setAchievementToBeDeleted(achievement.id, achievement.name, 'temporary')">
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

    <AchievementCreateModal :achievement="achievementToEdit" :mode="achievementToEdit ? 'update' : 'create'" 
                    @created="getAchievements" 
                    @updated="getAchievements" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this achievement?"
        :message="`You able to restore ${selectedAchievementName} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this achievement?"
        :message="`You won't be able to retrieve this ${selectedAchievementName} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this achievement?"
        :message="`Restore ${selectedAchievementName} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>