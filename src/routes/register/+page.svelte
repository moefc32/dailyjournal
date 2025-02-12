<script>
  import { onMount } from "svelte";
  import { Notyf } from "notyf";

  import Register from "$lib/component/Register.svelte";

  let notyf;

  export let data;

  let { contents } = data;

  let register = {
    name: "",
    email: "",
    password: "",
    loading: false,
  };

  async function doRegister() {
    register.loading = true;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(register),
      });

      if (!response.ok) throw new Error();

      notyf.success("New user account registered successfully.");

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (e) {
      register.loading = false;

      console.error(e);
      notyf.error("Register failed, please try again!");
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
