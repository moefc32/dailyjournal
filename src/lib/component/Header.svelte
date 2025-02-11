<script>
  import Avatar from "./Avatar.svelte";

  async function doLogout() {
    try {
      const response = await fetch("/login", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      toast.error("Logout failed, please try again!");
    }
  }
</script>

<header class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">
      {import.meta.env.VITE_APP_NAME}
    </a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li>
        <a href="/settings">Settings</a>
      </li>
      <li>
        <button on:click={() => doLogout()}>Logout</button>
      </li>
    </ul>
  </div>
</header>
