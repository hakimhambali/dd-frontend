<script setup lang="ts">
import MissionService from '@/services/MissionService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import { RewardTypeNameEnum } from '@/enums/MissionTypeEnum'

interface Input {
    name: string
    description: string | null
    max_score: number | null
    reward_type: RewardTypeNameEnum
    reward_value: number | null
    is_active: boolean
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    description: null,
    max_score: null,
    reward_type: RewardTypeNameEnum.GOLD,
    reward_value: null,
    is_active: true
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const rewardTypes = Object.values(RewardTypeNameEnum)

const addMission = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);

        const response = await MissionService.store(input.value)
        
        if (response && response.status === 201) {
            addToast({
                type: 'success',
                title: 'Success',
                message: `Mission ${input.value.name} is successfully added.`,
            })

            document.getElementById('closeAddMissionModalButton')?.click()

            emit('created')
            clearInput()
        } else {
            addToast({
                type: 'danger',
                title: 'Error',
                message: 'Failed to add mission. Please try again.',
            })
        }
    } catch (error) {
        console.error("Error adding mission:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: 'Failed to add mission. An error occurred.',
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.description = null
    input.value.max_score = null
    input.value.reward_type = RewardTypeNameEnum.GOLD
    input.value.reward_value = null
    input.value.is_active = true
}

</script>

<template>
    <BaseModal modal-id="addMissionModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Mission</h1>
            <button type="button" id="closeAddMissionModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="addMissionForm" @submit.prevent="addMission">

                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>

                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">

                Maximum Score*
                <input type="number" name="max_score" class="form-control mb-3" placeholder="Maximum Score" v-model="input.max_score" required step="0.01" min="0.01">

                Reward Type*
                <select name="reward_type" class="form-control mb-3" v-model="input.reward_type" required>
                    <option v-for="reward_type in rewardTypes" :key="reward_type" :value="reward_type">
                        {{ reward_type }}
                    </option>
                </select>

                Reward Value*
                <input type="number" name="reward_value" class="form-control mb-3" placeholder="Reward Value" v-model="input.reward_value" required step="0.01" min="0.01">

                <div class="form-check mb-3">
                    <input type="checkbox" id="is_active" v-model="input.is_active" class="form-check-input">
                    <label for="is_active" class="form-check-label">
                        Active
                    </label>
                </div>

            </form>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary" form="addMissionForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>