<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Notyf } from 'notyf';

    import EditorEdit from '$lib/component/EditorEdit.svelte';
    import Summary from '$lib/component/Summary.svelte';

    let notyf;

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

            const response = await fetch(`/${contents.id}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (!response.ok) throw new Error();

            const result = await response.json();

            notyf.success('Journal saved successfully.');
            setTimeout(() => {
                window.location.href = `/${contents.id}`;
            }, 1500);
        } catch (e) {
            contents.loading = false;

            console.error(e);
            notyf.error('Save contents failed, please try again!');
        }
    }

    async function deleteJournal(id) {
        try {
            const response = await fetch(`/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error();

            notyf.success('Journal deleted successfully.');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (e) {
            console.error(e);
            notyf.error('Delete journal failed, please try again!');
        }
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    {#if $page.data.edit_mode}
        <EditorEdit {contents} {saveJournal} {deleteJournal} />
    {:else}
        <Summary {contents} {deleteJournal} />
    {/if}
</main>
