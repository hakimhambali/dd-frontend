<template>
    <div class="d-flex justify-content-between" v-if="isShowingPerPage">
        <div class="form-group row mb-3">
            <label class="form-label col col-form-label text-nowrap">Page</label>
            <select v-model.number="metaPage.perPage" class="form-select col" @change="emit('perPageUpdated')">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-3" :class="{ 'mt-3': !isShowingPerPage }"
        v-if="metaPage.total > 0">
        <div>Showing {{ metaPage.from }} to {{ metaPage.to }} of {{ metaPage.total }} entries</div>
        <ul class="pagination m-0">
            <li class="page-item" :class="{ 'disabled': metaPage.currentPage === 1 }">
                <a class="page-link" role="button" @click.prevent="emit('prevPage')">
                    <BaseIcon name="chevron-left" />
                </a>
            </li>
            <template v-for="page in pagination" :key="page">
                <li v-if="typeof (page) === 'number'" class="page-item" :class="{ 'active': metaPage.currentPage === page }">
                    <a class="page-link " role="button" @click.prevent="emit('gotoPage', page)">{{ page }}</a>
                </li>
                <li v-else class="page-item mx-1">{{ page }}</li>
            </template>
            <li class="page-item" :class="{ 'disabled': metaPage.currentPage === metaPage.lastPage }">
                <a class="page-link" role="button" @click.prevent="emit('nextPage')">
                    <BaseIcon name="chevron-right" />
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type MetaPage from '@/types/MetaPage'
import { computed } from 'vue'

const props = defineProps({
    metaPage: {
        type: Object as () => MetaPage,
        default: {
            currentPage: 0,
            perPage: 10,
            lastPage: 0,
            total: 0,
            from: 0,
            to: 0,
        },
    },
    isShowingPerPage: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['prevPage', 'nextPage', 'perPageUpdated', 'gotoPage'])

// source: https://gist.github.com/kottenator/9d936eb3e4e3c3e02598?permalink_comment_id=3238804#gistcomment-3238804
const pagination = computed(() => {
    const metaPage = props.metaPage

    const getRange = ((start: number, end: number) => {
        const arr = []

        for (let i = start; i <= end; i++) {
            arr.push(i)
        }

        return arr
    })

    const withDots = (value: number, pair: Array<number | string>) => (pages.length + 1 !== metaPage.lastPage ? pair : [value])

    let delta: number

    if (metaPage.lastPage <= 7) {
        // delta === 7: [1 2 3 4 5 6 7]
        delta = 7
    } else {
        // delta === 2: [1 ... 4 5 6 ... 10]
        // delta === 4: [1 2 3 4 5 ... 10]
        delta = metaPage.currentPage > 4 && metaPage.currentPage < metaPage.lastPage - 3 ? 2 : 4
    }

    const range = {
        start: Math.round(metaPage.currentPage - delta / 2),
        end: Math.round(metaPage.currentPage + delta / 2)
    }

    if (range.start - 1 === 1 || range.end + 1 === metaPage.lastPage) {
        range.start += 1
        range.end += 1
    }

    let pages: any =
        metaPage.currentPage > delta
            ? getRange(Math.min(range.start, metaPage.lastPage - delta), Math.min(range.end, metaPage.lastPage))
            : getRange(1, Math.min(metaPage.lastPage, delta + 1))

    if (pages[0] !== 1) {
        pages = withDots(1, [1, '...']).concat(pages)
    }

    if (pages[pages.length - 1] < metaPage.lastPage) {
        pages = pages.concat(withDots(metaPage.lastPage, ['...', metaPage.lastPage]))
    }

    return pages
})

</script>
