import type Product from './Product'

export default interface Item {
    id: number
    item_type: string
    product: Product
}