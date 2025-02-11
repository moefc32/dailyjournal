<script>
  import Page from "$lib/component/Page.svelte";

  export let data;

  let { contents } = data;
</script>

<main class="flex flex-col gap-6 w-full">
  <Page {contents} />
</main>
