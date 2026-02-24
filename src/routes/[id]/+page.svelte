<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import notyf from '$lib/notyf';

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

            const { data: result } = await axios.patch(
                `/${contents.id}`,
                formData,
            );
            contents = { ...result.data };

            notyf.success('Journal saved successfully.');
            goto(`/${contents.id}`, { invalidateAll: true });
        } catch (e) {
            console.error(e);
            notyf.error('Save contents failed, please try again!');
        }

        contents.loading = false;
    }

    async function deleteJournal(id) {
        contents.loading = true;

        try {
            await axios.delete(`/${id}`);

            notyf.success('Journal deleted successfully.');
            goto('/', { invalidateAll: true });
        } catch (e) {
            contents.loading = false;

            console.error(e);
            notyf.error('Delete journal failed, please try again!');
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
