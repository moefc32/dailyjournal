<script>
    import { goto } from '$app/navigation';
    import axios from 'axios';
    import notyf from '$lib/notyf';

    import EditorCreate from '$lib/component/EditorCreate.svelte';

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

            const { data: result } = await axios.post('/create', formData);

            notyf.success('Journal created successfully.');
            goto(`/${result.data}`);
        } catch (e) {
            journal.loading = false;

            console.error(e);
            notyf.error('Create journal failed, please try again!');
        }
    }
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    <EditorCreate {journal} {submitJournal} />
</main>
