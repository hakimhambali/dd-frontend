<script setup lang="ts">
import { LoginRule } from '@/rules/LoginRule'
import AuthService from '@/services/AuthService'
import useIsAuthStore from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type Login from '@/types/Login'
import useVuelidate from '@vuelidate/core'
import { AxiosError } from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { authUser } = useIsAuthStore()
const { addToast } = useToastStore()

const input = ref<Login>({
    email: '',
    password: ''
})
const isPasswordRevealed = ref<boolean>(false)
const isLoggingIn = ref<boolean>(false)
const isError = ref<boolean>(false)
const errorMessage = ref<string>('An error has occured.')
const inputPassword = ref<HTMLInputElement>()

const $v = useVuelidate(LoginRule, input.value)

const login = async (): Promise<void> => {
    if (!await $v.value.$validate()) {
        return
    }

    isError.value = false
    isLoggingIn.value = true

    try {
        await AuthService.getCsrfCookie()
        await AuthService.login(input.value)

        authUser()

        addToast({
            type: 'success',
            message: 'Successfully signed in.'
        })

        router.push({ name: 'home-page' })
    } catch (error) {
        isError.value = true

        if (error instanceof AxiosError) {
            if (error.response) {
                errorMessage.value = error.response.data.message
            }
        }
    }

    isLoggingIn.value = false
}

const revealPassword = () => {
    isPasswordRevealed.value = !isPasswordRevealed.value

    if (inputPassword.value) {
        inputPassword.value.type = isPasswordRevealed.value ? 'text' : 'password';
    }
}

</script>

<template>
    <div class="d-flex align-items-center justify-content-center" style="height: 100vh">
        <div class="card w-25">
            <div class="card-body">
                <div class="card-title text-center mb-3">
                    <h1>Login</h1>
                </div>
                <form @submit.prevent="login">
                    <div class="mb-3">
                        <input type="email" id="email" class="form-control" :class="{ 'is-invalid': $v.email.$error }" placeholder="Email" autocomplete="username" v-model="input.email" />
                        <div class="invalid-feedback">{{ $v.email.$error ? $v.email.$errors[0].$message : '' }}</div>
                    </div>
                    <div class="input-group input-group-flat mb-3">
                        <input type="password" class="form-control" :class="{ 'is-invalid': $v.password.$error }" placeholder="Password" autocomplete="off"
                            ref="inputPassword" :disabled="isLoggingIn" v-model="input.password">
                        <span class="input-group-text cursor-pointer">
                            <a class="link-secondary" title="Show password" data-bs-toggle="tooltip" @click="revealPassword">
                                <BaseIcon v-if="isPasswordRevealed" name="eye" />
                                <BaseIcon v-else name="eye-off" />
                            </a>
                        </span>
                        <div class="invalid-feedback">{{ $v.password.$error ? $v.password.$errors[0].$message : '' }}</div>
                    </div>
                    <BaseAlert v-if="isError" type="danger" :message="errorMessage" />
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary" :disabled="isLoggingIn">
                            <span v-if="!isLoggingIn">Log In</span>
                            <span v-else>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Logging in...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>