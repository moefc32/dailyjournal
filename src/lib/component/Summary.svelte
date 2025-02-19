<script>
    import { onMount } from 'svelte';
    import { ArrowLeft, Pen, Trash2, X } from 'lucide-svelte';
    import { Notyf } from 'notyf';
    import datePrettier from '$lib/datePrettier';

    let notyf;

    export let contents;
    export let deleteJournal;

    let previewImage = '';
    let scrollContainer;

    function handleScroll(event) {
        const maxScrollLeft =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;

        if (
            (scrollContainer.scrollLeft === 0 && event.deltaY < 0) ||
            (scrollContainer.scrollLeft >= maxScrollLeft && event.deltaY > 0)
        ) {
            return;
        }

        event.preventDefault();
        scrollContainer.scrollLeft += event.deltaY;
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_missing_attribute -->
<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
    <div class="flex items-center gap-1 w-full">
        <a href="/" class="btn btn-sm me-auto" title="Back to home page">
            <ArrowLeft size={16} /> Back to Home
        </a>
        {#if contents}
            <button
                class="btn btn-sm btn-warning"
                title="Edit this journal"
                on:click={() => (window.location.href = `/${contents.id}?edit`)}
            >
                <Pen size={16} /> Edit
            </button>
            <button
                class="btn btn-sm btn-error text-white"
                title="Delete this journal"
                on:click={() => journal_delete.showModal()}
            >
                <Trash2 size={16} /> Delete
            </button>
        {/if}
    </div>
    <div class="card flex flex-col gap-6 px-6 py-9 bg-white w-full shadow-xl">
        {#if !contents}
            <div class="p-6 text-center text-gray-500">
                - Journal not found -
            </div>
        {:else}
            <div class="flex flex-col gap-3">
                <p class="text-2xl font-semibold">
                    {contents.title}
                </p>
                <p class="text-gray-500 text-sm">
                    Published on {datePrettier(contents.createdAt)}
                </p>
            </div>
            {#if contents.documentations.length}
                <div
                    class="flex gap-3 overflow-x-auto"
                    bind:this={scrollContainer}
                    on:wheel={handleScroll}
                >
                    {#each contents.documentations as file, i}
                        <div
                            role="button"
                            class="block bg-gray-200 !w-24 min-w-24 aspect-5/4 rounded-lg overflow-hidden cursor-pointer"
                            title={`Image attachment ${i + 1}`}
                            on:click={() => {
                                previewImage = `/file/${file}`;
                                image_preview.showModal();
                            }}
                        >
                            <img
                                src={`/file/${file}`}
                                class="object-cover w-full h-full"
                            />
                        </div>
                    {/each}
                </div>
                <hr class="mt-3 mb-0 bg-gray-400 h-[1px] border-0" />
            {/if}
            <p>{contents.content}</p>
            {#if contents.updatedAt}
                <p class="text-gray-500 text-sm">
                    Updated on {datePrettier(contents.updatedAt)}
                </p>
            {/if}
        {/if}
    </div>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog id="image_preview" class="modal modal-bottom sm:modal-middle">
    <form method="dialog">
        <button class="flex justify-center items-center p-6 w-screen h-screen">
            <img
                src={previewImage}
                class="bg-white max-w-full max-h-full rounded"
                alt="Documentation"
                on:click={event => event.preventDefault()}
            />
        </button>
    </form>
</dialog>

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
