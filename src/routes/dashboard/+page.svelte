<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { ArrowUpRight, CreditCard, DollarSign, ReceiptText } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

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

	/**
	 * Appends the correct ordinal suffix (st, nd, rd, th) to a day number.
	 * @param {number} d The day of the month.
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
	 * @param {string | null} dateString The date string from the database.
	 */
	function formatPrettyDate(dateString: string | null) {
		if (!dateString) return 'No Date';
		const date = new Date(dateString);
		// Using 'en-GB' for a common European date format.
		const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
		const month = date.toLocaleDateString('en-GB', { month: 'long' });
		const day = date.getDate();

		return `${weekday} ${day}${getOrdinalSuffix(day)} ${month}`;
	}
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<!-- KPI Cards Section -->
	<div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Spent (Last 30 Days)</Card.Title>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">€{stats.totalSpent.value.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">{formatChange(stats.totalSpent.change)} from last month</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Average per Receipt (Last 30 Days)</Card.Title>
				<CreditCard class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">€{stats.averageSpent.value.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{formatChange(stats.averageSpent.change)} from last month
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Receipts</Card.Title>
				<ReceiptText class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.totalReceipts.value}</div>
				<p class="text-xs text-muted-foreground">
					{#if stats.totalReceipts.change !== 0}
						{formatChange(stats.totalReceipts.change)} in the last 30 days
					{:else}
						No change in the last 30 days
					{/if}
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Main Content Area with Recent Receipts -->
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
				<!-- The padding is removed on mobile (px-0) and reapplied for desktop (md:px-6) -->
				<Card.Content class="px-0 md:px-6">
					<!-- Mobile-friendly List View -->
					<!-- Container no longer needs space-y-3 as items are separated by borders -->
					<div class="block md:hidden">
						{#if receipts && receipts.length > 0}
							{#each receipts.slice(0, 5) as receipt (receipt.id)}
								<!-- Item is now a link with a bottom border, not a full card -->
								<a
									href="/dashboard/receipt/{receipt.id}"
									class="block border-b p-6 transition-colors last:border-b-0 hover:bg-muted/50"
									aria-label="View receipt from {receipt.store_name ?? 'N/A'}"
								>
									<div class="flex items-center justify-between">
										<span class="font-semibold">{receipt.store_name ?? 'N/A'}</span>
										<span class="font-mono text-lg font-bold">
											€{(receipt.total ?? 0).toFixed(2)}
										</span>
									</div>
									<div class="text-muted-foreground mt-1 text-sm">
										{formatPrettyDate(receipt.purchase_date)}
									</div>
								</a>
							{/each}
						{:else}
							<div class="px-6 py-10 text-center text-muted-foreground">No receipts found.</div>
						{/if}
					</div>

					<!-- Desktop List View -->
					<div class="hidden md:block">
						<div class="flow-root">
							<div class="-m-6 divide-y">
								{#if receipts && receipts.length > 0}
									{#each receipts.slice(0, 7) as receipt (receipt.id)}
										<a
											href="/dashboard/receipt/{receipt.id}"
											class="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 p-6 transition-colors hover:bg-muted/50"
											aria-label="View receipt from {receipt.store_name ?? 'N/A'}"
										>
											<div>
												<p class="truncate font-medium">{receipt.store_name ?? 'N/A'}</p>
												<p class="text-sm text-muted-foreground">
													{formatPrettyDate(receipt.purchase_date)}
												</p>
											</div>
											<div class="text-right">
												<p class="font-mono text-lg font-semibold">
													€{(receipt.total ?? 0).toFixed(2)}
												</p>
											</div>
										</a>
									{/each}
								{:else}
									<div class="p-6 text-center text-muted-foreground">No receipts found.</div>
								{/if}
							</div>
						</div>
					</div>
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
					<div class="flex h-[200px] w-full items-center justify-center rounded-lg bg-muted/50">
						<p class="text-muted-foreground text-sm">[Chart coming soon]</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</main>
