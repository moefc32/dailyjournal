<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Notyf } from 'notyf';
    import axios from 'axios';

    import Login from '$lib/component/Login.svelte';

    let notyf;

    export let data;

    let { contents } = data;

    let login = {
        email: '',
        password: '',
        loading: false,
    };

    async function doLogin() {
        login.loading = true;

        try {
            await axios.post('/login', login);

            notyf.success('You have successfully logged in.');
            await goto('/', { invalidateAll: true });
        } catch (e) {
            login.loading = false;

            console.error(e);
            notyf.error('Login failed, please try again!');
        }
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<main
    class="flex flex-1 flex-col justify-center items-center gap-6 px-6 pt-6 pb-12 w-full"
>
    <Login {login} {doLogin} />
</main>
