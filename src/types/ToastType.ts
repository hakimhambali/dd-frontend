export default interface Toast {
    id?: number
    title?: string
    message: string
    type: 'success' | 'danger'
    actionType?: string
    actionText?: string
    actionUrl?: string
}
