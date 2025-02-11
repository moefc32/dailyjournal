<script>
  import "../app.css";
  import { page } from "$app/stores";
  import { Toasts } from "svoast";

  import Header from "$lib/component/Header.svelte";
  import Footer from "$lib/component/Footer.svelte";

  const noPageTitleRoutes = ["/"];

  $: isValidStatusCode = $page.status >= 200 && $page.status < 300;
</script>

<svelte:head>
  <title>
    {$page.data.page_title && $page.data.page_title + " | "}
    {import.meta.env.VITE_APP_NAME}
  </title>
</svelte:head>

{#if !isValidStatusCode}
  <slot />
{:else}
  <Header />
  <slot />
  <Footer />
  <Toasts />
{/if}
