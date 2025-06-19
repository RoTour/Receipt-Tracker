<!-- src/routes/dashboard/upload/+page.svelte -->
<script lang="ts">
  import FileUpload from '$lib/components/FileUpload.svelte';
</script>

<main class="container mx-auto p-4 sm:p-6 lg:p-8">
  <div class="flex flex-col items-center text-center">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Upload Receipts</h1>
    <p class="mt-2 text-lg text-muted-foreground">
      Select or drag and drop your receipt images to start tracking prices.
    </p>
  </div>

  <div class="mt-8">
    <FileUpload />
  </div>
</main>
