<script>
  import { toast } from "svoast";

  import Login from "$lib/component/Login.svelte";

  export let data;

  let { contents } = data;

  let login = {
    email: "",
    password: "",
    loading: false,
  };

  async function doLogin() {
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (!response.ok) throw new Error();
      window.location.href = "/";
    } catch (e) {
      login.loading = false;

      console.error(e);
      toast.error("Login failed, please try again!");
    }
  }
</script>

<main class="flex flex-col gap-6 w-full">
  <Login {login} {doLogin} />
</main>
