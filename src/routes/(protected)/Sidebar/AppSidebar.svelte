<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import NavUser from './NavUser.svelte';
	import Logo from './Logo.svelte';
	import AppOptions from './AppOptions.svelte';
	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<Logo />
	</Sidebar.Header>
	<Sidebar.Content>
		<AppOptions />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser/>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>