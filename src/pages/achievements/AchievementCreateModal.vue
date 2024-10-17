<script setup lang="ts">
import AchievementService from '@/services/AchievementService'
import { useToastStore } from '@/stores/toast'
import { RewardTypeNameEnum } from '@/enums/AchievementRewardTypeEnum'
import type Achievement from '@/types/Achievement';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    achievement: {
        type: Object as () => Partial<Achievement>,
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
    name: props.achievement.name || '',
    description: props.achievement.description || '',
    max_score: props.achievement.max_score || null,
    reward_type: props.achievement.reward_type || RewardTypeNameEnum.GOLD,
    reward_value: props.achievement.reward_value || null,
    is_active: props.achievement.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const rewardTypes = Object.values(RewardTypeNameEnum)

watch(
    () => props.achievement,
    (newAchievement) => {
        input.value = {
            name: newAchievement.name || '',
            description: newAchievement.description || '',
            max_score: newAchievement.max_score || null,
            reward_type: newAchievement.reward_type || RewardTypeNameEnum.GOLD,
            reward_value: newAchievement.reward_value || null,
            is_active: newAchievement.is_active ?? true
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.achievement.id !== undefined) {
            await AchievementService.update(props.achievement.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Achievement ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await AchievementService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Achievement ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddAchievementModalButton')?.click()
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
    <BaseModal modal-id="addAchievementModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Achievement' : 'Add New Achievement' }}</h1>
            <button type="button" id="closeAddAchievementModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
                <form action="" id="achievementForm" @submit.prevent="handleSubmit">

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
            <button type="submit" class="btn btn-primary" form="achievementForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>