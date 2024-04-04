import { email, helpers, required } from '@vuelidate/validators'

const rules = () => ({
    email: {
        email: helpers.withMessage(
            'The email is invalid', email
        ),
        required: helpers.withMessage(
            'Email is required', required
        )
    },
    password: {
        required: helpers.withMessage(
            'Password is required', required
        )
    }
})

export const LoginRule = rules()