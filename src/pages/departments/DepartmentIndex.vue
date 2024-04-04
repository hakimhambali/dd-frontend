<script setup lang="ts">
import useMetaPage from '@/composables/meta-page'
import { ref } from 'vue'

const {
    metaPage,
    metaPageTriggered,
    updateMetaPage,
    updatePerPage,
    prevPage,
    nextPage,
    gotoPage
} = useMetaPage()

const loading = ref<boolean>(false)
const users = ref<Array<any>>([])
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
                    <input type="text" class="form-control" placeholder="Name">
                </div>
                <div class="col-12 col-md-auto me-auto">
                    <button class="btn btn-success" @click.prevent="">
                        <BaseIcon name="filter" />
                        Filter
                    </button>
                </div>
            </div>

            <Pagination :meta-page="metaPage" @prev-page="prevPage" @next-page="nextPage" @goto-page="gotoPage"
                @per-page-updated="updatePerPage" :is-showing-per-page="true" />

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
                        <template v-if="loading">
                            <tr>
                                <td>
                                    <div class="placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                    </div>
                                </td>
                                <td>
                                    <div class="placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <template v-else>
                            <template v-if="users.length > 0">
                                <tr class="align-middle" v-for="(user, index) in users" :key="user.id">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ user.name }}</td>
                                    <td>{{ user.email }}</td>
                                    <td class="text-center">
                                        <div class="btn-group">
                                            <button class="btn btn-icon btn-primary">
                                                <BaseIcon name="eye" />
                                            </button>
                                            <button class="btn btn-icon btn-danger">
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
                        </template>
                    </tbody>
                </table>
                <Pagination :meta-page="metaPage" @prev-page="prevPage" @next-page="nextPage" @goto-page="gotoPage"
                    @per-page-updated="updatePerPage" />
                <SpinnerOverlay :is-showing="loading" />
            </div>
        </div>
    </div>
</template>