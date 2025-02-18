<script>
    import { onMount } from 'svelte';
    import { Notyf } from 'notyf';

    import EditorCreate from '$lib/component/EditorCreate.svelte';

    let notyf;

    let journal = {
        title: '',
        content: '',
        files: [],
        loading: false,
    };

    async function submitJournal() {
        journal.loading = true;

        try {
            const formData = new FormData();
            formData.append('title', journal.title);
            formData.append('content', journal.content);
            journal.files.forEach(file => {
                formData.append(`files[]`, file);
            });

            const response = await fetch('/create', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (!response.ok) throw new Error();

            const result = await response.json();

            notyf.success('Journal created successfully.');
            setTimeout(() => {
                window.location.href = `/${result.data.id}`;
            }, 1500);
        } catch (e) {
            journal.loading = false;

            console.error(e);
            notyf.error('Create journal failed, please try again!');
        }
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    <EditorCreate {journal} {submitJournal} />
</main>
