<script>
    import { onMount } from 'svelte';
    import { ArrowLeft, Trash2, Calendar, X, Check } from 'lucide-svelte';
    import datePrettier from '$lib/datePrettier';

    export let contents;
    export let saveJournal;
    export let deleteJournal;

    const IMAGE_UPLOAD_LIMIT =
        parseInt(import.meta.env.VITE_IMAGE_UPLOAD_LIMIT, 10) || 10;

    let fileInput;
    let dragging = false;
    let previewImage = '';
    let isLoading = false;
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

    function handleDrop(event) {
        event.preventDefault();
        dragging = false;

        const droppedFiles = Array.from(event.dataTransfer.files);
        processFiles(droppedFiles);
    }

    function handleDragEnter() {
        dragging = true;
    }

    function handleDragLeave() {
        dragging = false;
    }

    function handleFileSelect(event) {
        let selectedFiles = Array.from(event.target.files);

        if (
            contents.uploaded.length +
                contents.files.length +
                selectedFiles.length >
            IMAGE_UPLOAD_LIMIT
        ) {
            selectedFiles = selectedFiles.slice(
                0,
                IMAGE_UPLOAD_LIMIT -
                    (contents.uploaded.length + contents.files.length),
            );
        }

        processFiles(selectedFiles);
    }

    function deleteUploadedImage(file) {
        const filtered = contents.uploaded.filter(item => item !== file);

        contents.deleted = [...contents.deleted, file];
        contents.uploaded = filtered;
    }

    function processFiles(newFiles) {
        newFiles = newFiles.filter(file => file.type.startsWith('image/'));
        contents.files = [...contents.files, ...newFiles];
    }

    function removeFile(index) {
        contents.files = contents.files.filter((_, i) => i !== index);
    }

    function preventDefaults(event) {
        event.preventDefault();
    }

    function openFileDialog() {
        fileInput.click();
    }

    onMount(() => {
        document.addEventListener('dragover', preventDefaults);
        document.addEventListener('drop', preventDefaults);
    });
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_missing_attribute -->
<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
    <div class="flex items-center gap-1 w-full">
        {#if !contents}
            <a
                href="/"
                class="btn btn-sm me-auto {contents.loading && 'btn-disabled'}"
                title="Back to home page"
            >
                <ArrowLeft size={16} /> Back to Home
            </a>
        {:else}
            <a
                href={contents.id}
                class="btn btn-sm me-auto {contents.loading && 'btn-disabled'}"
                title="Cancel edit and back to journal detail"
            >
                <ArrowLeft size={16} /> Cancel Edit
            </a>
            <button
                class="btn btn-sm btn-outline btn-error {contents.loading ||
                    'hover:text-white'}"
                title="Delete this journal"
                disabled={contents.loading}
                on:click={() => journal_delete.showModal()}
            >
                <Trash2 size={16} /> Delete
            </button>
        {/if}
    </div>
    <div class="card flex flex-col gap-6 p-6 bg-white w-full shadow-xl">
        <div class="flex flex-col gap-3">
            <input
                type="text"
                class="input input-lg input-bordered w-full"
                placeholder="Journal title"
                bind:value={contents.title}
            />
            <div class="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar size={12} />
                Published on {datePrettier(contents.createdAt)}
            </div>
        </div>
        {#if contents.uploaded.length + contents.files.length < IMAGE_UPLOAD_LIMIT}
            <button
                class="card block p-9 {dragging &&
                    'bg-gray-100'} text-center border-2 border-dashed border-gray-300 hover:border-gray-500 transition duration-300 ease-in-out cursor-pointer"
                on:click={openFileDialog}
                on:drop={handleDrop}
                on:dragover={preventDefaults}
                on:dragenter={handleDragEnter}
                on:dragleave={handleDragLeave}
            >
                {#if dragging}
                    Drop your image(s) here
                {:else}
                    Drag & drop image(s) here or click to select
                {/if}
            </button>
        {/if}
        {#if contents.uploaded.length || contents.files.length}
            <div
                class="flex gap-3 overflow-x-auto"
                bind:this={scrollContainer}
                on:wheel={handleScroll}
            >
                {#each contents.uploaded as file, i}
                    <div
                        role="button"
                        class="relative bg-gray-200 w-24 min-w-24 aspect-5/4 rounded-lg overflow-hidden cursor-pointer"
                        title={`Uploaded image attachment ${i + 1}`}
                        on:click={() => {
                            previewImage = `/file/${file}`;
                            image_preview.showModal();
                        }}
                    >
                        <button
                            class="absolute flex justify-center items-center bg-red-500 text-white text-xs w-5 h-5 border-none rounded-full cursor-pointer top-1 right-1 shadow"
                            on:click={e => {
                                e.stopPropagation();
                                deleteUploadedImage(file);
                            }}
                        >
                            <X size={12} />
                        </button>
                        <img
                            src={`/file/${file}`}
                            class="object-cover w-full h-full"
                            alt="Upload preview"
                        />
                    </div>
                {/each}
                {#if contents.uploaded.length && contents.files.length}
                    <div
                        class="flex-1 my-3 bg-gray-400 w-[1px] min-w-[1px] max-w-[1px]"
                    ></div>
                {/if}
                {#each contents.files as file, i}
                    <div
                        role="button"
                        class="relative bg-gray-200 w-24 min-w-24 aspect-5/4 rounded-lg overflow-hidden cursor-pointer"
                        title={`New image attachment ${i + 1}`}
                        on:click={() => {
                            previewImage = URL.createObjectURL(file);
                            image_preview.showModal();
                        }}
                    >
                        <button
                            class="absolute flex justify-center items-center bg-red-500 text-white text-xs w-5 h-5 border-none rounded-full cursor-pointer top-1 right-1 shadow"
                            on:click={e => {
                                e.stopPropagation();
                                removeFile(i);
                            }}
                        >
                            <X size={12} />
                        </button>
                        <img
                            src={URL.createObjectURL(file)}
                            class="object-cover w-full h-full"
                        />
                    </div>
                {/each}
            </div>
        {/if}
        <div class="flex flex-col gap-2">
            <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                bind:this={fileInput}
                on:change={handleFileSelect}
            />
            <textarea
                class="textarea w-full resize-none"
                placeholder="Activity description"
                rows="5"
                bind:value={contents.content}
            ></textarea>
            <div class="flex items-center gap-1 mt-2">
                <button
                    class="btn self-start {!contents.title ||
                    !contents.content ||
                    contents.loading
                        ? 'bg-emerald-700 text-white/50'
                        : 'bg-emerald-600 text-white'}"
                    title="Save this journal"
                    disabled={!contents.title ||
                        !contents.content ||
                        contents.loading}
                    on:click={() => {
                        saveJournal(
                            contents.uploaded,
                            contents.deleted,
                            contents.files,
                        );
                        isLoading = true;
                    }}
                >
                    {#if contents.loading && isLoading}
                        <span class="loading loading-spinner loading-xs"></span>
                        Loading...
                    {:else}
                        <Check size={16} /> Save
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog id="image_preview" class="modal modal-bottom">
    <form method="dialog">
        <button class="w-screen h-screen">
            <div
                class="modal-box flex justify-center items-center p-0 bg-transparent shadow-none w-screen h-screen"
            >
                <img
                    src={previewImage}
                    class="bg-white max-w-full max-h-full rounded"
                    alt="Documentation"
                    on:click={event => event.preventDefault()}
                />
            </div>
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
                    on:click={() => {
                        deleteJournal(contents.id);
                    }}
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
