<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	const PageState = getPageState();
	PageState.title = 'CCTV Monitoring';

	const tabVals = [
		{
			value: 'all',
			label: 'All'
		},
        {
            value: 'alerts',
            label: 'Alerts'
        },
        {
            value: 'entry',
            label: 'Entry Gates'
        },
        {
            value: 'exit',
            label: 'Exit Gates'
        },
        {
            value: 'seating',
            label: 'Seating'
        }
	] as const;
	let tabVal: (typeof tabVals)[number]['value'] = $state('all');
</script>

<div>
	<Tabs.Root bind:value={tabVal} class="w-[400px]">
		<Tabs.List>
			{#each tabVals as { value, label }}
                <Tabs.Trigger value={value}>{label}</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
<div>
	{tabVal}
</div>
