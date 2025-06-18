<script lang="ts">
	import { Home, Package2, Search, Upload } from 'lucide-svelte';
</script>

<div class="grid min-h-screen w-full max-h-screen md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
	<!-- Sidebar Navigation -->
	<div class="hidden border-r bg-muted/40 md:block max-h-[inherit]">
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
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
					>
						<Home class="h-4 w-4" />
						Dashboard
					</a>
					<a
						href="/"
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
					>
						<Upload class="h-4 w-4" />
						Upload Receipts
					</a>
					<a
						href="/dashboard/search"
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
					>
						<Search class="h-4 w-4" />
						Search
					</a>
				</nav>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="flex flex-col max-h-[inherit]">
		<header class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
			<!-- Mobile Navigation could go here in the future -->
			<div class="w-full flex-1">
				<!-- Header content, e.g., Search Bar -->
			</div>
		</header>
		<!-- FIX: The <slot /> is where your page content will be rendered. -->
		<!-- `overflow-auto` makes this area scrollable if content overflows. -->
		<div class="flex-1 overflow-auto">
			<slot />
		</div>
	</div>
</div>
