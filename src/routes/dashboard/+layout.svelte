<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { Home, Menu, Package2, ScanLine, Search, Upload, X, Store, ReceiptText } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { fly, fade } from 'svelte/transition';

  let isMobileMenuOpen = $state(false);
	$inspect(isMobileMenuOpen)
</script>

<div class="grid min-h-screen w-full max-h-screen md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
  <!-- Desktop Sidebar -->
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
            href="/dashboard/upload"
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
          <a
            href="/dashboard/receipts"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <ReceiptText class="h-4 w-4" />
            All Receipts
          </a>
          <a
            href="/dashboard/stores"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Store class="h-4 w-4" />
            Stores
          </a>
        </nav>
      </div>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex flex-col max-h-[inherit]">
    <header class="flex h-14 shrink-0 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <!-- Mobile Nav Toggle -->
      <div class="md:hidden">
        <Button variant="outline" size="icon" onclick={() => (isMobileMenuOpen = true)}>
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </div>

      <div class="w-full flex-1">
        <!-- Page title or breadcrumbs could go here in the future -->
      </div>

      <!-- Scan Button - visible on all screen sizes -->
      <Button href="/dashboard/upload" class="flex items-center gap-2">
        <ScanLine class="h-4 w-4" />
        <span class="hidden sm:inline">Scan Receipt</span>
      </Button>
    </header>

    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</div>

<!-- Mobile Navigation Sheet/Drawer -->
{#if isMobileMenuOpen}
  <!-- Backdrop -->
  <div
    role="presentation"
    class="fixed inset-0 z-40 bg-black/60 md:hidden"
    transition:fade={{ duration: 150 }}
    onclick={() => (isMobileMenuOpen = false)}
  />

  <!-- Drawer Content -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background p-6 md:hidden"
    transition:fly={{ x: -288, duration: 200 }}
  >
    <div class="mb-6 flex items-center justify-between">
      <a href="/dashboard" class="flex items-center gap-2 font-semibold">
        <Package2 class="h-6 w-6" />
        <span>Receipt Tracker</span>
      </a>
      <Button
        variant="ghost"
        size="icon"
        class="-mr-2"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <X class="h-6 w-6" />
        <span class="sr-only">Close menu</span>
      </Button>
    </div>
    <nav class="grid gap-2 text-lg font-medium">
      <a
        href="/dashboard"
        class="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <Home class="h-5 w-5" />
        Dashboard
      </a>
      <a
        href="/dashboard/upload"
        class="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <Upload class="h-5 w-5" />
        Upload Receipts
      </a>
      <a
        href="/dashboard/search"
        class="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <Search class="h-5 w-5" />
        Search
      </a>
      <a
        href="/dashboard/receipts"
        class="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <ReceiptText class="h-5 w-5" />
        All Receipts
      </a>
      <a
        href="/dashboard/stores"
        class="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        onclick={() => (isMobileMenuOpen = false)}
      >
        <Store class="h-5 w-5" />
        Stores
      </a>
    </nav>
  </aside>
{/if}
