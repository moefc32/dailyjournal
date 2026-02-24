<script>
    import { Plus, Search, Calendar } from 'lucide-svelte';
    import axios from 'axios';
    import datePrettier from '$lib/datePrettier';
    import trimText from '$lib/trimText';

    import Pagination from './Pagination.svelte';

    const PAGINATION_ITEMS =
        parseInt(import.meta.env.VITE_PAGINATION_ITEMS, 10) || 10;

    export let contents;

    let search = {
        keyword: '',
        results: [],
        loading: false,
    };
    let searchTimeout;
    let journalPagination = {
        page: 1,
        limit: PAGINATION_ITEMS,
    };
    let searchPagination = {
        page: 1,
        limit: PAGINATION_ITEMS,
    };

    async function handleKeydown() {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            doSearch();
        }, 200);
    }

    async function navigateJournal() {
        try {
            const query = new URLSearchParams({
                ...journalPagination,
            }).toString();

            const { data: result } = await axios.get(`/?${query}`);

            contents.row = result.data.row;
            contents.total = result.data.total;
        } catch (e) {
            console.error(e);
        }
    }

    async function doSearch() {
        search.loading = true;

        try {
            const query = new URLSearchParams({
                search: trimText(search.keyword),
                ...searchPagination,
            }).toString();

            const { data: result } = await axios.get(`/?${query}`);

            search.results = result.data.row;
            search.loading = false;
        } catch (e) {
            console.error(e);
            search.loading = false;
        }
    }

    $: pages = search.keyword
        ? Math.ceil(contents.total / searchPagination.limit)
        : Math.ceil(contents.total / journalPagination.limit);
</script>

<div class="flex items-center gap-3 w-full max-w-screen-sm">
    <a
        href="/create"
        class="btn bg-emerald-600 text-white"
        title="Create new journal"
    >
        <Plus size={16} /> Create New
    </a>
    <label class="input ms-auto w-90 max-w-full">
        <Search size={16} />
        <input
            type="search"
            class="grow"
            placeholder="Search..."
            bind:value={search.keyword}
            on:input={handleKeydown}
        />
    </label>
</div>
<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
    {#if search.keyword ? !search.results.length : !contents.row.length}
        <div
            class="card flex flex-col gap-6 px-6 py-9 bg-white w-full shadow-xl"
        >
            <div
                class="{search.keyword
                    ? `bg-[url('/no-result.svg')]`
                    : `bg-[url('/no-data.svg')]`} flex flex-col justify-end items-center bg-top bg-no-repeat bg-[length:180px] text-gray-700 text-xl h-[135px]"
            >
                {#if search.keyword}
                    <span>No journal found</span>
                {:else}
                    <span>
                        No journal, why don't we <a
                            href="/create"
                            class="text-emerald-600"
                        >
                            create one
                        </a>?
                    </span>
                {/if}
            </div>
        </div>
    {:else}
        {#each search.keyword ? search.results : contents.row as item, i}
            <a
                href={`/${item.id}`}
                class="card flex flex-row gap-4 p-6 bg-white w-full shadow-xl"
                title={item.title}
            >
                <div class="flex flex-1 flex-col gap-2">
                    <p class="text-xl font-semibold line-clamp-2">
                        {item.title}
                    </p>
                    <p class="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar size={12} />
                        {datePrettier(item.createdAt)}
                    </p>
                </div>
                {#if item.documentations.length}
                    <div
                        class="relative bg-gray-200 w-20 min-w-20 aspect-5/4 rounded-lg overflow-hidden"
                    >
                        <img
                            src={`/file/${item.documentations[0].id}`}
                            class="object-cover w-full h-full"
                            alt="Visual bookmark"
                        />
                    </div>
                {/if}
            </a>
        {/each}
    {/if}
</div>
{#if pages > 1}
    <Pagination {pages} />
{/if}
