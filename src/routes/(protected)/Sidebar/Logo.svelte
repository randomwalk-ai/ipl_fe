<script>
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import * as Sidebar from '$lib/components/ui/sidebar';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<Sidebar.MenuButton
			size="lg"
			class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
		>
			<img alt={PUBLIC_APP_NAME} src="favicon.png" class="h-8 w-8 rounded-lg invert-0 dark:invert" />
			<div class="grid flex-1 text-left text-sm leading-tight">
				<span class="truncate text-xl font-semibold">{PUBLIC_APP_NAME}</span>
			</div>
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Menu>
