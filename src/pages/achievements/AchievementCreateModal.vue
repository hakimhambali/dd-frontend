<script setup lang="ts">
import AchievementService from '@/services/AchievementService'
import ProductService from '@/services/ProductService'
import { useToastStore } from '@/stores/toast'
import { GameCurrencyNameEnum } from '@/enums/GameCurrencyEnum'
import type Achievement from '@/types/Achievement';
import { ref, watch, computed, onMounted } from 'vue';

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
    reward_type: props.achievement.reward_type || '',
    reward_value: props.achievement.reward_value || null,
    is_active: props.achievement.is_active || true,
    product_rewarded_id: props.achievement.product_rewarded_id || null,
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const rewardTypes = Object.values(GameCurrencyNameEnum)

const products = ref<{ id: number; code:string }[]>([]);

const fetchProducts = async () => {
    try {
        const response = await ProductService.getProducts()
        products.value = response.data;
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

onMounted(fetchProducts);

watch(
    () => props.achievement,
    (newAchievement) => {
        input.value = {
            name: newAchievement.name || '',
            description: newAchievement.description || '',
            max_score: newAchievement.max_score || null,
            reward_type: newAchievement.reward_type || '',
            reward_value: newAchievement.reward_value || null,
            is_active: newAchievement.is_active ?? true,
            product_rewarded_id: newAchievement.product_rewarded_id || null,
        }
    },
    { immediate: true }
)

watch(
    () => input.value.reward_value,
    (newRewardValue) => {
        const gameRewardInput = document.getElementById('reward_type') as HTMLSelectElement;
        if (newRewardValue) {
            gameRewardInput.setAttribute('required', 'true');
        } else {
            gameRewardInput.removeAttribute('required');
        }
    }
)

const isRewardValid = computed(() => {
    return input.value.product_rewarded_id || (input.value.reward_type && input.value.reward_value);
})

const handleSubmit = async () => {

    if (!isRewardValid.value) {
        addToast({
            type: 'warning',
            title: 'Validation Error',
            message: 'Please fill either Reward Product or both Reward Game Type and Reward Game Value.',
        })
        return;
    }

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
            message: `${error.response.data.error}. ${error.response.data.errors.name[0]}`,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        name: '',
        description: '',
        max_score: null,
        reward_type: '',
        reward_value: null,
        is_active: true,
        product_rewarded_id: null,
    }
}

</script>

<template>
    <BaseModal modal-id="addAchievementModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Achievement' : 'Add New Achievement' }}</h1>
            <button type="button" id="closeAddAchievementModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="achievementForm" @submit.prevent="handleSubmit">
                <div class="row">
                    Name*
                    <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                </div>
                <div class="row">
                    Description
                    <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Maximum Score*
                        <input type="number" name="max_score" class="form-control mb-3" placeholder="Maximum Score" v-model="input.max_score" required step="0.01" min="0.01">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Reward Game Type
                        <select name="reward_type" class="form-select mb-3" v-model="input.reward_type" id="reward_type">
                            <option value="">Select Reward Game Type</option>
                            <option v-for="reward_type in rewardTypes" :key="reward_type" :value="reward_type">
                                {{ reward_type }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Reward Game Value
                        <input type="number" name="reward_value" class="form-control mb-3" placeholder="Reward Game Value" v-model="input.reward_value" min="1">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Reward Product
                        <select v-model="input.product_rewarded_id" class="form-select mb-3">
                            <option value=null>Select Product</option>
                            <option v-for="product in products" :key="product.id" :value="product.id">
                                {{ product.code }}
                            </option>
                        </select>
                    </div>
                </div>
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