<!-- src/lib/components/FileUpload.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fileUploadVM } from './FileUploadVM.svelte.ts';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { X } from 'lucide-svelte';
</script>

<!-- The form now has a multipart class for better layout -->
<div class="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
	<!-- Left Side: Uploader -->
	<div class="lg:w-1/2">
		<form
			use:enhance={() => {
				fileUploadVM.isSubmitting = true;
				fileUploadVM.actionResult = null;
				fileUploadVM.processedReceipts = [];

				return async ({ result }) => {
					if (result.type === 'success' && result.data?.success) {
						fileUploadVM.actionResult = { type: 'success', message: result.data.message };
						fileUploadVM.processedReceipts = result.data.receipts ?? [];
						fileUploadVM.selectedFiles = [];
					} else if (result.type === 'failure') {
						fileUploadVM.actionResult = {
							type: 'failure',
							message: result.data?.error ?? 'An unknown error occurred.'
						};
					} else if (result.type === 'error') {
						fileUploadVM.actionResult = { type: 'failure', message: result.error.message };
					}
					fileUploadVM.isSubmitting = false;
				};
			}}
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			class="w-full"
		>
			<div
				class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {fileUploadVM.isDragging
					? 'border-primary'
					: 'border-input'}"
				ondragenter={fileUploadVM.handleDragEnter}
				ondragleave={fileUploadVM.handleDragLeave}
				ondragover={(e) => e.preventDefault()}
				ondrop={fileUploadVM.handleDrop}
			>
				<Label for="file-upload" class="cursor-pointer flex flex-col items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-10 w-10 text-muted-foreground"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line
							x1="12"
							x2="12"
							y1="3"
							y2="15"
						/></svg
					>
					<span class="font-semibold">Drag and drop files here</span>
					<span class="text-sm text-muted-foreground">or click to browse</span>
				</Label>
				<Input
					type="file"
					id="file-upload"
					multiple
					class="hidden"
					onchange={fileUploadVM.handleFileSelect}
					name="receipts"
					disabled={fileUploadVM.isSubmitting}
				/>
			</div>

			{#if fileUploadVM.selectedFiles.length > 0}
				<div class="mt-6">
					<h3 class="font-semibold text-lg">Selected files:</h3>
					<ul class="mt-2 space-y-2">
						{#each fileUploadVM.selectedFiles as file, i (file.name + file.lastModified)}
							<li
								class="flex items-center justify-between p-2 rounded-md border bg-muted/20 animate-in fade-in"
							>
								<span class="font-mono text-sm truncate pr-4">{file.name}</span>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => fileUploadVM.removeFile(i)}
									aria-label="Remove file"
									disabled={fileUploadVM.isSubmitting}
								>
									<X class="h-4 w-4" />
								</Button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if fileUploadVM.selectedFiles.length > 0}
				<Button type="submit" class="mt-6 w-full" size="lg" disabled={fileUploadVM.isSubmitting}>
					{#if fileUploadVM.isSubmitting}
						<svg
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Processing...
					{:else}
						Upload {fileUploadVM.selectedFiles.length} file(s)
					{/if}
				</Button>
			{/if}
		</form>
	</div>

	<!-- Right Side: Results -->
	<div class="lg:w-1/2">
		<h2 class="text-2xl font-bold tracking-tight">Extracted Data</h2>
		<Separator class="my-4" />

		<!-- A message area to show the result of the form action -->
		{#if fileUploadVM.actionResult}
			<div
				class="mb-6 p-3 rounded-md text-sm font-medium {fileUploadVM.actionResult.type ===
				'success'
					? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
					: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}"
			>
				{fileUploadVM.actionResult.message}
			</div>
		{/if}

		{#if fileUploadVM.processedReceipts.length > 0}
			<div class="space-y-6">
				{#each fileUploadVM.processedReceipts as receipt, i (i)}
					<div class="border rounded-lg p-4 animate-in fade-in">
						<div class="flex justify-between items-start mb-3">
							<h3 class="text-lg font-semibold">{receipt.store || 'Unknown Store'}</h3>
							<span class="text-sm text-muted-foreground">{receipt.date || 'No Date'}</span>
						</div>
						<Separator />
						<ul class="my-3 space-y-1.5 text-sm">
							{#each receipt.items as item (item.name)}
								<li class="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
									<span class="truncate">{item.name}</span>
									<span class="text-muted-foreground">x{item.quantity}</span>
									<span class="font-mono text-right w-16">€{item.price.toFixed(2)}</span>
								</li>
							{/each}
						</ul>
						<Separator />
						<div class="flex justify-end items-center mt-3">
							<span class="font-bold">Total:</span>
							<span class="font-mono font-bold text-lg ml-4">
								€{(receipt.total ?? 0).toFixed(2)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{:else if !fileUploadVM.isSubmitting}
			<div class="text-center text-muted-foreground py-10">
				<p>Upload a receipt to see the extracted data here.</p>
			</div>
		{/if}
	</div>
</div>
