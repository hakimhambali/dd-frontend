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
    role: string
    email: string
    staff_no: string
    nric_passport: string
    phone_number: string
    status: string
}>({
    name: '',
    role: '',
    email: '',
    staff_no: '',
    nric_passport: '',
    phone_number: '',
    status: ''
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

    console.log("Query being sent: ", query);

    try {
        const response = await UserService.index(query)
        console.log("responseUserService.index", response);
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

// const showUser = async (id: number) => {
//     router.push({ name: 'users-show', params: { userId: id } })
// }

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

const userToEdit = ref<User | undefined>(undefined)
    const setUserToEdit = (user: User) => {
    userToEdit.value = user
    console.log("userToEdit.value", userToEdit.value)
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
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal" @click="userToEdit = undefined">
                        <BaseIcon name="user-plus" />
                        Add User
                    </button>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-auto">
                    Name
                    <input v-model="filter.name" type="text" class="form-control" placeholder="Name">
                </div>
                <div class="col-12 col-md-auto">
                    Role
                    <select v-model="filter.role" class="form-select">
                        <option value="">All Users</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="col-12 col-md-auto">
                    Email
                    <input v-model="filter.email" type="text" class="form-control" placeholder="Email">
                </div>
                <div class="col-12 col-md-auto">
                    Staff No
                    <input v-model="filter.staff_no" type="text" class="form-control" placeholder="Staff No">
                </div>
                <div class="col-12 col-md-auto">
                    IC No
                    <input v-model="filter.nric_passport" type="text" class="form-control" placeholder="IC No">
                </div>
                <div class="col-12 col-md-auto">
                    Phone No
                    <input v-model="filter.phone_number" type="text" class="form-control" placeholder="Phone No">
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <br>
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
                            <th>Role</th>
                            <th>Email</th>
                            <th>Staff No</th>
                            <th>IC No</th>
                            <th>Phone Number</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="users.length > 0">
                            <tr class="align-middle" v-for="(user, index) in users" :key="user.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ user.profile?.full_name }}</td>
                                <td>{{ user.role }}</td>
                                <td>{{ user.email }}</td>
                                <td>{{ user.profile?.staff_no }}</td>
                                <td>{{ user.profile?.nric_passport }}</td>
                                <td>{{ user.profile?.phone_number }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-icon btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal" @click="setUserToEdit(user)">
                                            <BaseIcon name="pencil" />
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
                                <td colspan="7">No data</td>
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

    <UserCreateModal :user="userToEdit" :mode="userToEdit ? 'update' : 'create'" 
                    @created="getUsers" 
                    @updated="getUsers" />

    <BasePrompt
        id="delete-user-prompt"
        type="danger"
        title="Are you sure you want to delete this admin user?"
        :message="`You won't be able to retrieve this ${userNameToBeDeleted} anymore.`"
        action="Delete"
        @dismiss="isProceed"
    />
</template>