<script lang="ts">
	import { fade } from 'svelte/transition';

	type Props = {
		sentiments: {
			positive: number;
			neutral: number;
			negative: number;
		};
	};

	// Accept props using $props() rune
	let { sentiments }: Props = $props();

	// Calculate total sentiments
	const total = $derived(sentiments.positive + sentiments.neutral + sentiments.negative);

	// Calculate percentages for each sentiment
	const positivePercentage = $derived((sentiments.positive / total) * 100);
	const neutralPercentage = $derived((sentiments.neutral / total) * 100);
	const negativePercentage = $derived((sentiments.negative / total) * 100);
</script>

<div class="h-full w-full overflow-hidden rounded-sm border" transition:fade>
	<div class="flex h-full">
		<div
			class="flex items-center justify-center bg-green-500/20 text-white"
			style="width: {positivePercentage}%"
		>
			{#if sentiments.positive > 0}
				{Math.round((sentiments.positive / total) * 100)}%
			{/if}
		</div>

		<div
			class="flex items-center justify-center bg-gray-500/20 text-white"
			style="width: {neutralPercentage}%"
		>
			{#if sentiments.neutral > 0}
				{Math.round((sentiments.neutral / total) * 100)}%
			{/if}
		</div>

		<div
			class="flex items-center justify-center bg-red-500/20 text-white"
			style="width: {negativePercentage}%"
		>
			{#if sentiments.negative > 0}
				{Math.round((sentiments.negative / total) * 100)}%
			{/if}
		</div>
	</div>
</div>
