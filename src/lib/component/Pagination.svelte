<script>
    export let pages;
</script>

<div class="join">
    {#each [...Array(pages)] as _, i}
        <button class="join-item btn">1</button>
    {/each}
</div>
