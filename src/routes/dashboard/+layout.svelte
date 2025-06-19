<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
	import { Home, Package2, Search, Upload } from 'lucide-svelte';
</script>

<div
	class="grid max-h-screen min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
>
	<!-- Sidebar Navigation -->
	<div class="bg-muted/40 hidden max-h-[inherit] border-r md:block">
		<div class="flex h-full max-h-screen flex-col gap-2">
			<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
				<a href="/dashboard" class="flex items-center gap-2 font-semibold">
					<Package2 class="h-6 w-6" />
					<span>Receipt Tracker</span>
				</a>
			</div>
			<div class="flex-1">
				<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
					<a
						href="/dashboard"
						class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
					>
						<Home class="h-4 w-4" />
						Dashboard
					</a>
					<a
						href="/dashboard/upload"
						class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
					>
						<Upload class="h-4 w-4" />
						Upload Receipts
					</a>
					<a
						href="/dashboard/search"
						class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
					>
						<Search class="h-4 w-4" />
						Search
					</a>
				</nav>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="flex max-h-[inherit] flex-col">
		<header class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
			<!-- Mobile Navigation could go here in the future -->
			<div class="w-full flex-1">
				<!-- Header content, e.g., Search Bar -->
			</div>
		</header>
		<div class="flex-1 overflow-auto">
			<slot />
		</div>
	</div>
</div>
