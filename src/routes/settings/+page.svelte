<script>
  import { onMount } from "svelte";
  import { Notyf } from "notyf";

  import Settings from "$lib/component/Settings.svelte";

  let notyf;

  export let data;

  let { userData } = data;

  let settings = {
    name: userData.name,
    email: userData.email,
    password: "",
    loading: false,
  };

  async function saveSettings() {
    settings.loading = true;

    try {
      const response = await fetch("/settings", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error();

      notyf.success("Data saved successfully.");
      settings.loading = false;
    } catch (e) {
      settings.loading = false;

      console.error(e);
      notyf.error("Save data failed, please try again!");
    }
  }

  onMount(async () => {
    notyf = new Notyf();
  });
</script>

<main class="flex flex-1 flex-col justify-start items-center gap-6 p-6 w-full">
  <Settings {settings} {saveSettings} />
</main>
