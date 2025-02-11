<script>
  import { onMount } from "svelte";

  let files = [];
  let fileInput;

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  }

  function handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
  }

  function processFiles(newFiles) {
    newFiles = newFiles.filter((file) => file.type.startsWith("image/"));
    files = [...files, ...newFiles];
  }

  function removeFile(index) {
    files = files.filter((_, i) => i !== index);
  }

  function preventDefaults(event) {
    event.preventDefault();
  }

  function openFileDialog() {
    fileInput.click();
  }

  onMount(() => {
    document.addEventListener("dragover", preventDefaults);
    document.addEventListener("drop", preventDefaults);
  });
</script>

<div class="card flex flex-col gap-6 p-6 w-full">
  <button
    class="drop-zone"
    on:click={openFileDialog}
    on:drop={handleDrop}
    on:dragover={preventDefaults}
  >
    <p>Drag & Drop images here or click to select</p>
  </button>
  <input
    type="file"
    accept="image/*"
    multiple
    bind:this={fileInput}
    on:change={handleFileSelect}
    hidden
  />
  <div class="previews">
    {#each files as file, index}
      <div class="preview">
        <img src={URL.createObjectURL(file)} alt="Preview" />
        <button class="remove-btn" on:click={() => removeFile(index)}>×</button>
      </div>
    {/each}
  </div>
  <textarea
    class="textarea w-full resize-none"
    placeholder="Activity description"
  ></textarea>
</div>

<style>
  .drop-zone {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    border-radius: 10px;
    transition: border 0.3s ease;
  }

  .drop-zone:hover {
    border-color: #666;
  }

  .previews {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
  }

  .preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
</style>
