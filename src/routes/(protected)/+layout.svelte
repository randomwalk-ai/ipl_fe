<!-- +layout.svelte -->
<script lang="ts">
	import type { LayoutData } from './$types';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Snippet } from 'svelte';
	import AppSidebar from './Sidebar/AppSidebar.svelte';
	import Header from './Sidebar/Header.svelte';
	let {
		children
	}: {
		children: Snippet;
	} = $props();
</script>

<Sidebar.Provider>
	<div class="flex h-screen w-full overflow-hidden">
		<AppSidebar />
		<Sidebar.Inset class="flex h-full w-full flex-col overflow-hidden">
			<Header />
			<div class="flex flex-1 w-full flex-col gap-2 p-2 pt-0 overflow-hidden">
				{@render children()}
			</div>
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>