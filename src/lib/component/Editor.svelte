<script>
    import { onMount } from 'svelte';
    import { ArrowLeft, X, Check } from 'lucide-svelte';
    import datePrettier from '$lib/datePrettier';

    export let journal;
    export let submitJournal;

    let fileInput;
    let currentTime = '';
    let dragging = false;

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

        if (journal.files.length + selectedFiles.length > 10) {
            selectedFiles = selectedFiles.slice(0, 10 - journal.files.length);
        }

        processFiles(selectedFiles);
    }

    function processFiles(newFiles) {
        newFiles = newFiles.filter(file => file.type.startsWith('image/'));
        journal.files = [...journal.files, ...newFiles];
    }

    function removeFile(index) {
        journal.files = journal.files.filter((_, i) => i !== index);
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

        function updateClock() {
            currentTime = datePrettier(Date.now(), true, false);
        }

        updateClock();
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    });
</script>

<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
    <div class="flex items-center gap-1 w-full">
        <a href="/" class="btn btn-sm">
            <ArrowLeft size={16} /> Back to Home
        </a>
    </div>
    <div class="card flex flex-col gap-6 p-6 bg-white w-full shadow-xl">
        <div class="flex flex-col gap-3">
            <input
                type="text"
                class="input input-lg input-bordered w-full"
                placeholder="Journal title"
                bind:value={journal.title}
            />
            <div class="text-gray-500 text-sm">
                {currentTime}
            </div>
        </div>
        {#if journal.files.length < 10}
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
        {#if journal.files.length}
            <div class="flex gap-3 overflow-y-auto">
                {#each journal.files as file, i}
                    <div
                        class="relative bg-gray-200 !w-24 min-w-24 aspect-square rounded-lg overflow-hidden"
                    >
                        <button
                            class="absolute flex justify-center items-center bg-red-500 text-white text-xs w-5 h-5 border-none rounded-full cursor-pointer top-1 right-1 shadow"
                            on:click={() => removeFile(i)}
                        >
                            <X size={12} />
                        </button>
                        <img
                            src={URL.createObjectURL(file)}
                            class="object-cover w-full h-full"
                            alt="Upload preview"
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
                bind:value={journal.content}
            ></textarea>
            <button
                class="btn bg-emerald-600 self-start text-white mt-2"
                title="Submit new journal"
                disabled={!journal.title || !journal.content || journal.loading}
                on:click={() => submitJournal()}
            >
                {#if journal.loading}
                    <span class="loading loading-spinner loading-xs"></span> Loading...
                {:else}
                    <Check size={16} /> Submit
                {/if}
            </button>
        </div>
    </div>
</div>
