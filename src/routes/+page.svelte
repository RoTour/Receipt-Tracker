<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { ArrowUpRight, CreditCard, DollarSign, ReceiptText } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stats, receipts } = data;

	/**
	 * Formats the percentage change into a user-friendly string.
	 */
	function formatChange(change: number) {
		if (change === 0) return 'No change';
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(1)}%`;
	}
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<!-- KPI Cards Section -->
	<div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Spent (Last 30 Days)</Card.Title>
				<DollarSign class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">€{stats.totalSpent.value.toFixed(2)}</div>
				<p class="text-muted-foreground text-xs">
					{formatChange(stats.totalSpent.change)} from last month
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Average per Receipt (Last 30 Days)</Card.Title>
				<CreditCard class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">€{stats.averageSpent.value.toFixed(2)}</div>
				<p class="text-muted-foreground text-xs">
					{formatChange(stats.averageSpent.change)} from last month
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Receipts</Card.Title>
				<ReceiptText class="text-muted-foreground h-4 w-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.totalReceipts.value}</div>
				<p class="text-muted-foreground text-xs">
					{#if stats.totalReceipts.change !== 0}
						{formatChange(stats.totalReceipts.change)} in the last 30 days
					{:else}
						No change in the last 30 days
					{/if}
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Main Content Area with Recent Receipts Table -->
	<div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
		<div class="xl:col-span-2">
			<Card.Root>
				<Card.Header class="flex flex-row items-center">
					<div class="grid gap-2">
						<Card.Title>Recent Receipts</Card.Title>
						<Card.Description>A list of your most recent grocery trips.</Card.Description>
					</div>
					<Button href="/dashboard/upload" size="sm" class="ml-auto gap-1">
						Upload More
						<ArrowUpRight class="h-4 w-4" />
					</Button>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[60%]">Store</Table.Head>
								<Table.Head class="text-right">Total</Table.Head>
								<Table.Head class="text-right">Date</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if receipts && receipts.length > 0}
								{#each receipts.slice(0, 7) as receipt (receipt.id)}
									<Table.Row
										class="cursor-pointer"
										on:click={() => goto(`/dashboard/receipt/${receipt.id}`)}
									>
										<Table.Cell class="truncate font-medium"
											>{receipt.store_name ?? 'N/A'}</Table.Cell
										>
										<Table.Cell class="text-right">€{(receipt.total ?? 0).toFixed(2)}</Table.Cell>
										<Table.Cell class="text-right">
											{new Date(receipt.purchase_date).toLocaleDateString()}
										</Table.Cell>
									</Table.Row>
								{/each}
							{:else}
								<Table.Row>
									<Table.Cell colspan={3} class="text-center">No receipts found.</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Placeholder for future content, like a chart -->
		<div>
			<Card.Root>
				<Card.Header>
					<Card.Title>Spending Overview</Card.Title>
				</Card.Header>
				<Card.Content class="pb-8">
					<div class="bg-muted/50 flex h-[200px] w-full items-center justify-center rounded-lg">
						<p class="text-muted-foreground text-sm">[Chart coming soon]</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</main>
