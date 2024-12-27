<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import GameUserService from '@/services/GameUserService'
import { useToastStore } from '@/stores/toast'
import type GameUser from '@/types/GameUser'
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

const gameusers = ref<Array<GameUser>>([])
const selectedGameuserId = ref<number>()
const selectedGameuserName = ref<string>()
const gameuserDeleteType = ref<string>()

const filter = ref<{
    email: string
    username: string
    country: string
    platform: string
    register_date: Date | null;
    status: string
}>({
    email: '',
    username: '',
    country: '',
    platform: '',
    register_date: null,
    status: '',
})

const getGameUsers = async () => {
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
        const response = await GameUserService.index(query)
        console.log("responseGameUserService.index", response);
        gameusers.value = response.data.data
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

// delete user (tempo & permanent)
const deleteGameUser = async (id: number, deleteType: string): Promise<void> => {
    loading.value = true
    console.log('delete user: ',id, ' + type:', deleteType);

    if(deleteType === "temporary") {
        try {
            await GameUserService.delete(id)
            addToast({
                type: 'success',
                message: 'GameUser is successfully deleted. GameUser stil can be restore.'
            })
            await getGameUsers()
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
            await GameUserService.permanentDelete(id)
            addToast({
                type: 'success',
                message: 'GameUser is successfully deleted.'
            })
            await getGameUsers()
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

const setGameUserToBeDeleted = (gameuserId: number, gameuserName: string, deleteType: string) => {
    selectedGameuserId.value = gameuserId
    selectedGameuserName.value = gameuserName
    gameuserDeleteType.value = deleteType
}

const isProceed = (proceed: boolean) => {
    if (proceed && selectedGameuserId.value && gameuserDeleteType.value) {
        deleteGameUser(selectedGameuserId.value, gameuserDeleteType.value)
    }
}

// Restore game user
const restoreGameUser = async (id: number): Promise<void> => {
    loading.value = true
    console.log('restore user: ',id);

    try {
        await GameUserService.restore(id)
        addToast({
            type: 'success',
            message: 'GameUser is successfully restored.'
        })
        await getGameUsers()
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

const setGameUserToBeRestored = (gameuserId: number, gameuserName: string) => {
    selectedGameuserId.value = gameuserId
    selectedGameuserName.value = gameuserName
}

const isProceedRestore = (proceed: boolean) => {
    if (proceed && selectedGameuserId.value) {
        restoreGameUser(selectedGameuserId.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getGameUsers()
)

getGameUsers()
</script>

<template>
    <div class="card card-xl">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Email
                    <input v-model="filter.email" type="text" class="form-control" placeholder="Email">
                </div>
                <div class="col-12 col-md-auto">
                    Username
                    <input v-model="filter.username" type="text" class="form-control" placeholder="Username">
                </div>
                <div class="col-12 col-md-auto">
                    Country
                    <input v-model="filter.country" type="text" class="form-control" placeholder="Country">
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
                <div class="col-12 col-md-auto">
                    Register Date
                    <input v-model="filter.register_date" type="date" class="form-control" placeholder="Register Date">
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
                    <button class="btn btn-success" @click.prevent="getGameUsers">
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
                            <th>Email</th>
                            <th>Username</th>
                            <th>Date Of Birth</th>
                            <th>Country</th>
                            <th>Platform</th>
                            <th>Register Date</th>
                            <th>Total Play Time</th>
                            <th>Gem</th>
                            <th>Gold</th>
                            <th>Highest Score</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="gameusers.length > 0">
                            <tr class="align-middle" v-for="(gameuser, index) in gameusers" :key="gameuser.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ gameuser.email }}</td>
                                <td>{{ gameuser.username }}</td>
                                <td>{{ new Date(gameuser.date_of_birth).toLocaleDateString() }}</td>
                                <td>{{ gameuser.country }}</td>
                                <td>{{ gameuser.platform }}</td>
                                <td>{{ new Date(gameuser.register_date).toLocaleDateString() }}</td>
                                <td>{{ gameuser.total_play_time }} mins</td>
                                <td>{{ gameuser.gem_amount }}</td>
                                <td>{{ gameuser.gold_amount }}</td>
                                <td>{{ gameuser.highest_score }}m</td>
                                <td>{{ new Date(gameuser.last_login).toLocaleDateString() }}</td>
                                <td :class="{'text-danger': gameuser.deleted_at}">
                                    {{ gameuser.deleted_at ? 'Delete' : gameuser.is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td class="text-center">
                                    <template v-if="gameuser.deleted_at != null">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#restore-user-prompt" @click="setGameUserToBeRestored(gameuser.id, gameuser.username)">
                                                <BaseIcon name="folder-symlink" />
                                            </button>
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-permanent-prompt" @click="setGameUserToBeDeleted(gameuser.id, gameuser.username, 'permanent')">
                                                <BaseIcon name="trash" />
                                            </button>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setGameUserToBeDeleted(gameuser.id, gameuser.username, 'temporary')">
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

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You able to restore ${selectedGameuserName} on Deleted list.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="delete-user-permanent-prompt"
        type="danger"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${selectedGameuserName} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />

    <BasePrompt
        id="restore-user-prompt"
        type="danger"
        title="Are you sure you want to restore this user?"
        :message="`Restore ${selectedGameuserName} into the list.`"
        action="Restore"
        @dismiss="isProceedRestore"
    />
</template>