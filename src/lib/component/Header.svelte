<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Notyf } from "notyf";

  import Avatar from "./Avatar.svelte";

  let notyf;

  async function doLogout() {
    try {
      const response = await fetch("/login", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error();
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      notyf.error("Logout failed, please try again!");
    }
  }

  onMount(async () => {
    notyf = new Notyf();
  });
</script>

<header
  class="navbar flex justify-center bg-emerald-600 text-white px-6 h-[60px] fixed top-0 left-0 z-[1000] shadow"
>
  <div class="flex">
    <a
      href="/"
      class="site-logo flex items-center ps-11 text-2xl font-semibold h-[40px]"
    >
      {import.meta.env.VITE_APP_NAME}
    </a>
  </div>
  <div class="flex ms-auto">
    {#if $page.data.userData}
      <ul class="menu menu-horizontal px-1">
        <li>
          <a href="/settings">Settings</a>
        </li>
        <li>
          <button on:click={() => doLogout()}>Logout</button>
        </li>
      </ul>
    {/if}
  </div>
</header>

<style>
  .site-logo {
    background: url(/favicon.svg) left center no-repeat;
    background-size: 35px;
  }
</style>
