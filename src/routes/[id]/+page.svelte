<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';
    import ky from 'ky';

    import EditorEdit from '$lib/component/EditorEdit.svelte';
    import Summary from '$lib/component/Summary.svelte';

    export let data;

    let { contents } = data;

    async function saveJournal(uploaded, deleted, files) {
        contents.loading = true;

        try {
            const formData = new FormData();
            formData.append('title', contents.title);
            formData.append('content', contents.content);
            uploaded.forEach(image => {
                formData.append(`documentations[]`, image);
            });
            deleted.forEach(image => {
                formData.append(`deleted[]`, image);
            });
            files.forEach(file => {
                formData.append(`files[]`, file);
            });

            const result = await ky
                .patch(`/api/journal`, {
                    searchParams: { id: contents._id },
                    body: formData,
                })
                .json();
            contents = { ...result.data };

            toast.success('Journal saved successfully.');
            await goto(`/${contents._id}`, { invalidateAll: true });
        } catch (e) {
            console.error(e);
            toast.error('Save contents failed, please try again!');
        }

        contents.loading = false;
    }

    async function deleteJournal(id) {
        contents.loading = true;

        try {
            await ky.delete('/api/journal', {
                searchParams: { id },
            });

            toast.success('Journal deleted successfully.');
            await goto('/', { invalidateAll: true });
        } catch (e) {
            contents.loading = false;

            console.error(e);
            toast.error('Delete journal failed, please try again!');
        }
    }
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    {#if $page.data.edit_mode}
        <EditorEdit {contents} {saveJournal} {deleteJournal} />
    {:else}
        <Summary {contents} {deleteJournal} />
    {/if}
</main>
