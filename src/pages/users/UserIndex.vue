<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import UserCreateModal from '@/pages/users/UserCreateModal.vue'
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import type User from '@/types/User'
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

const users = ref<Array<User>>([])
const userIdToBeDeleted = ref<number>()
const userNameToBeDeleted = ref<string>()

const filter = ref<{
    name: string
}>({
    name: ''
})

const getUsers = async () => {
    loading.value = true

    const query = {
        ...{
            per_page: metaPage.value.perPage,
            page: metaPage.value.currentPage,
        },
        ...filter.value
    }

    try {
        const response = await UserService.index(query)
        users.value = response.data.data
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

const showUser = async (id: number) => {
    router.push({ name: 'users-show', params: { userId: id } })
}

const deleteUser = async (id: number): Promise<void> => {
    loading.value = true

    try {
        await UserService.delete(id)
        addToast({
            type: 'success',
            message: 'User is successfully deleted.'
        })
        await getUsers()
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

const setUserToBeDeleted = (userId: number, userName: string) => {
    userIdToBeDeleted.value = userId
    userNameToBeDeleted.value = userName
}

const isProceed = (proceed: boolean) => {
    if (proceed && userIdToBeDeleted.value) {
        deleteUser(userIdToBeDeleted.value)
    }
}

watch(
    () => metaPageTriggered.value,
    () => getUsers()
)

getUsers()
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex mb-3">
                <div class="ms-auto">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                        <BaseIcon name="user-plus" />
                        Add User
                    </button>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    <input v-model="filter.name" type="text" class="form-control" placeholder="Name">
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <button class="btn btn-success" @click.prevent="getUsers">
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
                            <th>Email</th>
                            <th>Status</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="users.length > 0">
                            <tr class="align-middle" v-for="(user, index) in users" :key="user.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ user.profile.full_name }}</td>
                                <td>{{ user.email }}</td>
                                <td>{{ user.status }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" @click="showUser(user.id)">
                                            <BaseIcon name="eye" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" data-bs-toggle="modal" data-bs-target="#delete-user-prompt" @click="setUserToBeDeleted(user.id, user.profile.full_name)">
                                            <BaseIcon name="trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr class="text-center">
                                <td colspan="5">No data</td>
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

    <UserCreateModal @created="getUsers" />
    <BasePrompt
        id="delete-user-prompt"
        type="success"
        title="Are you sure you want to delete this user?"
        :message="`You won't be able to retrieve this ${userNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>