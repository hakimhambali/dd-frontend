<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import LeaderboardService from '@/services/LeaderboardService'
import { useToastStore } from '@/stores/toast'
import type Leaderboard from '@/types/Leaderboard'
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

const leaderboards = ref<Array<Leaderboard>>([])

const filter = ref<{
    username: string
    country: string
    score: number | null
}>({
    username: '',
    country: '',
    score: null,
})

const getLeaderboards = async () => {
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
        const response = await LeaderboardService.index(query)
        console.log("responseLeaderboardService.index", response);
        leaderboards.value = response.data.data
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

watch(
    () => metaPageTriggered.value,
    () => getLeaderboards()
)

getLeaderboards()
</script>

<template>
    <div class="card">
        <div class="card-body">

            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Username
                    <input v-model="filter.username" type="text" class="form-control" placeholder="Username">
                </div>
                <div class="col-12 col-md-auto">
                    Country
                    <input v-model="filter.country" type="text" class="form-control" placeholder="Country">
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <br>
                    <button class="btn btn-success" @click.prevent="getLeaderboards">
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
                            <th>Username</th>
                            <th>Country</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="leaderboards.length > 0">
                            <tr class="align-middle" v-for="(leaderboard, index) in leaderboards" :key="leaderboard.id">
                                <td>{{ leaderboard.id }}</td>
                                <td>{{ leaderboard.game_user.username }}</td>
                                <td>{{ leaderboard.game_user.country }}</td>
                                <td>{{ leaderboard.score }}</td>
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
</template>