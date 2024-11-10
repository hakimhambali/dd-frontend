<script setup lang="ts">
import SkinService from '@/services/SkinService'
import { useToastStore } from '@/stores/toast'
import { SkinTypeNameEnum } from '@/enums/SkinTypeEnum'
import { GameCurrencyNameEnum } from '@/enums/GameCurrencyEnum'
import type Skin from '@/types/Skin';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    skin: {
        type: Object as () => Partial<Skin>,
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
    name: props.skin.product?.name || '',
    description: props.skin.product?.description || '',
    price_real: props.skin.product?.price_real || null,
    price_game: props.skin.product?.price_game || null,
    price_game_type: props.skin.product?.price_game_type || '',
    skin_type: props.skin.skin_type || SkinTypeNameEnum.SKATEBOARD,
    is_active: props.skin.product?.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const price_game_types = Object.values(GameCurrencyNameEnum)
const skinTypes = Object.values(SkinTypeNameEnum)

watch(
    () => props.skin,
    (newSkin) => {
        input.value = {
            name: newSkin.product?.name || '',
            description: newSkin.product?.description || '',
            price_real: newSkin.product?.price_real || null,
            price_game: newSkin.product?.price_game || null,
            price_game_type: newSkin.product?.price_game_type || '',
            skin_type: newSkin.skin_type || SkinTypeNameEnum.SKATEBOARD,
            is_active: newSkin.product?.is_active ?? true
        }
    },
    { immediate: true }
)

watch(
    () => input.value.price_game,
    (newPriceGame) => {
        const gameTypeInput = document.getElementById('game_type') as HTMLSelectElement;
        if (newPriceGame) {
            gameTypeInput.setAttribute('required', 'true');
        } else {
            gameTypeInput.removeAttribute('required');
        }
    }
)

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.skin.id !== undefined) {
            await SkinService.update(props.skin.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Skin ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await SkinService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Skin ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddSkinModalButton')?.click()
        clearInput()

    } catch (error) {
        console.error("Error in operation:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: `Failed to process. ${error.response.data.message}`,
        })
    }
    isProcessing.value = false
}

const clearInput = () => {
    input.value = {
        name: '',
        description: '',
        price_real: null,
        price_game: null,
        price_game_type: '',
        skin_type: SkinTypeNameEnum.SKATEBOARD,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addSkinModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Skin' : 'Add New Skin' }}</h1>
            <button type="button" id="closeAddSkinModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

            <form action="" id="skinForm" @submit.prevent="handleSubmit">
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Name*
                        <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Price Real*
                        <input type="number" name="price_real" class="form-control mb-3" placeholder="Price Real" v-model="input.price_real" required step="0.01" min="0.01">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Price Game
                        <input type="number" name="price_game" class="form-control mb-3" placeholder="Price Game" v-model="input.price_game" min="1">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Price Game Type
                        <select name="price_game_type" class="form-select mb-3" v-model="input.price_game_type" id="game_type">
                            <option value="">Select Price Game Type</option>
                            <option v-for="price_game_type in price_game_types" :key="price_game_type" :value="price_game_type">
                                {{ price_game_type }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Description
                        <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Skin Type*
                        <select name="skin_type" class="form-select mb-3" v-model="input.skin_type" required>
                            <option v-for="skin_type in skinTypes" :key="skin_type" :value="skin_type">
                                {{ skin_type }}
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
            <button type="submit" class="btn btn-primary" form="skinForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>