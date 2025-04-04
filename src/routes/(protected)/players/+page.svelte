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
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { browser } from '$app/environment';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { BellRingIcon } from '@lucide/svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	import type { TweetsData } from '../types';
	import SentimentBar from '../social/SentimentBar.svelte';
	import { ipl_players_lookup } from '$lib/utils';
	dayjs.extend(relativeTime);
	dayjs.extend(customParseFormat);

	const getRelativeTime = (timeString: string) => {
		const format = 'YYYY-MM-DD HH:mm:ss';
		const parsedDate = dayjs(timeString, format);
		return parsedDate.fromNow();
	};

	let pageData = getPageState();
	pageData.title = 'Players';

	let { data } = $props();
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

	let perPlayerTweetObj = $derived.by(() => {
		return players.map((player) => {
			const playerTweets = data.tweets.filter((tweet) => {
				return tweet.input
					.split(' csk ')
					.join('')
					.trim()
					.toLocaleLowerCase()
					.includes((player.value ?? '').trim().toLocaleLowerCase());
			});
			const playerSentiment = playerTweets.reduce(
				(acc, tweet) => {
					if (tweet.sentiment === 'positive') {
						acc.positive++;
					} else if (tweet.sentiment === 'negative') {
						acc.negative++;
					} else if (tweet.sentiment === 'neutral') {
						acc.neutral++;
					}
					return acc;
				},
				{
					positive: 0,
					negative: 0,
					neutral: 0
				}
			);
			return {
				...player,
				playerTweets,
				playerSentiment
			};
		});
	});

	let selectedPlayerValue = $state<string | undefined>(
		players.length > 0 ? players[0].value : undefined
	);
</script>

<!-- container for player cards -->

<div class="flex h-full w-full gap-4 overflow-hidden p-4">
	<!-- Left side - Players in two rows -->
	<div class="flex h-full w-3/4 flex-col overflow-hidden p-2">
		<!-- Top row - 7 players -->
		<div class="mb-2 flex h-1/2 w-full gap-2">
			{#each perPlayerTweetObj.slice(0, 7) as player (player.value)}
				<div class="h-full flex-1 hover:-translate-y-2 transition-all duration-300">
					<Card
						class="flex h-full cursor-pointer flex-col"
						style="position: relative;"
						onclick={() => (selectedPlayerValue = player.value)}
					>
						{#if selectedPlayerValue === player.value}
							<div
								class="pointer-events-none absolute inset-0 rounded-md border-2 border-primary"
							></div>
						{/if}
						<CardHeader class="p-2">
							<CardTitle class="text-sm">{ipl_players_lookup[player.label]} - {player.playerTweets.length}</CardTitle>
						</CardHeader>

						<CardContent class="flex-grow overflow-hidden p-0">
							<div class="relative h-full w-full">
								<img
									src={player.imageUrl}
									alt="Photo of {player.label}"
									class="h-full w-full object-cover"
								/>
							</div>
						</CardContent>

						<CardFooter class="h-10 p-2">
							<SentimentBar sentiments={player.playerSentiment} legend={false} showHeader={false} />
						</CardFooter>
					</Card>
				</div>
			{/each}
		</div>

		<!-- Bottom row - 6 players -->
		<div class="flex h-1/2 w-full gap-2">
			{#each perPlayerTweetObj.slice(7, 13) as player (player.value)}
				<div class="h-full flex-1 hover:-translate-y-2 transition-all duration-300">
					<Card
						class="flex h-full cursor-pointer flex-col"
						style="position: relative;"
						onclick={() => (selectedPlayerValue = player.value)}
					>
						{#if selectedPlayerValue === player.value}
							<div
								class="pointer-events-none absolute inset-0 rounded-md border-2 border-primary"
							></div>
						{/if}
						<CardHeader class="p-2">
							<CardTitle class="text-sm">{ipl_players_lookup[player.label]} - {player.playerTweets.length}</CardTitle>
						</CardHeader>

						<CardContent class="flex-grow overflow-hidden p-0">
							<div class="relative h-full w-full">
								<img
									src={player.imageUrl}
									alt="Photo of {player.label}"
									class="h-full w-full object-cover"
								/>
							</div>
						</CardContent>

						<CardFooter class="h-10 p-2">
							<SentimentBar sentiments={player.playerSentiment} legend={false} showHeader={false} />
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
				<CardTitle>Tweets - {perPlayerTweetObj.find((e)=> e.value === selectedPlayerValue)?.playerTweets.length}</CardTitle>
				<CardDescription>Select a player to view their relevant tweets</CardDescription>
			</CardHeader>
			<CardContent class="flex-grow overflow-auto p-0">
				<ScrollArea class="h-full w-full">
					<div class="flex flex-col gap-2 p-3">
						{#if selectedPlayerValue}
							{#each perPlayerTweetObj.find((player) => player.value === selectedPlayerValue)?.playerTweets ?? [] as tweet (tweet.tweetId)}
								<div class="mb-2 min-h-12 rounded-md border p-2">
									<p class="text-sm">{tweet.text}</p>
									<CardFooter class="p-0">
										<div
											class="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground"
										>
											{getRelativeTime(tweet.tweetDate)}
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
							{:else}
								<div class="p-3 text-center text-muted-foreground">No tweets available</div>
							{/each}
						{:else}
							<div class="p-3 text-center text-muted-foreground">
								Select a player to view tweets
							</div>
						{/if}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	</div>
</div>
