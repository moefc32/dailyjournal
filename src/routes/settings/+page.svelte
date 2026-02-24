<script>
    import { onMount } from 'svelte';
    import { Notyf } from 'notyf';
    import axios from 'axios';

    import Settings from '$lib/component/Settings.svelte';

    let notyf;

    export let data;

    let { userData } = data;

    let settings = {
        name: userData.name,
        email: userData.email,
        password: '',
        loading: false,
    };

    async function saveSettings() {
        settings.loading = true;

        try {
            await axios.patch('/settings', settings);

            notyf.success('Data saved successfully.');
            settings.loading = false;
        } catch (e) {
            settings.loading = false;

            console.error(e);
            notyf.error('Save data failed, please try again!');
        }
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
    <Settings {settings} {saveSettings} />
</main>
