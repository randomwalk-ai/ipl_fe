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
	import SentimentBar from './SentimentBar.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import PlayerSelector from './PlayerSelector.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(relativeTime);
	dayjs.extend(customParseFormat);

	const getRelativeTime = (timeString: string) => {
		const format = 'YYYY-MM-DD HH:mm:ss';
		const parsedDate = dayjs(timeString, format);
		return parsedDate.fromNow();
	};

	let pageData = getPageState();
	pageData.title = 'Social';
	let HeaderTabs = ['All Mentions', 'Tickets', 'Players'] as const;
	let selectedTab: (typeof HeaderTabs)[number] = $state('All Mentions');

	let { data } = $props();
	let derivedTweets = $derived.by(() => {
		if (selectedTab === 'All Mentions') {
			return data.latestTweets;
		} else if (selectedTab === 'Tickets') {
			return data.latestTweets.filter((tweet) => tweet.category === 'ticket');
		} else if (selectedTab === 'Players') {
			return data.latestTweets.filter((tweet) => tweet.category === 'player');
		}
		return [];
	});
	$inspect(derivedTweets);
</script>

<svelte:head>
	{#if browser}
		<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
	{/if}
</svelte:head>
<div class="flex h-full w-full flex-col">
	<div class="flex h-full w-full flex-row gap-4  mb-4 ml-4 mr-4">
		<Card class={`flex flex-col dark:bg-[#161823] border-none dark:text-white ${
			selectedTab !== 'Tickets' ? 'w-1/4' : 'w-full transition-all duration-200'
		}`}>
			<!-- <CardHeader
				class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4"
			>
				<div class="flex items-center gap-2">
					<BellRingIcon class="h-5 w-5" />
					<h3 class="font-medium">Recent Alerts & Events</h3>
				</div>
			</CardHeader> -->
			<!-- Stats cards -->
			<div class="space-y-4 p-4 text-center">
				<!-- Total Tweets card -->
					<h4 class="text-sm font-bold uppercase text-muted-foreground">Total Tweets</h4>
					<p class="mt-2 text-3xl font-semibold">
						{selectedTab === 'All Mentions'
							? data.totalCount.count
							: selectedTab === 'Tickets'
								? data.ticketCount
								: data.playerCount.count}
					</p>			
			</div>
		</Card>
		{#if selectedTab !== 'Tickets'}
		<Card class="flex h-full w-3/4 flex-col bg-[#1F2736] border-none p-4 mr-8">
			<SentimentBar
			sentiments={selectedTab === 'All Mentions'
				? {
						positive: data.totalCount.positive,
						neutral: data.totalCount.neutral - data.ticketCount,
						negative: data.totalCount.negative
					}
				: {
						positive: data.playerCount.positive,
						neutral: data.playerCount.neutral,
						negative: data.playerCount.negative
					}}
		/>
				</Card>
				{/if}
	</div>
	<div class="bg-[#161823] rounded-md p-4 m-4 overflow-y-auto">
	
		<Tabs.Root class="w-full ml-4" bind:value={selectedTab}>
			<Tabs.List>
				{#each HeaderTabs as tab}
					<Tabs.Trigger value={tab}>{tab}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
		<div class="flex h-full w-full gap-4">
			<div class="h-full w-full">
				<ScrollArea class="h-full w-full">
					<div class="flex flex-wrap">
						{#each derivedTweets as tweet (tweet.tweetId)}
							<div class="container w-96 p-2">
								
								<Card class="flex h-full w-full flex-col bg-[#161823] border-none hover:bg-[#1F2736] transition-colors duration-200">
									<CardContent class="grow p-4">
										<div class="flex items-center gap-2 font-medium">
											<span>{tweet.tweetUser}</span>
										</div>
										<p class="my-2 whitespace-pre-line">{tweet.text}</p>
									</CardContent>
									<CardFooter class="">
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
								</Card>
							</div>
						{/each}
					</div>
				</ScrollArea>
			</div>

		
		</div>
	</div>
</div>
