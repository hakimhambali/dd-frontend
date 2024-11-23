<script setup lang="ts">
import VoucherService from '@/services/VoucherService'
import { useToastStore } from '@/stores/toast'
import type Voucher from '@/types/Voucher';
import { ref, watch, computed } from 'vue';

const props = defineProps({
    voucher: {
        type: Object as () => Partial<Voucher>,
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
    name: props.voucher.name || '',
    description: props.voucher.description || '',
    min_price: props.voucher.min_price || null,
    is_percentage_flatprice: props.voucher.is_percentage_flatprice || false,
    discount_value: props.voucher.discount_value || null,
    expired_time: props.voucher.expired_time || null,
    max_claim: props.voucher.max_claim || null,
    start_date: props.voucher.start_date || null,
    end_date: props.voucher.end_date || null,
    is_active: props.voucher.is_active || true
})

const isProcessing = ref<boolean>(false)
const isUpdateMode = computed(() => props.mode === 'update');

watch(
    () => props.voucher,
    (newVoucher) => {
        input.value = {
            name: newVoucher.name || '',
            description: newVoucher.description || '',
            min_price: newVoucher.min_price || null,
            is_percentage_flatprice: newVoucher.is_percentage_flatprice ?? false,
            discount_value: newVoucher.discount_value || null,
            expired_time: newVoucher.expired_time || null,
            max_claim: newVoucher.max_claim || null,
            start_date: newVoucher.start_date || null,
            end_date: newVoucher.end_date || null,
            is_active: newVoucher.is_active ?? true
        }
    },
    { immediate: true }
)

watch(
    () => input.value.discount_value,
    (newValue) => {
        const isPercentageChecked = input.value.is_percentage_flatprice;
        if (isPercentageChecked && newValue !== null) {
            const regex = /^\d{0,2}(\.\d{0,2})?$/;
            if (!regex.test(newValue.toString())) {
                addToast({
                    type: 'warning',
                    title: 'Invalid Format',
                    message: 'If you chose Percentage-based discount, please enter a discount value with format like "29.99".',
                });
                input.value.discount_value = null;
            }
        }
    }
);

const handleSubmit = async () => {
    isProcessing.value = true
    try {
        if (isUpdateMode.value && props.voucher.id !== undefined) {
            await VoucherService.update(props.voucher.id, input.value)
            addToast({
                type: 'success',
                title: 'Updated',
                message: `Voucher ${input.value.name} is successfully updated.`,
            })
            emit('updated')
        } else {
            const response = await VoucherService.store(input.value)
            if (response && response.status === 201) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Voucher ${input.value.name} is successfully added.`,
                })
                emit('created')
            }
        }

        document.getElementById('closeAddVoucherModalButton')?.click()
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
        min_price: null,
        is_percentage_flatprice: false,
        discount_value: null,
        expired_time: null,
        max_claim: null,
        start_date: null,
        end_date: null,
        is_active: true
    }
}


</script>

<template>
    <BaseModal modal-id="addVoucherModal" modal-size="lg">
        <div class="modal-header">
            <h1 class="modal-title fs-5">{{ isUpdateMode ? 'Update Voucher' : 'Add New Voucher' }}</h1>
            <button type="button" id="closeAddVoucherModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="voucherForm" @submit.prevent="handleSubmit">
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
                        Minimum price for products
                        <input type="number" name="min_price" class="form-control mb-3" placeholder="Minimum Price" v-model="input.min_price" step="0.01" min="0.01">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Discount value*
                        <input type="number" name="discount_value" class="form-control mb-3" placeholder="Discount Value" v-model="input.discount_value" required step="0.01" min="0.01">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        Expired time (day) after claimed
                        <input type="number" name="expired_time" class="form-control mb-3" placeholder="Expired time after claim" v-model="input.expired_time">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        Maximum user can claim
                        <input type="number" name="max_claim" class="form-control mb-3" placeholder="Maximum user can claim" v-model="input.max_claim">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        <label for="start_date">Start Date</label>
                        <input type="datetime-local" name="start_date" class="form-control mb-3" placeholder="Start Date" v-model="input.start_date">
                    </div>
                    <div class="col-md-6 col-sm-12">
                        <label for="end_date">End Date</label>
                        <input type="datetime-local" name="end_date" class="form-control mb-3" placeholder="End Date" v-model="input.end_date">
                    </div>
                </div>
                <div class="form-check mb-3">
                    <input type="checkbox" id="is_percentage_flatprice" v-model="input.is_percentage_flatprice" class="form-check-input">
                    <label for="is_percentage_flatprice" class="form-check-label">
                        Percentage
                    </label>
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
            <button type="submit" class="btn btn-primary" form="voucherForm" :disabled="isProcessing">
                <span v-if="!isProcessing">{{ isUpdateMode ? 'Update' : 'Add' }}</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ isUpdateMode ? 'Updating...' : 'Adding...' }}
                </span>
            </button>
        </div>
    </BaseModal>
</template>