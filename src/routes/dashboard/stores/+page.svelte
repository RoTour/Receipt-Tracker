<!-- src/routes/dashboard/stores/+page.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { PlusCircle, Pencil } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stores } = data;
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

	<Card.Root>
		<Card.Content class="pt-6">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Location</Table.Head>
						<Table.Head class="w-[100px] text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if stores && stores.length > 0}
						{#each stores as store (store.id)}
							<Table.Row>
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
							<Table.Cell colspan="3" class="h-24 text-center">
								No stores found.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</main>
