<!-- src/routes/dashboard/receipts/+page.svelte -->
<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { receipts, count, page, perPage, query } = $derived(data);

	let searchInput = $state(query);
	let container: HTMLDivElement;

	let debounceTimer: number;

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(window.location.href);
			url.searchParams.set('query', searchInput ?? '');
			url.searchParams.set('page', '1'); // Reset to first page on new search
			goto(url, { replaceState: true, keepFocus: true });
		}, 300);
	}

	function changePage(newPage: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', newPage.toString());
		goto(url, { replaceState: true });
	}

	afterNavigate(() => {
		container?.querySelector('input')?.focus();
	});

	/**
	 * Appends the correct ordinal suffix (st, nd, rd, th) to a day number.
	 */
	function getOrdinalSuffix(d: number) {
		if (d > 3 && d < 21) return 'th';
		switch (d % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	/**
	 * Formats a date string into a more readable format like "Tuesday 12th June".
	 */
	function formatPrettyDate(dateString: string | null) {
		if (!dateString) return 'No Date';
		const date = new Date(dateString);
		const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
		const month = date.toLocaleDateString('en-GB', { month: 'long' });
		const day = date.getDate();
		return `${weekday} ${day}${getOrdinalSuffix(day)} ${month}`;
	}

	let totalPages = $derived(Math.ceil(count / perPage));
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center">
		<div>
			<h1 class="text-2xl font-bold">All Receipts</h1>
			<p class="text-muted-foreground">Browse and search all your uploaded receipts.</p>
		</div>
	</div>

	<div bind:this={container} class="max-w-xl">
		<Input
			type="text"
			placeholder="Search by store name..."
			class="w-full p-6 text-lg"
			bind:value={searchInput}
			oninput={handleSearchInput}
		/>
	</div>

	<Card.Root>
		<Card.Content class="px-0 pt-0 md:px-6 md:pt-6">
			<!-- Mobile-friendly List View -->
			<div class="block md:hidden">
				{#if receipts.length > 0}
					{#each receipts as receipt (receipt.id)}
						<a
							href={`/dashboard/receipt/${receipt.id}`}
							class="block border-b p-6 transition-colors last:border-b-0 hover:bg-muted/50"
						>
							<div class="flex items-center justify-between">
								<span class="font-semibold">{receipt.store_name}</span>
								<span class="font-mono text-lg font-bold">€{(receipt.total ?? 0).toFixed(2)}</span>
							</div>
							<div class="text-muted-foreground mt-1 text-sm">
								{formatPrettyDate(receipt.purchase_date)}
							</div>
						</a>
					{/each}
				{:else}
					<div class="h-24 text-center flex items-center justify-center">No receipts found.</div>
				{/if}
			</div>

			<!-- Desktop Table View -->
			<div class="hidden md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row gridCols="grid-cols-[50%_25%_25%]">
							<Table.Head>Store</Table.Head>
							<Table.Head class="text-right">Total</Table.Head>
							<Table.Head class="text-right">Date</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if receipts.length > 0}
							{#each receipts as receipt (receipt.id)}
								<Table.Row
									class="cursor-pointer"
									gridCols="grid-cols-[50%_25%_25%]"
									onclick={() => goto(`/dashboard/receipt/${receipt.id}`)}
								>
									<Table.Cell class="font-medium">{receipt.store_name}</Table.Cell>
									<Table.Cell class="text-right font-mono"
										>€{(receipt.total ?? 0).toFixed(2)}</Table.Cell
									>
									<Table.Cell class="text-right">
										{formatPrettyDate(receipt.purchase_date)}
									</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell colspan="3" class="h-24 text-center">
									No receipts found.
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
		{#if count > perPage}
			<Card.Footer class="border-t px-6 py-4">
				<div class="text-muted-foreground text-xs">
					Showing
					<strong
						>{Math.min((page - 1) * perPage + 1, count)}-{Math.min(
							page * perPage,
							count
						)}</strong
					>
					of
					<strong>{count}</strong>
					receipts.
				</div>
				<div class="ml-auto flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onclick={() => changePage(page - 1)}
					>
						<ArrowLeft class="mr-2 h-4 w-4" />
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages}
						onclick={() => changePage(page + 1)}
					>
						Next
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</div>
			</Card.Footer>
		{/if}
	</Card.Root>
</main>