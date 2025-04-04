<script lang="ts">
	import { fade } from 'svelte/transition';

	type Props = {
		sentiments: {
			positive: number;
			neutral: number;
			negative: number;
		};
		legend?: boolean;
		showHeader?: boolean;
	};

	// Accept props using $props() rune
	let { sentiments, legend = true, showHeader = true }: Props = $props();

	// Calculate total sentiments
	const total = $derived(sentiments.positive + sentiments.neutral + sentiments.negative);

	// Calculate percentages for each sentiment
	const positivePercentage = $derived((sentiments.positive / total) * 100);
	const neutralPercentage = $derived((sentiments.neutral / total) * 100);
	const negativePercentage = $derived((sentiments.negative / total) * 100);
</script>

<!-- Title - Tweets Sentiment Analysis -->
{#if showHeader}
	<div class="flex flex-row items-center justify-left p-2">
		<h4 class="text-sm font-bold uppercase text-muted-foreground">Tweets Sentiment Analysis</h4>
	</div>
{/if}

<div class="overflow-hidden h-7 w-full rounded-sm border mt-2" transition:fade>

	<div class="flex h-full">

		<div
			class="flex transform-gpu items-center justify-center overflow-visible rounded-l-sm bg-green-500 text-white transition-all duration-300"
			style="width: {positivePercentage}%"
		>
			{#if sentiments.positive > 0}
				<div class="z-40 text-xs">
					{Math.round((sentiments.positive / total) * 100)}%
				</div>
			{/if}
		</div>

		<div
			class="flex transform-gpu items-center justify-center overflow-visible bg-gray-500 text-white transition-all duration-300"
			style="width: {neutralPercentage}%"
		>
			{#if sentiments.neutral > 0}
				<div class="z-40 text-xs">
					{Math.round((sentiments.neutral / total) * 100)}%
				</div>
			{/if}
		</div>

		<div
			class="flex transform-gpu items-center justify-center overflow-visible rounded-r-sm bg-red-500 text-white transition-all duration-300"
			style="width: {negativePercentage}%"
		>
			{#if sentiments.negative > 0}
				<div class="z-40 text-xs">
					{Math.round((sentiments.negative / total) * 100)}%
				</div>
			{/if}
		</div>
	</div>
</div>

{#if legend}
	<div class="mt-2 flex items-center justify-center gap-4">
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 rounded-full bg-green-500"></div>
			<span class="text-sm">Positive</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 rounded bg-gray-500"></div>
			<span class="text-sm">Neutral</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="h-4 w-4 rounded bg-red-500"></div>
			<span class="text-sm">Negative</span>
		</div>
	</div>
{/if}
