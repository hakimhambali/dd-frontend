<script setup lang="ts">
import VoucherService from '@/services/VoucherService'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'

interface Input {
    name: string
    description: string | null
    min_price: number | null
    is_percentage_flatprice: boolean
    discount_value: number | null
    expired_time: number | null
    max_claim: number | null
    start_date: Date | null
    end_date: Date | null
    is_active: boolean
}

const emit = defineEmits(['created'])

const { addToast } = useToastStore()

const input = ref<Input>({
    name: '',
    description: null,
    min_price: null,
    is_percentage_flatprice: true,
    discount_value: null,
    expired_time: null,
    max_claim: null,
    start_date: null,
    end_date: null,
    is_active: true
})
const isAdding = ref<boolean>(false)
const isError = ref<boolean>(true)

const addVoucher = async () => {
    isAdding.value = true

    try {
        console.log("input.value", input.value);

        const response = await VoucherService.store(input.value)
        
        if (response && response.status === 201) {
            addToast({
                type: 'success',
                title: 'Success',
                message: `Voucher ${input.value.name} is successfully added.`,
            })

            document.getElementById('closeAddVoucherModalButton')?.click()

            emit('created')
            clearInput()
        } else {
            addToast({
                type: 'danger',
                title: 'Error',
                message: 'Failed to add voucher. Please try again.',
            })
        }
    } catch (error) {
        console.error("Error adding voucher:", error)
        addToast({
            type: 'danger',
            title: 'Error',
            message: 'Failed to add voucher. An error occurred.',
        })
    }

    isAdding.value = false
}

const clearInput = () => {
    input.value.name = ''
    input.value.description = null
    input.value.min_price = null
    input.value.is_percentage_flatprice = true
    input.value.discount_value
    input.value.expired_time = null,
    input.value.max_claim = null,
    input.value.start_date = null
    input.value.end_date = null
    input.value.is_active = true
}

</script>

<template>
    <BaseModal modal-id="addVoucherModal">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Voucher</h1>
            <button type="button" id="closeAddVoucherModalButton" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form action="" id="addVoucherForm" @submit.prevent="addVoucher">

                Name*
                <input type="text" name="name" class="form-control mb-3" placeholder="Name" v-model="input.name" required>

                Description
                <input type="text" name="description" class="form-control mb-3" placeholder="Description" v-model="input.description">

                Minimum price for products
                <input type="number" name="min_price" class="form-control mb-3" placeholder="Minimum Price" v-model="input.min_price" step="0.01" min="0.01">

                Discount value*
                <input type="number" name="discount_value" class="form-control mb-3" placeholder="Discount Value" v-model="input.discount_value" required step="0.01" min="0.01">

                Expired time (day) after claimed
                <input type="number" name="expired_time" class="form-control mb-3" placeholder="Expired time after claim" v-model="input.expired_time">

                Maximum user can claim
                <input type="number" name="max_claim" class="form-control mb-3" placeholder="Maximum user can claim" v-model="input.max_claim">

                <div>
                    <label for="start_date">Start Date</label>
                    <input type="date" name="start_date" class="form-control mb-3" placeholder="Start Date" v-model="input.start_date">
                </div>

                <div>
                    <label for="end_date">End Date</label>
                    <input type="date" name="end_date" class="form-control mb-3" placeholder="End Date" v-model="input.end_date">
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
            <button type="submit" class="btn btn-primary" form="addVoucherForm" :disabled="isAdding">
                <span v-if="!isAdding">Add</span>
                <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Adding...
                </span>
            </button>
        </div>
    </BaseModal>
</template>