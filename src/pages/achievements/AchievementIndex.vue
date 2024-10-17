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
const achievementIdToBeDeleted = ref<number>()
const achievementNameToBeDeleted = ref<string>()

const filter = ref<{
    name: string
    description: string | null
    max_score: number | null
    reward_type: string
    reward_value: number | null
    is_active: boolean
}>({
    name: '',
    description: '',
    max_score: null,
    reward_type: '',
    reward_value: null,
    is_active: true
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

const deleteAchievement = async (id: number): Promise<void> => {
    loading.value = true

    try {
        console.log("achievement id",id);
        await AchievementService.delete(id)
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

    loading.value = false
}

const achievementToEdit = ref<Achievement | undefined>(undefined)
    const setAchievementToEdit = (achievement: Achievement) => {
    achievementToEdit.value = achievement
    console.log("achievementToEdit.value", achievementToEdit.value)
}

const setAchievementToBeDeleted = (achievementId: number, achievementName: string) => {
    achievementIdToBeDeleted.value = achievementId
    achievementNameToBeDeleted.value = achievementName
}

const isProceed = (proceed: boolean) => {
    if (proceed && achievementIdToBeDeleted.value) {
        deleteAchievement(achievementIdToBeDeleted.value)
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
                    <select v-model="filter.is_active" class="form-select">
                        <option value="">All statuses</option>
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
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
                            <th>Reward Type</th>
                            <th>Reward Value</th>
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
                                <td>{{ achievement.reward_type }}</td>
                                <td>{{ achievement.reward_value }}</td>
                                <td>{{ achievement.is_active ? 'Active' : 'Inactive' }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addAchievementModal" @click="setAchievementToEdit(achievement)">
                                            <BaseIcon name="pencil" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setAchievementToBeDeleted(achievement.id, achievement.name)">
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

    <AchievementCreateModal :achievement="achievementToEdit" :mode="achievementToEdit ? 'update' : 'create'" 
                    @created="getAchievements" 
                    @updated="getAchievements" />

    <AchievementCreateModal @created="getAchievements" />
    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${achievementNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>