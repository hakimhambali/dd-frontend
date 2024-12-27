<script setup lang="ts">
import CurrencyService from '@/services/CurrencyService'
import { useToastStore } from '@/stores/toast'
import { GameCurrencyNameEnum } from '@/enums/GameCurrencyEnum'
import type Currency from '@/types/Currency';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    currency: {
        type: Object as () => Partial<Currency>,
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
    code: props.currency.product?.code || '',
    name: props.currency.product?.name || '',
    description: props.currency.product?.description || '',
    price_real: props.currency.product?.price_real || null,
    price_game: props.currency.product?.price_game || null,
    price_game_type: props.currency.product?.price_game_type || '',
    currency_type: props.currency.currency_type || GameCurrencyNameEnum.GEM,
    currency_value: props.currency.currency_value || null,
    is_active: props.currency.product?.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');
const price_game_types = Object.values(GameCurrencyNameEnum)

watch(
    () => props.currency,
    (newCurrency) => {
        input.value = {
            code: newCurrency.product?.code || '',
            name: newCurrency.product?.name || '',
            description: newCurrency.product?.description || '',
            price_real: newCurrency.product?.price_real || null,
            price_game: newCurrency.product?.price_game || null,
            price_game_type: newCurrency.product?.price_game_type || '',
            currency_type: newCurrency.currency_type || GameCurrencyNameEnum.GEM,
            currency_value: newCurrency.currency_value || null,
            is_active: newCurrency.product?.is_active ?? true
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
        if (isUpdateMode.value && props.currency.id !== undefined) {
            await CurrencyService.update(props.currency.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Currency ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await CurrencyService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Currency ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddCurrencyModalButton')?.click()
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
        code: '',
        name: '',
        description: '',
        price_real: null,
        price_game: null,
        price_game_type: '',
        currency_type: GameCurrencyNameEnum.GEM,
        currency_value: null,
        is_active: true
    }
}

</script>

<template>
    <BaseModal modal-id="addCurrencyModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Currency' : 'Add New Currency' }}</h1>
            <button type="button" id="closeAddCurrencyModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

            <form action="" id="currencyForm" @submit.prevent="handleSubmit">
                <div v-if="isUpdateMode" class="row">
                    Code
                    <input type="text" name="code" class="form-control mb-3" placeholder="Code" v-model="input.code" disabled>
                </div>
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
                    <div>
                        Description
                        <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Currency Type*
                        <select name="currency_type" class="form-select mb-3" v-model="input.currency_type" required>
                            <option v-for="currency_type in price_game_types" :key="currency_type" :value="currency_type">
                                {{ currency_type }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Currency Value*
                        <input type="number" name="currency_value" class="form-control mb-3" placeholder="Currency Value" v-model="input.currency_value" min="1">
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
            <button type="submit" class="btn btn-primary" form="currencyForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>