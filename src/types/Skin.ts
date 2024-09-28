import type Product from './Product'

export default interface Skin {
    id: number
    skin_type: string
    product: Product
}