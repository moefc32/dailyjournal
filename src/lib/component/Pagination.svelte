<script>
    import { page } from '$app/stores';
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';

    export let pages;

    const range = (start, end) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i);

    $: currentPage = $page.data.page || 1;
    $: visiblePages = (() => {
        if (pages <= 7) return range(1, pages);
        if (currentPage <= 4) return [...range(1, 5), '...', pages];
        if (currentPage >= pages - 3)
            return [1, '...', ...range(pages - 4, pages)];

        return [
            1,
            '...',
            ...range(currentPage - 1, currentPage + 1),
            '...',
            pages,
        ];
    })();
</script>

<nav class="join">
    <button
        on:click={() =>
            (window.location.href =
                currentPage === 2 ? '/' : `/?page=${currentPage - 1}`)}
        class="join-item btn"
        title="Previous page"
        disabled={currentPage === 1}
    >
        <ChevronLeft size={16} />
    </button>
    {#each visiblePages as _, i}
        {#if i + 1 === '...'}
            <span class="join-item btn btn-disabled">...</span>
        {:else}
            <button
                on:click={() => {
                    if (currentPage !== i + 1) {
                        window.location.href =
                            i === 0 ? '/' : `/?page=${i + 1}`;
                    }
                }}
                class="join-item btn {currentPage === i + 1 &&
                    'btn-active cursor-default'}"
                title={`Navigate to page ${i + 1}`}
            >
                {i + 1}
            </button>
        {/if}
    {/each}
    <button
        on:click={() => (window.location.href = `/?page=${currentPage + 1}`)}
        class="join-item btn"
        title="Next page"
        disabled={currentPage === pages}
    >
        <ChevronRight size={16} />
    </button>
</nav>
