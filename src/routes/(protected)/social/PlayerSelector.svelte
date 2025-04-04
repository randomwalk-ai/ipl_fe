<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import type { TweetsData } from '../types';
	import SentimentBar from './SentimentBar.svelte';
	import SentimentOverlay from './SentimentOverlay.svelte';

	let {
		tweets
	}: {
		tweets: TweetsData[];
	} = $props();
	const imageModules = import.meta.glob('/static/csk/*.{jpg,jpeg,png,webp,gif,svg}', {
		eager: true,
		query: '?url' // <-- Get the URL directly
	}) as Record<
		string,
		{
			default: string; // URL to the image
		}
	>;

	type Player = {
		value: string; // Filename without extension (used as unique ID)
		label: string; // Capitalized name for display
		imageUrl: string; // URL to the image
	};

	let players = $state<Player[]>(
		Object.entries(imageModules)
			.map(([path, url]) => {
				const filename = path.split('/').pop() ?? '';
				const name = filename.split('.').slice(0, -1).join('.');
				const label = name.charAt(0).toUpperCase() + name.slice(1);

				const imageUrl = '/' + url.default.split('/').slice(2).join('/'); // Remove the leading slash and trailing query string
				return {
					value: name, // Use the base name as the value
					label: label,
					imageUrl: imageUrl
				};
			})
			.sort((a, b) => a.label.localeCompare(b.label))
	);
	let selectedPlayerValue = $state<string | undefined>(
		players.length > 0 ? players[0].value : undefined
	);
	const selectedPlayer = $derived.by(() => {
		return players.find((p) => p.value === selectedPlayerValue);
	});
	let selectedPlayerTweets = $derived.by(() => {
		if (!selectedPlayerValue) return [];
		return tweets.filter((tweet) =>
			tweet.input
				.split(' csk ')
				.join('')
				.trim()
				.toLocaleLowerCase()
				.includes((selectedPlayerValue ?? '').trim().toLocaleLowerCase())
		);
	});
	$inspect(selectedPlayerTweets);
</script>

<h2 class="mb-4 text-center text-xl font-semibold">CSK Player Selector</h2>

{#if players.length > 0}
	<Select.Root bind:value={selectedPlayerValue} type="single">
		<Select.Trigger class="w-full">
			{#if selectedPlayerValue}
				{selectedPlayerValue}
			{:else}
				Select a Player
			{/if}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.GroupHeading>Players</Select.GroupHeading>
				{#each players as player (player.value)}
					<Select.Item value={player.value} label={player.label}>
						{player.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>

	<div
		class="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded border bg-muted"
	>
		{#if selectedPlayer}
			<div class="relative h-full w-full">
				<div class="absolute inset-0 bg-cover bg-center"></div>
				<img
					src={selectedPlayer?.imageUrl}
					alt="Photo of {selectedPlayer?.label}"
					class="h-full w-full object-cover"
				/>
			</div>
		{:else if selectedPlayerValue}
			<p class="text-muted-foreground">Player data not found.</p>
		{:else}
			<p class="text-muted-foreground">Select a player to view their photo.</p>
		{/if}
	</div>
	<SentimentBar
		sentiments={{
			positive: selectedPlayerTweets.filter((tweet) => tweet.sentiment === 'positive').length,
			neutral: selectedPlayerTweets.filter((tweet) => tweet.sentiment === 'neutral').length,
			negative: selectedPlayerTweets.filter((tweet) => tweet.sentiment === 'negative').length
		}}
	/>
{:else}
	<p class="text-center text-muted-foreground">No player images found in /static/csk.</p>
{/if}
