<script>
  import datePrettier from "$lib/datePrettier";

  import { Plus, Search } from "lucide-svelte";

  export let contents;

  let search = {
    keyword: "",
    results: [],
    loading: false,
  };
  let searchTimeout;
  let pagination = {
    page: 1,
    limit: parseInt(import.meta.env.VITE_PAGINATION_ITEMS) || 10,
  };

  async function handleKeydown() {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      doSearch();
    }, 200);
  }

  async function doSearch() {
    search.loading = true;

    try {
      const response = await fetch(
        `/?search=${search.keyword}&page=${pagination.page}&limit=${pagination.limit}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error();

      const result = await response.json();
      search.results = result.data.row;
      search.loading = false;
    } catch (e) {
      console.error(e);
      search.loading = false;
    }
  }
</script>

<div class="flex items-center gap-3 w-full max-w-screen-sm">
  <a href="/create" class="btn bg-emerald-600 text-white">
    <Plus size={16} /> Create New Journal
  </a>
  <label class="input ms-auto w-90 max-w-full">
    <Search size={16} />
    <input
      type="search"
      class="grow"
      placeholder="Search..."
      bind:value={search.keyword}
      on:input={handleKeydown}
    />
  </label>
</div>
<div class="flex flex-col items-center gap-3 w-full max-w-screen-sm">
  {#each search.keyword ? search.results : contents.row as item, i}
    <a
      href={`/${item.id}`}
      class="card flex flex-col gap-2 p-6 bg-white w-full shadow-xl"
    >
      <span class="block text-xl font-semibold">
        {item.title}
      </span>
      <span class="text-gray-500 text-sm">{datePrettier(item.createdAt)}</span>
    </a>
  {/each}
</div>
