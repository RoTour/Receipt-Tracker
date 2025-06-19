<!-- src/routes/dashboard/search/+page.svelte -->
<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// A local state variable to bind to the input, initialized from the URL.
	let searchQuery = $state(data.query);
	// We'll bind to a container div instead of the component directly.
	let container: HTMLDivElement;

	// --- Debounce Logic ---
	let debounceTimer: number;

	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			// Update the URL to trigger a new data load on the server.
			// `replaceState` avoids polluting the browser history.
			const url = new URL(window.location.href);
			url.searchParams.set('query', searchQuery);
			goto(url, { replaceState: true, keepFocus: true });
		}, 300); // Wait for 300ms of inactivity before searching.
	}

	// Focus the input field when the page loads for a better user experience.
	afterNavigate(() => {
		// FIX: Find the actual <input> element within our container and focus it.
		container?.querySelector('input')?.focus();
	});
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="max-w-xl">
		<h1 class="text-3xl font-bold tracking-tight">Search Products</h1>
		<p class="text-muted-foreground mt-2">
			Type a product name to see its price history across all your receipts.
		</p>
	</div>
	<!-- FIX: We bind to this container div now -->
	<div bind:this={container} class="relative mt-4 max-w-xl">
		<Input
			type="text"
			placeholder="Search for apples, milk, toothpaste..."
			class="w-full p-6 text-lg"
			bind:value={searchQuery}
			oninput={handleInput}
		/>
	</div>

	<!-- Results Table -->
	<div class="mt-8">
		{#if data.searchResults && data.searchResults.length > 0}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Product</Table.Head>
						<Table.Head>Store</Table.Head>
						<Table.Head class="text-right">Price</Table.Head>
						<Table.Head class="text-right">Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.searchResults as item (item.id)}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">{item.products?.normalized_name ?? 'N/A'}</div>
								<div class="text-muted-foreground text-xs">{item.products?.brand ?? ''}</div>
							</Table.Cell>
							<Table.Cell>{item.receipts?.stores?.name ?? 'N/A'}</Table.Cell>
							<Table.Cell class="text-right font-mono">
								<!-- Price per unit calculation -->
								€{(item.price / item.quantity).toFixed(2)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{new Date(item.receipts?.purchase_date).toLocaleDateString()}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else if data.query}
			<div class="text-muted-foreground py-10 text-center">
				<p>No results found for "{data.query}".</p>
			</div>
		{/if}
	</div>
</main>
