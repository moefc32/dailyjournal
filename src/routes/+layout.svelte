<script>
    import '../app.css';
    import 'notyf/notyf.min.css';
    import { page } from '$app/stores';

    import Header from '$lib/component/Header.svelte';

    const noPageTitleRoutes = ['/'];

    $: isValidStatusCode = $page.status >= 200 && $page.status < 300;
</script>

<svelte:head>
    <title>
        {$page.data.pageTitle && $page.data.pageTitle + ' | '}
        {import.meta.env.VITE_APP_NAME}
    </title>
</svelte:head>

{#if !isValidStatusCode}
    <slot />
{:else}
    <div class="flex flex-1 flex-col pt-[60px] w-full">
        <Header />
        <slot />
    </div>
{/if}
