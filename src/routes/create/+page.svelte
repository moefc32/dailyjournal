<script>
  import Editor from "$lib/component/Editor.svelte";

  export let data;

  let { contents } = data;
</script>

<main class="flex flex-col gap-6 w-full">
  <Editor />
</main>
