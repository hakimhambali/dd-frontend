<script setup lang="ts">
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'

interface Input {
    name: string
    email: string
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    email: '',
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const addUser = async () => {
    isAdding.value = true

    try {
        await UserService.store(input.value)

        addToast({
            type: 'success',
            title: 'Success',
            message: `User ${input.value.name} is successfully added.`,
        })

        document.getElementById('closeAddUserModalButton')?.click()

        emit('created')
        clearInput()
    } catch (error) {

    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.email = ''
}

</script>

<template>
    <BaseModal modal-id="addUserModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New User</h1>
            <button type="button" id="closeAddUserModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="addUserForm" @submit.prevent="addUser">
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name">
                <input type="email" name="email" class="form-control mb-3" placeholder="Email" v-model="input.email">
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="addUserForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>