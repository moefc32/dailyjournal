<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Notyf } from 'notyf';
    import axios from 'axios';

    import Register from '$lib/component/Register.svelte';

    let notyf;

    export let data;

    let { contents } = data;

    let register = {
        name: '',
        email: '',
        password: '',
        loading: false,
    };

    async function doRegister() {
        register.loading = true;

        try {
            await axios.post('/register', register);

            notyf.success('New user account registered successfully.');
            await goto('/', { invalidateAll: true });
        } catch (e) {
            register.loading = false;

            console.error(e);
            notyf.error('Register failed, please try again!');
        }
    }

    onMount(async () => {
        notyf = new Notyf();
    });
</script>

<main
    class="flex flex-1 flex-col justify-center items-center gap-6 px-6 pt-6 pb-12 w-full"
>
    <Register {register} {doRegister} />
</main>
