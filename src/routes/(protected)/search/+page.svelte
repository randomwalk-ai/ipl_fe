<script lang="ts">
	// --- UI Components & Utils ---
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SearchIcon from '@lucide/svelte/icons/search'; // Import Search icon
	import XCircleIcon from '@lucide/svelte/icons/x-circle'; // Import XCircle for clear button
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import type { CameraType } from '../types.js';
	import { Loader2 } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	// --- Data from load function ---
	let { data } = $props();

	// --- State ---
	let isLoading = $state(false);
	let searchResults: any[] = $state([]);
	let searchError: string | null = $state(null);
	let similaritySearchActive = $state(false); // Track similarity search mode
	let similarityEventId = $state<string | null>(null); // Track the source event ID

	// --- Form State ---
	const availableLabels = [
		// ... (keep existing labels)
		'bicycle',
		'car',
		'cat',
		'dog',
		'motorcycle',
		'person',
		'truck'
	] as const;
	type LabelValue = (typeof availableLabels)[number];

	let query = $state('');
	let selectedLabels = $state<LabelValue[]>([]);
	let limit = $state(25); // Default as a number
	let cameras = $state<CameraType[]>([]);

	// Date Range State
	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	let dateRange: { start: DateValue | undefined; end: DateValue | undefined } = $state({
		start: undefined,
		end: undefined
	});

	// --- Derived State ---
	let afterTimestamp = $derived(
		dateRange.start ? new Date(dateRange.start.toString()).getTime() : undefined
	);
	let beforeTimestamp = $derived(
		dateRange.end ? new Date(dateRange.end.toString()).getTime() : undefined
	);
	// $inspect('Daterange: ', dateRange, beforeTimestamp, afterTimestamp); // Keep if needed

	// --- Helper ---
	function formatTimestamp(unixTimestamp: number): string {
		// ... (keep existing function)
		if (!unixTimestamp) return 'N/A';
		try {
			return new Date(unixTimestamp * 1000).toLocaleString();
		} catch (e) {
			return 'Invalid Date';
		}
	}

	function handleLimitInput(event: Event) {
		// ... (keep existing function)
		const input = event.target as HTMLInputElement;
		let num = parseInt(input.value, 10);
		if (isNaN(num) || num < 1) num = 1;
		if (num > 100) num = 100;
		limit = num;
		input.value = String(num);
	}

	// --- Search Function (Modified) ---
	async function performSearch(
		options?: { searchType?: 'similarity'; eventId?: string } // Optional options for similarity search
	) {
		isLoading = true;
		searchError = null;
		searchResults = []; // Clear previous results

		let requestBody: Record<string, any>;
		const userTimezone = getLocalTimeZone(); // Get user's timezone

		if (options?.searchType === 'similarity' && options.eventId) {
			// --- Similarity Search ---
			similaritySearchActive = true; // Set similarity mode
			similarityEventId = options.eventId; // Store the triggering event ID
			requestBody = {
				search_type: 'similarity',
				event_id: options.eventId,
				limit: limit, // Still use the limit from the form
				include_thumbnails: 1,
				timezone: userTimezone // Pass timezone needed by Frigate
			};
			console.log('Performing similarity search for event:', options.eventId);
		} else {
			// --- Normal Form Search ---
			similaritySearchActive = false; // Ensure similarity mode is off
			similarityEventId = null;
			requestBody = {
				query,
				labels: selectedLabels,
				limit,
				cameras: cameras.map((el) => `${el.id}_${el.name}`),
				after: afterTimestamp,
				before: beforeTimestamp,
				include_thumbnails: 1,
				timezone: userTimezone // Also pass timezone for potential future use
			};
			console.log('Performing standard search with filters:', requestBody);
		}

		try {
			const response = await fetch('/api/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`API fetch error: ${response.status} ${response.statusText}`, errorText);
				searchError = `Failed to fetch search results: ${response.statusText}`;
				similaritySearchActive = false; // Reset similarity state on error
				similarityEventId = null;
				return;
			}

			searchResults = await response.json();
		} catch (err: any) {
			console.error('Search Error:', err);
			searchError = err.message || 'An unexpected error occurred.';
			similaritySearchActive = false; // Reset similarity state on error
			similarityEventId = null;
		} finally {
			isLoading = false;
			console.log('Set isLoading to false');
		}
	}

	// Function to clear similarity search and run a normal search
	function clearSimilaritySearchAndRefresh() {
		performSearch(); // Call without options to trigger a normal search
	}
</script>

<ScrollArea class="h-full p-4">
	<h1 class="mb-6 text-2xl font-bold text-white">Frigate Event Search</h1>

	<!-- Search Form -->
	<div class="mb-8">
		<!-- Keep the existing form structure -->
		<form
			class="mb-4 flex flex-col gap-4 md:flex-row"
			onsubmit={(e) => {
				e.preventDefault();
				performSearch(); // Trigger standard search on form submit
			}}
		>
			<!-- Input field for 'query' -->
			<div class="flex-grow px-1">
				<label for="query" class="sr-only">Search Query</label>
				<input
					id="query"
					type="text"
					placeholder="Search events (e.g., 'red', delivery)"
					class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					bind:value={query}
					disabled={similaritySearchActive}
				/>
			</div>
			<!-- Submit Button -->
			<div>
				<button
					type="submit"
					class="flex w-full items-center justify-center gap-1 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
					disabled={isLoading || similaritySearchActive}
				>
					{#if isLoading && !similaritySearchActive}
						<span class="mr-2 inline-block animate-spin">
							<Loader2 />
						</span>Searching...
					{:else}
						Search
					{/if}
				</button>
			</div>
		</form>

		<!-- Search Options -->
		<!-- Keep the existing options grid, maybe disable inputs when similaritySearchActive is true -->
		<div class="grid grid-cols-1 items-end gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Date Range Picker -->
			<div class="pt-1">
				<label class="mb-1 block text-sm font-medium text-gray-300">Date Range</label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-start text-left font-normal',
							!dateRange.start && 'text-muted-foreground',
							similaritySearchActive && 'cursor-not-allowed opacity-50' // Disable style
						)}
						disabled={similaritySearchActive}
					>
						<CalendarIcon class="mr-2 size-4 shrink-0" />
						<!-- ... (keep date display logic) ... -->
						{#if dateRange.start}
							{#if dateRange.end}
								{df.format(dateRange.start.toDate(getLocalTimeZone()))} - {df.format(
									dateRange.end.toDate(getLocalTimeZone())
								)}
							{:else}
								{df.format(dateRange.start.toDate(getLocalTimeZone()))}
							{/if}
						{:else}
							Pick a date range
						{/if}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<RangeCalendar
							bind:value={dateRange}
							numberOfMonths={2}
							placeholder={today(getLocalTimeZone())}
							minValue={new CalendarDate(2020, 1, 1)}
							disabled={similaritySearchActive}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Labels Select -->
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-300">Labels</label>
				<Select.Root
					type="multiple"
					onValueChange={(e) => {
						if (!similaritySearchActive) {
							// Only update if not in similarity mode
							selectedLabels = e as unknown as LabelValue[];
						}
					}}
					value={selectedLabels}
					disabled={similaritySearchActive}
				>
					<Select.Trigger class={cn(similaritySearchActive && 'cursor-not-allowed opacity-50')}>
						{#if selectedLabels.length > 0}{selectedLabels.join(', ')}{:else}Any Label{/if}
					</Select.Trigger>
					<Select.Content>
						{#each availableLabels as label (label)}
							<Select.Item class="capitalize" value={label}>{label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Cameras Select -->
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-300">Cameras</label>
				<Select.Root
					type="multiple"
					onValueChange={(e) => {
						if (!similaritySearchActive) {
							// Only update if not in similarity mode
							cameras = e.map(
								(el) =>
									data.cameras.find((el2) => el2.id === parseInt(el)) ?? {
										id: -1,
										name: 'Error',
										category: 'Unknown',
										url: ''
									}
							);
						}
					}}
					value={cameras.map((c) => c.id.toString())}
					disabled={similaritySearchActive}
				>
					<Select.Trigger class={cn(similaritySearchActive && 'cursor-not-allowed opacity-50')}>
						{#if cameras.length > 0}{cameras.map((el) => el.name).join(', ')}{:else}Any Camera{/if}
					</Select.Trigger>
					<Select.Content>
						{#each data.cameras as camera (camera.id)}
							<Select.Item value={camera.id.toString()}>
								<!-- ... (keep camera item display) ... -->
								<div class="flex w-full items-center justify-between">
									<div>
										{camera.name}
									</div>
									<div>
										{camera.id}
									</div>
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Limit Input -->
			<div>
				<label for="limit" class="mb-1 block text-sm font-medium text-gray-300">Limit (1-100)</label
				>
				<input
					id="limit"
					type="number"
					min="1"
					max="100"
					class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
					bind:value={limit}
					oninput={handleLimitInput}
					disabled={isLoading}
				/>
			</div>
		</div>
	</div>

	<!-- Similarity Search Indicator -->
	{#if similaritySearchActive && !isLoading}
		<div
			class="mb-4 flex items-center justify-between rounded border-l-4 border-blue-500 bg-gray-800 p-3 text-blue-300"
		>
			<p class="text-sm">
				Showing results similar to event: <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
					>{similarityEventId}</code
				>
			</p>
			<button
				onclick={clearSimilaritySearchAndRefresh}
				class="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-200 transition-colors hover:bg-blue-700 hover:text-white"
				title="Clear similarity search and show results based on filters"
			>
				<XCircleIcon class="size-4" />
				Clear
			</button>
		</div>
	{/if}

	<!-- Loading Indicator for Similarity Search -->
	{#if similaritySearchActive && isLoading}
		<div
			class="mb-4 flex items-center gap-2 rounded border-l-4 border-blue-500 bg-gray-800 p-3 text-blue-300"
		>
			<span class="animate-spin"> <Loader2 class="size-4" /> </span>
			<p class="text-sm">
				Finding events similar to: <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
					>{similarityEventId}</code
				>...
			</p>
		</div>
	{/if}

	<!-- Error Message Display -->
	{#if searchError}
		<div class="mb-6 rounded border-l-4 border-red-500 bg-red-900 p-4 text-red-100">
			<p>Error: {searchError}</p>
		</div>
	{/if}

	<!-- Search Results -->
	{#if searchResults?.length > 0}
		<h2 class="mb-4 text-xl font-semibold text-white">Results ({searchResults.length})</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each searchResults as result (result.id)}
				<div
					class="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-shadow hover:shadow-xl"
				>
					<!-- Similarity Search Button -->
					<button
						class="absolute right-1 top-1 z-10 rounded-full bg-black/50 p-1 text-gray-300 transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800"
						title="Find similar events"
						onclick={() => performSearch({ searchType: 'similarity', eventId: result.id })}
						disabled={isLoading}
					>
						<SearchIcon class="size-4" />
					</button>

					<div class="relative aspect-video bg-gray-700">
						{#if result.thumbnail}
							<img
								src={`data:image/jpeg;base64,${result.thumbnail}`}
								alt={`Event ${result.id} - ${result.label}`}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						{:else}
							<!-- ... (keep no thumbnail placeholder) ... -->
							<div class="flex h-full w-full items-center justify-center text-xs text-gray-500">
								No Thumbnail
							</div>
						{/if}
					</div>
					<div class="p-3 text-sm">
						<!-- ... (keep existing result details) ... -->
						<p class="truncate font-semibold text-white" title={result.label}>
							Label: {result.label}{#if result.sub_label}
								({result.sub_label}){/if}
						</p>
						<p class="truncate text-gray-300" title={result.camera}>Camera: {result.camera}</p>
						<p class="text-xs text-gray-400">Time: {formatTimestamp(result.start_time)}</p>
						{#if result.score !== undefined}
							<p class="text-xs text-gray-400">Score: {result.score.toFixed(3)}</p>
						{/if}
						{#if result.sourceInstance}
							<p class="truncate text-xs text-gray-500" title={result.sourceInstance}>
								Source: {result.sourceInstance}
							</p>
						{/if}
						<div class="mt-1 text-xs text-gray-400">
							<span
								>Clip: {result.has_clip ? 'Yes' : 'No'} | Snapshot: {result.has_snapshot
									? 'Yes'
									: 'No'}</span
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if !isLoading && searchResults.length === 0 && !searchError}
		<div class="rounded border-l-4 border-yellow-500 bg-gray-800 p-4 text-yellow-400">
			{#if similaritySearchActive}
				No similar events found for event <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
					>{similarityEventId}</code
				>.
			{:else}
				No results found. Try adjusting the filters.
			{/if}
		</div>
	{/if}
</ScrollArea>
