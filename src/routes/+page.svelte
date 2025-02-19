<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    import Journals from '$lib/component/Journals.svelte';

    export let data;

    let { contents } = data;

    onMount(() => {
        if (data.page === 1 && $page.url.searchParams.has('page')) {
            const params = new URLSearchParams($page.url.search);

            params.delete('page');
            history.replaceState(
                {},
                '',
                `${$page.url.pathname}${params.toString() ? '?' + params : ''}`,
            );
        }
    });
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    <Journals {contents} />
</main>
