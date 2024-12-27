import type Product from './Product'

export default interface Currency {
    id: number
    currency_type: string
    currency_value: number
    product: Product
}