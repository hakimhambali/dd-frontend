<script setup lang="ts">
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import { RoleNameEnum } from '@/enums/RoleEnum'

interface Input {
    name: string
    email: string
    role: string
    staff_no: string
    nric_passport: string
    phone_number: string
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    email: '',
    role: RoleNameEnum.ADMIN,
    staff_no: '',
    nric_passport: '',
    phone_number: '',
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const roles = Object.values(RoleNameEnum)

const addUser = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);
        await UserService.store(input.value)

        addToast({
            type: 'success',
            title: 'Success',
            message: `User ${input.value.name} is successfully added with role ${input.value.role}.`,
        })

        document.getElementById('closeAddUserModalButton')?.click()

        emit('created')
        clearInput()
    } catch (error) {
        addToast({
            type: 'danger',
            title: 'Error',
            message: `Failed to add user.`,
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.email = ''
    input.value.role = RoleNameEnum.ADMIN
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
                <input type="text" name="name" class="form-control mb-3" placeholder="Full Name" v-model="input.name">
                <input type="email" name="email" class="form-control mb-3" placeholder="Email" v-model="input.email">
                <input type="text" name="staff_no" class="form-control mb-3" placeholder="Staff No" v-model="input.staff_no">
                <input type="text" name="nric_passport" class="form-control mb-3" placeholder="IC No" v-model="input.nric_passport">
                <input type="text" name="phone_number" class="form-control mb-3" placeholder="Phone No" v-model="input.phone_number">
                <select name="role" class="form-control mb-3" v-model="input.role" required>
                    <option v-for="role in roles" :key="role" :value="role">
                        {{ role }}
                    </option>
                </select>
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