<script>
    import Summary from '$lib/component/Summary.svelte';

    export let data;

    let { contents } = data;
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    <Summary {contents} />
</main>
