<script lang="ts">
	import './../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { getPageState, setPageState } from '$lib/stores/index.svelte';
	let { children } = $props();

	setPageState();
	const pageState = getPageState();
</script>

<ModeWatcher />
<Toaster richColors={true} />
<svelte:head>
	<title>{pageState.actualTitle}</title>
</svelte:head>
<div
	class="relative flex min-h-[100dvh] flex-col items-center bg-background"
	data-vaul-drawer-wrapper
>
	{@render children()}
</div>
