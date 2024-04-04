import { ref } from 'vue'
import type MetaPage from '@/types/MetaPage'

export default function useMetaPage() {
    const metaPage = ref<MetaPage>({
        currentPage: 1,
        perPage: 10,
        lastPage: 1,
        from: 1,
        to: 1,
        total: 0,
    })
    const metaPageTriggered = ref<number>(0) // dummy to detect function triggered

    const updateMetaPage = (meta: any) => {
        metaPage.value.currentPage = meta.current_page
        metaPage.value.lastPage = meta.last_page
        metaPage.value.from = meta.from
        metaPage.value.to = meta.to
        metaPage.value.total = meta.total
    }

    const updatePerPage = () => {
        ++metaPageTriggered.value
        metaPage.value.currentPage = 1
    }

    const prevPage = () => {
        ++metaPageTriggered.value
        metaPage.value.currentPage--
    }

    const nextPage = () => {
        ++metaPageTriggered.value
        metaPage.value.currentPage++
    }

    const gotoPage = (page: number) => {
        ++metaPageTriggered.value
        if (metaPage.value.currentPage === page) return

        metaPage.value.currentPage = page
    }

    return {
        metaPage,
        metaPageTriggered,
        updateMetaPage,
        updatePerPage,
        prevPage,
        nextPage,
        gotoPage
    }
}