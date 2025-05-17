<script setup lang="ts">
import UserService from '@/services/UserService'
import { useToastStore } from '@/stores/toast'
import { RoleNameEnum } from '@/enums/RoleEnum'
import type User from '@/types/User';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    user: {
        type: Object as () => Partial<User>,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'create'
    }
})

const emit = defineEmits(['created', 'updated'])

const { addToast } = useToastStore()

const input = ref({
    full_name: props.user.profile?.full_name || '',
    email: props.user.email || '',
    role: props.user.role || RoleNameEnum.ADMIN,
    staff_no: props.user.profile?.staff_no || '',
    nric_passport: props.user.profile?.nric_passport || '',
    phone_number: props.user.profile?.phone_number || '',
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');

const roles = Object.values(RoleNameEnum)

watch(
    () => props.user,
    (newUser) => {
        input.value = {
            full_name: newUser.profile?.full_name || '',
            email: newUser.email || '',
            role: newUser.role || RoleNameEnum.ADMIN,
            staff_no: newUser.profile?.staff_no || '',
            nric_passport: newUser.profile?.nric_passport || '',
            phone_number: newUser.profile?.phone_number || '',
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.user.id !== undefined) {
            await UserService.update(props.user.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `User ${input.value.full_name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await UserService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `User ${input.value.full_name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddUserModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
        addToast({
            type: 'danger',
            title: 'Error',
            message: errorMessages,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        full_name: '',
        email: '',
        role: RoleNameEnum.ADMIN,
        staff_no:  '',
        nric_passport:  '',
        phone_number:  '',
    }
}

</script>

<template>
    <BaseModal modal-id="addUserModal" modal-size="xl">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update User' : 'Add New User' }}</h1>
            <button type="button" id="closeAddUserModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="userForm" @submit.prevent="handleSubmit">
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Full Name*
                        <input type="text" name="full_name" class="form-control mb-3" placeholder="Full Name" v-model="input.full_name" required>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Email*
                        <input type="email" name="email" class="form-control mb-3" placeholder="Email" v-model="input.email" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Staff No*
                        <input type="text" name="staff_no" class="form-control mb-3" placeholder="Staff No" v-model="input.staff_no" required>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        IC No*
                        <input type="text" name="nric_passport" class="form-control mb-3" placeholder="IC No" v-model="input.nric_passport" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Phone No*
                        <input type="text" name="phone_number" class="form-control mb-3" placeholder="Phone No" v-model="input.phone_number" required>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Role*
                        <select name="role" class="form-select mb-3" v-model="input.role" required>
                            <option v-for="role in roles" :key="role" :value="role">
                                {{ role }}
                            </option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="userForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>