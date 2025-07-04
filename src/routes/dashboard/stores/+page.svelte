<!-- src/routes/dashboard/stores/+page.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { PlusCircle, Pencil } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	const { stores } = data;

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
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center">
		<div>
			<h1 class="text-2xl font-bold">Store Management</h1>
			<p class="text-muted-foreground">Create, view, and edit your store locations.</p>
		</div>
		<div class="ml-auto flex items-center gap-2">
			<Button href="/dashboard/stores/new" size="sm">
				<PlusCircle class="mr-2 h-4 w-4" />
				Add New Store
			</Button>
		</div>
	</div>

	<Card.Root class="py-0">
		<Card.Content class="px-0 pt-0 md:px-6 md:pt-6">
			<!-- Mobile-friendly List View -->
			<div class="block md:hidden">
				{#if stores && stores.length > 0}
					{#each stores as store (store.id)}
						<a
							href={`/dashboard/stores/${store.id}`}
							class="block border-b p-6 transition-colors last:border-b-0 hover:bg-muted/50"
							aria-label="Edit store {store.name ?? 'N/A'}"
						>
							<div class="flex items-center justify-between">
								<span class="font-semibold">{store.name ?? 'N/A'}</span>
								<Button href={`/dashboard/stores/${store.id}`} variant="outline" size="sm">
									<Pencil class="mr-2 h-4 w-4" />
									Edit
								</Button>
							</div>
							<div class="text-muted-foreground mt-1 text-sm">
								{store.location ?? 'No location specified'}
							</div>
						</a>
					{/each}
				{:else}
					<div class="px-6 py-10 text-center text-muted-foreground">No stores found.</div>
				{/if}
			</div>

			<!-- Desktop Table View -->
			<div class="hidden md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row gridCols="grid-cols-[1fr_1fr_100px]">
							<Table.Head>Name</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head class="w-[100px] text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if stores && stores.length > 0}
							{#each stores as store (store.id)}
								<Table.Row gridCols="grid-cols-[1fr_1fr_100px]">
									<Table.Cell class="font-medium">{store.name}</Table.Cell>
									<Table.Cell class="text-muted-foreground">{store.location ?? 'N/A'}</Table.Cell>
									<Table.Cell class="text-right">
										<Button href={`/dashboard/stores/${store.id}`} variant="outline" size="sm">
											<Pencil class="mr-2 h-4 w-4" />
											Edit
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell class="h-24 text-center">
									No stores found.
								</Table.Cell>
							</Table.Row>
							{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
	</Card.Root>
</main>
