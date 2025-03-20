<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getPageState } from '$lib/stores/index.svelte';
	const PageState = getPageState();
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
>
	<div class="flex items-center gap-2">
		<Sidebar.Trigger class="-ml-1" />
		{PageState.title}
	</div>
	<div class="flex gap-2">
	</div>
</header>