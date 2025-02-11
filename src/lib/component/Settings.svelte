<script>
  import { Eye, EyeOff, Check } from "lucide-svelte";
  import isValidEmail from "$lib/isValidEmail";

  import Avatar from "./Avatar.svelte";

  export let config;
  export let saveConfig;

  let showPassword = false;

  async function handleKeydown(event) {
    if (event.key === "Enter" && config.email && config.password) {
      saveConfig();
    }
  }
</script>

<div class="flex flex-col gap-2 w-full max-w-screen-md">
  <input
    type="email"
    class="input input-bordered w-full"
    placeholder="New email"
    bind:value={config.email}
    on:keydown={handleKeydown}
  />
  <label class="input input-bordered flex items-center gap-2 w-full">
    {#if !showPassword}
      <input
        type="password"
        class="grow"
        placeholder="New password"
        bind:value={config.password}
        on:keydown={handleKeydown}
      />
      <button
        class="-ms-8 text-black z-[100] cursor-pointer"
        title="Click to show password"
        on:click={() => (showPassword = !showPassword)}
      >
        <Eye size={18} />
      </button>
    {:else}
      <input
        type="text"
        class="grow"
        placeholder="New password"
        bind:value={config.password}
        on:keydown={handleKeydown}
      />
      <button
        class="-ms-8 text-black z-[100] cursor-pointer"
        title="Click to hide password"
        on:click={() => (showPassword = !showPassword)}
      >
        <EyeOff size={18} />
      </button>
    {/if}
  </label>
  <input
    type="text"
    class="input input-bordered w-full"
    placeholder="Notion API key"
    bind:value={config.notion_key}
    on:keydown={handleKeydown}
  />
  <input
    type="text"
    class="input input-bordered w-full"
    placeholder="Notion database ID"
    bind:value={config.notion_db}
    on:keydown={handleKeydown}
  />
  <button
    class="btn bg-blue-700 self-start text-white mt-2"
    title="Save configurations"
    disabled={!config.email || !isValidEmail(config.email) || config.loading}
    on:click={() => saveConfig()}
  >
    {#if config.loading}
      <span class="loading loading-spinner loading-xs"></span> Loading...
    {:else}
      <Check size={16} /> Save
    {/if}
  </button>
</div>
