<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { LayoutDashboard, MessagesSquare, BellRing } from '@lucide/svelte';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';

	let isNavigating = $state(false);
	beforeNavigate(() => {
		isNavigating = true;
	});
	afterNavigate(() => {
		isNavigating = false;
	});
</script>

<!-- <Sidebar.Group>
	<Sidebar.GroupLabel>Data management</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/app')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<MessagesSquare />
				<span>{'Chat'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group> -->
<Sidebar.Group>
	<Sidebar.GroupLabel>Views</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<MessagesSquare />
				<span>{'Dashboard'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/streams')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<LayoutDashboard />
				<span>{'CCTV Monitoring'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				onclick={(e) => goto('/alertsConfig')}
				class={`${isNavigating ? 'cursor-default opacity-50' : ''}`}
			>
				<BellRing />
				<span>{'Alerts Configuration'}</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group>
