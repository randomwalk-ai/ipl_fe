<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getPageState } from '$lib/stores/index.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	import type { TweetsData } from '../types';
	import SentimentBar from '../social/SentimentBar.svelte';
	import { ipl_players_lookup } from '$lib/utils';
	import TweetChart from './TweetChart.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { browser } from '$app/environment';
	dayjs.extend(relativeTime);
	dayjs.extend(customParseFormat);

	const getRelativeTime = (timeString: string) => {
		const format = 'YYYY-MM-DD HH:mm:ss';
		const parsedDate = dayjs(timeString, format);
		return parsedDate.fromNow();
	};

	let pageData = getPageState();
	pageData.title = 'Player Sentiment';
	let refreshInterval: ReturnType<typeof setInterval> | undefined;
	let isRefreshing = $state(false);

	let { data } = $props();

	type Player = {
		value: string; // Filename without extension (used as unique ID)
		label: string; // Capitalized name for display
		imageUrl: string; // URL to the image
	};

	let selectedInput = $state<string | undefined>(undefined);

	// Auto-refresh function
	async function refreshData() {
		if (isRefreshing) return;
		
		isRefreshing = true;
		try {
			// Instead of invalidation, fetch the data directly with a simple page reload
			// This is more reliable for ensuring fresh data
			if (browser) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Error refreshing player stats:', error);
		} finally {
			isRefreshing = false;
		}
	}
	
	// Setup auto-refresh on mount
	onMount(() => {
		// Initialize the refresh timer
		if (browser) {
			const intervalId = setInterval(refreshData, 60000);
			
			return () => {
				clearInterval(intervalId);
			};
		}
	});

	// let perPlayerTweetObj = $derived.by(() => {
	// 	return players.map((player) => {
	// 		// const playerTweets = data.tweets.filter((tweet) => {
	// 		// 	return tweet.input
	// 		// 		.split(' csk ')
	// 		// 		.join('')
	// 		// 		.trim()
	// 		// 		.toLocaleLowerCase()
	// 		// 		.includes((player.value ?? '').trim().toLocaleLowerCase());
	// 		// });
	// 		const playerTweets = data.players?.find((player) => player.value === player.value)?.playerTweets ?? [];
	// 		const playerSentiment = playerTweets.reduce(
	// 			(acc, tweet) => {
	// 				if (tweet.sentiment === 'positive') {
	// 					acc.positive++;
	// 				} else if (tweet.sentiment === 'negative') {
	// 					acc.negative++;
	// 				} else if (tweet.sentiment === 'neutral') {
	// 					acc.neutral++;
	// 				}
	// 				return acc;
	// 			},
	// 			{
	// 				positive: 0,
	// 				negative: 0,
	// 				neutral: 0
	// 			}
	// 		);
	// 		return {
	// 			...player,
	// 			playerTweets,
	// 			playerSentiment
	// 		};
	// 	});
	// });

	// let selectedPlayerValue = $state<string | undefined>(
	// 	players.length > 0 ? players[0].value : undefined
	// );
</script>

<!-- container for player cards -->

<div class="flex h-full w-full gap-4 overflow-hidden p-4">
	<!-- Left side - Players in two rows -->
	<div class="flex h-full w-3/4 flex-col overflow-hidden p-2">
		<!-- Top row - 7 players -->
		<div class="mb-2 flex h-1/2 w-full gap-2">
			{#each Object.entries(ipl_players_lookup).slice(0, 7) as [input, label] (input)}
				<div class="h-full flex-1 transition-all duration-300 hover:-translate-y-2">
					<Card
						class="flex h-full cursor-pointer flex-col"
						style="position: relative;"
						onclick={() => (selectedInput = selectedInput === input ? undefined : input)}
					>
						{#if selectedInput === input}
							<div
								class="pointer-events-none absolute inset-0 rounded-md border-2 border-primary"
							></div>
						{/if}
						<CardHeader class="p-2">
							<CardTitle class="text-sm">{label}</CardTitle>
							<!-- Circle with gray bg to put number  {data.players[input].stats.count} on the top right of the card -->
							<div class="absolute top-0 right-2 rounded-full bg-[#1F2736] p-2 text-[8pt] text-gray-100 h-5 w-5 flex items-center justify-center">
								{data.players[input].stats.count}
							</div>
						</CardHeader>

						<CardContent class="flex-grow overflow-hidden p-0">
							<div class="relative h-full w-full">
								<img
									src={`/csk/${label}.png`}
									alt="Photo of {label}"
									class="h-full w-full object-cover"
								/>
							</div>
						</CardContent>

						<CardFooter class="h-10 p-2">
							<SentimentBar sentiments={{
								negative: data.players[input].stats.negative,
								neutral: data.players[input].stats.neutral,
								positive: data.players[input].stats.positive
							}} legend={false} showHeader={false} />
						</CardFooter>
					</Card>
				</div>
			{/each}
		</div>

		<!-- Bottom row - 6 players -->
		<div class="flex h-1/2 w-full gap-2">
			{#each Object.entries(ipl_players_lookup).slice(7, 13) as [input, label] (input)}
				<div class="h-full flex-1 transition-all duration-300 hover:-translate-y-2">
					<Card
						class="flex h-full cursor-pointer flex-col"
						style="position: relative;"
						onclick={() => (selectedInput = selectedInput === input ? undefined : input)}
					>
						{#if selectedInput === input}
							<div
								class="pointer-events-none absolute inset-0 rounded-md border-2 border-primary"
							></div>
						{/if}
						<CardHeader class="p-2">
							<CardTitle class="text-sm">{label} - {data.players[input].stats.count}</CardTitle>
						</CardHeader>

						<CardContent class="flex-grow overflow-hidden p-0">
							<div class="relative h-full w-full">
								<img
									src={`/csk/${label}.png`}
									alt="Photo of {label}"
									class="h-full w-full object-cover"
								/>
							</div>
						</CardContent>

						<CardFooter class="h-10 p-2">
							<SentimentBar sentiments={{
								negative: data.players[input].stats.negative,
								neutral: data.players[input].stats.neutral,
								positive: data.players[input].stats.positive
							}} legend={false} showHeader={false} />
						</CardFooter>
					</Card>
				</div>
			{/each}
		</div>
	</div>

	<!-- Right side - Tweets panel -->
	<div class="flex h-full w-1/4 flex-col">
		<Card class="flex h-full flex-col">
			<CardHeader class="p-3">
				<div class="flex items-center justify-between">
					<CardTitle
						>Tweets - {selectedInput ? data.players[selectedInput].stats.count : data.playerCount.count}</CardTitle>
					<div class="flex items-center gap-2">
						{#if isRefreshing}
							<div class="h-3 w-3 rounded-full bg-blue-500 animate-pulse" title="Refreshing data..."></div>
						{/if}
						<button 
							on:click={refreshData} 
							class="text-xs text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/30"
							title="Refresh data manually"
							disabled={isRefreshing}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					</div>
				</div>
				<CardDescription>{selectedInput ? "Player's tweets and sentiment analysis" : "All player tweets"}</CardDescription>
			</CardHeader>
			<CardContent class="flex-grow overflow-auto p-0">
				{#if selectedInput}
					<div class="px-3 pt-3 pb-2">
						<h3 class="text-sm font-semibold mb-2">Sentiment Trend</h3>
						<TweetChart tweets={data.players[selectedInput].tweets} />
						<div class="h-px w-full bg-gray-700/20 my-3"></div>
					</div>
				{:else}
					<div class="px-3 pt-3 pb-2">
						<h3 class="text-sm font-semibold mb-2">All Players Sentiment Trend</h3>
						<TweetChart tweets={data.latestTweets.filter(t => t.category === 'player')} />
						<div class="h-px w-full bg-gray-700/20 my-3"></div>
					</div>
				{/if}
				<ScrollArea class="h-full w-full">
					<div class="flex flex-col gap-2 p-3">
						{#if selectedInput}
							{#each data.players[selectedInput].tweets ?? [] as tweet (tweet.tweetId)}
								<a href={`https://x.com/${tweet.tweetUser ? tweet.tweetUser.replace('@', '') : ''}/status/${tweet.tweetId}`} target="_blank" rel="noopener noreferrer">
								<div class="mb-2 min-h-12 rounded-md border p-2 cursor-pointer hover:bg-[#1F2736] transition-colors duration-200">
									<p class="text-sm">{tweet.text}</p>
									<CardFooter class="p-0">
										<div
											class="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground"
										>
											{getRelativeTime(tweet.tweetDate!)}
											<div
												class={[
													'h-4 w-4 rounded-full',
													{
														'bg-green-500': tweet.sentiment === 'positive',
														'bg-yellow-500': tweet.sentiment === 'neutral',
														'bg-red-500': tweet.sentiment === 'negative'
													}
												]}
											></div>
										</div>
									</CardFooter>
								</div>
								</a>
							{:else}
								<div class="p-3 text-center text-muted-foreground">No tweets available</div>
							{/each}
						{:else}
							{#if data.latestTweets.some(t => t.category === 'player')}
								{#each data.latestTweets.filter(t => t.category === 'player').slice(0, 20) as tweet (tweet.tweetId)}
									<a href={`https://x.com/${tweet.tweetUser ? tweet.tweetUser.replace('@', '') : ''}/status/${tweet.tweetId}`} target="_blank" rel="noopener noreferrer">
									<div class="mb-2 min-h-12 rounded-md border p-2 cursor-pointer hover:bg-[#1F2736] transition-colors duration-200">
										<p class="text-sm">{tweet.text}</p>
										<CardFooter class="p-0">
											<div
												class="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground"
											>
												{getRelativeTime(tweet.tweetDate!)}
												<div
													class={[
														'h-4 w-4 rounded-full',
														{
															'bg-green-500': tweet.sentiment === 'positive',
															'bg-yellow-500': tweet.sentiment === 'neutral',
															'bg-red-500': tweet.sentiment === 'negative'
														}
													]}
												></div>
											</div>
										</CardFooter>
									</div>
									</a>
								{/each}
							{:else}
								<div class="p-3 text-center text-muted-foreground">
									No player tweets available
								</div>
							{/if}
						{/if}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	</div>
</div>
