<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import UserCreateModal from '@/pages/users/UserCreateModal.vue'
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import axios, { AxiosError } from 'axios'
import { onMounted, ref, watch } from 'vue'
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

interface User {
    id: number
    name: string
    email: string
}

const users = ref<Array<User>>([])

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
                            <th>No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="users.length > 0">
                            <tr class="align-middle" v-for="(user, index) in users" :key="user.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.email }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" @click="showUser(user.id)">
                                            <BaseIcon name="eye" />
                                        </button>
                                        <button class="btn btn-icon btn-danger" @click="deleteUser(user.id)">
                                            <BaseIcon name="trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr class="text-center">
                                <td colspan="4">No data</td>
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
</template>