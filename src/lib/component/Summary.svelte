<script>
  import datePrettier from "$lib/datePrettier";

  export let contents;
</script>

<div
  class="card flex flex-col gap-6 px-6 py-9 bg-white w-full max-w-screen-sm shadow-xl"
>
  {#if !contents}
    <div class="p-6 text-center text-gray-500">- Journal not found -</div>
  {:else}
    <div class="flex flex-col gap-3">
      <div class="text-2xl font-semibold">{contents.title}</div>
      <div class="text-gray-500 text-sm">
        {datePrettier(contents.createdAt)}
      </div>
    </div>
    <div class="flex gap-3 overflow-y-auto">
      {#each contents.documentations as file, i}
        <div
          class="relative bg-gray-200 !w-24 min-w-24 aspect-square rounded-lg overflow-hidden"
        >
          <img
            src={`/file/${file}`}
            class="object-cover w-full h-full"
            alt="Upload preview"
          />
        </div>
      {/each}
    </div>
    <hr class="mt-3 mb-0 bg-gray-300 h-[2px] border-0" />
    <div>{contents.content}</div>
  {/if}
</div>
