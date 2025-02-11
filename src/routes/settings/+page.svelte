<script>
  import { toast } from "svoast";

  import Settings from "$lib/component/Settings.svelte";

  export let data;

  let { contents } = data;

  let settings = {
    email: "",
    password: "",
    loading: false,
  };

  async function doSettings() {
    try {
      const response = await fetch("/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error();
      settings.loading = false;
    } catch (e) {
      settings.loading = false;

      console.error(e);
      toast.error("Save data failed, please try again!");
    }
  }
</script>

<main class="flex flex-col gap-6 w-full">
  <Settings {settings} {doSettings} />
</main>
