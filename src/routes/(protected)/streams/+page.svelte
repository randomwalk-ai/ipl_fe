<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { frigateBaseUrls } from '$lib/utils';

	const PageState = getPageState();
	PageState.title = 'CCTV Monitoring';

	let selectedTab = 'Stands Entry/Exit';
	// frigateBaseUrl = {
	// 	'Stands Entry/Exit': { url: 'http://162.243.108.233:5010' },
	// 	Galleries: { url: 'http://162.243.56.128:5010' },
	// 	'Concourse/Food Stalls': { url: 'http://162.243.67.187:5010' },
	// 	'Stadium Entry/Exit': { url: 'http://192.241.245.244:5010' },
	// 	'Wallaja Road Cameras': { url: 'http://107.170.16.44:5010' }
	// };

	
</script>

<div>
	<Tabs.Root bind:value={selectedTab} class="w-[400px]">
		<Tabs.List>
			{#each Object.keys(frigateBaseUrls) as key}
                <Tabs.Trigger value={key}>{key}</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
<div class="w-full h-full">
	<iframe src={frigateBaseUrls[selectedTab].url} class="w-full h-full"></iframe>
</div>