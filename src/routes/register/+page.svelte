<script>
  import { toast } from "svoast";

  import Register from "$lib/component/Register.svelte";

  export let data;

  let { contents } = data;

  let register = {
    email: "",
    password: "",
    loading: false,
  };

  async function doRegister() {
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(register),
      });

      if (!response.ok) throw new Error();
    } catch (e) {
      register.loading = false;

      console.error(e);
      toast.error("Register failed, please try again!");
    }
  }
</script>

<main class="flex flex-col gap-6 w-full">
  <Register {register} {doRegister} />
</main>
