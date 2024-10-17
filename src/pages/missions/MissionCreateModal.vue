<script setup lang="ts">
import MissionService from '@/services/MissionService'
import { useToastStore } from '@/stores/toast'
import { RewardTypeNameEnum } from '@/enums/MissionRewardTypeEnum'
import type Mission from '@/types/Mission';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    mission: {
        type: Object as () => Partial<Mission>,
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
    name: props.mission.name || '',
    description: props.mission.description || '',
    max_score: props.mission.max_score || null,
    reward_type: props.mission.reward_type || RewardTypeNameEnum.GOLD,
    reward_value: props.mission.reward_value || null,
    is_active: props.mission.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const rewardTypes = Object.values(RewardTypeNameEnum)

watch(
    () => props.mission,
    (newMission) => {
        input.value = {
            name: newMission.name || '',
            description: newMission.description || '',
            max_score: newMission.max_score || null,
            reward_type: newMission.reward_type || RewardTypeNameEnum.GOLD,
            reward_value: newMission.reward_value || null,
            is_active: newMission.is_active ?? true
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.mission.id !== undefined) {
            await MissionService.update(props.mission.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Mission ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await MissionService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Mission ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddMissionModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: 'Failed to process. An error occurred.',
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        name: '',
        description: '',
        max_score: null,
        reward_type: RewardTypeNameEnum.GOLD,
        reward_value: null,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addMissionModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Mission' : 'Add New Mission' }}</h1>
            <button type="button" id="closeAddMissionModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="missionForm" @submit.prevent="handleSubmit">
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
            <button type="submit" class="btn btn-primary" form="missionForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>