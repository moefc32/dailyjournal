<script>
  import { onMount } from "svelte";
  import { ArrowLeft, Pen, Trash2 } from "lucide-svelte";
  import { Notyf } from "notyf";
  import datePrettier from "$lib/datePrettier";

  let notyf;

  export let contents;

  async function deleteJournal(id) {
    try {
      const response = await fetch(`/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error();

      notyf.success("Journal deleted successfully.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (e) {
      console.error(e);
      notyf.error("Delete journal failed, please try again!");
    }
  }

  onMount(async () => {
    notyf = new Notyf();
  });
</script>

<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
  <div class="flex items-center gap-1 w-full">
    <a href="/" class="btn btn-sm me-auto">
      <ArrowLeft size={16} /> Back to Home
    </a>
    <button class="btn btn-sm btn-warning">
      <Pen size={16} /> Edit
    </button>
    <button
      class="btn btn-sm btn-error text-white"
      on:click={() => journal_delete.showModal()}
    >
      <Trash2 size={16} /> Delete
    </button>
  </div>
  <div class="card flex flex-col gap-6 px-6 py-9 bg-white w-full shadow-xl">
    {#if !contents}
      <div class="p-6 text-center text-gray-500">- Journal not found -</div>
    {:else}
      <div class="flex flex-col gap-3">
        <div class="text-2xl font-semibold">{contents.title}</div>
        <div class="text-gray-500 text-sm">
          {datePrettier(contents.createdAt)}
        </div>
      </div>
      {#if contents.documentations.length}
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
      {/if}
      <div>{contents.content}</div>
      {#if contents.updatedAt}
        <div class="text-gray-500 text-sm">
          Updated at {datePrettier(contents.updatedAt)}
        </div>
      {/if}
    {/if}
  </div>
</div>

<dialog id="journal_delete" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Delete Journal</h3>
    <p class="py-4">Are you sure you want to delete this journal?</p>
    <div class="modal-action mt-3">
      <form method="dialog">
        <button class="btn">Cancel</button>
        <button
          class="btn btn-error text-white"
          on:click={() => deleteJournal(contents.id)}
        >
          Delete
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
