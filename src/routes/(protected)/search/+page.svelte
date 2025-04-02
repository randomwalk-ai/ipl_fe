<script lang="ts">
	// --- UI Components & Utils ---
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XCircleIcon from '@lucide/svelte/icons/x-circle';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn, frigateInstances } from '$lib/utils.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import type { CameraType, FrigateEvent } from '../types.js';
	import { Loader2 } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	// --- Data from load function ---
	let { data } = $props();

	// --- State ---
	let isLoading = $state(false);
	let searchResults: FrigateEvent[] = $state([]);
	let searchError: string | null = $state(null);
	let similaritySearchActive = $state(false);
	let similarityEventId = $state<string | null>(null);

	// --- Form State ---
	const availableLabels = [
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
	let limit = $state(25);
	let cameras = $state<CameraType[]>([]);

	// Date Range State
	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	const dtf = new DateFormatter('en-US', { dateStyle: 'medium', timeStyle: 'medium' }); // Add time formatter
	let dateRange: { start: DateValue | undefined; end: DateValue | undefined } = $state({
		start: undefined,
		end: undefined
	});

	// --- Derived State ---
	let afterTimestamp = $derived(
		dateRange.start
			? Math.floor(dateRange.start.toDate(getLocalTimeZone()).getTime() / 1000)
			: undefined // Use seconds (start of the selected day)
	);
	let beforeTimestamp = $derived(
		dateRange.end
			? Math.floor(
					// Get the date for the *next* day at 00:00:00 to make the range inclusive of the end date
					dateRange.end.add({ days: 1 }).toDate(getLocalTimeZone()).getTime() / 1000
				)
			: undefined // Use seconds (start of the day *after* the selected end day)
	);
	// $inspect('Daterange: ', dateRange, beforeTimestamp, afterTimestamp);

	// --- Helper ---
	function formatTimestamp(unixTimestamp: number): string {
		if (!unixTimestamp) return 'N/A';
		try {
			// Use the detailed formatter (dtf) for popups maybe? Or keep simple for cards.
			// Let's use dtf for more precision in the dialog.
			return dtf.format(new Date(unixTimestamp * 1000));
		} catch (e) {
			return 'Invalid Date';
		}
	}
	// Helper for card display (less precise)
	function formatTimestampShort(unixTimestamp: number): string {
		if (!unixTimestamp) return 'N/A';
		try {
			return new Date(unixTimestamp * 1000).toLocaleString();
		} catch (e) {
			return 'Invalid Date';
		}
	}

	function handleLimitInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let num = parseInt(input.value, 10);
		if (isNaN(num) || num < 1) num = 1;
		if (num > 100) num = 100;
		limit = num;
		input.value = String(num);
	}

	// --- Search Function (Modified) ---
	async function performSearch(options?: { searchType?: 'similarity'; eventId?: string }) {
		isLoading = true;
		searchError = null;
		searchResults = []; // Clear previous results only if it's a NEW search

		// Keep existing results visible if it's a similarity search initiated from a card
		if (!(options?.searchType === 'similarity' && options.eventId)) {
			searchResults = [];
		}

		let requestBody: Record<string, any>;
		const userTimezone = getLocalTimeZone();

		if (options?.searchType === 'similarity' && options.eventId) {
			similaritySearchActive = true;
			similarityEventId = options.eventId;
			requestBody = {
				search_type: 'similarity',
				event_id: options.eventId,
				limit: limit,
				include_thumbnails: 1,
				timezone: userTimezone
			};
			console.log('Performing similarity search for event:', options.eventId);
			// Clear form fields visually when similarity search is active
			query = '';
			selectedLabels = [];
			cameras = [];
			dateRange = { start: undefined, end: undefined };
		} else {
			similaritySearchActive = false;
			similarityEventId = null;
			requestBody = {
				query,
				labels: selectedLabels,
				limit,
				cameras: cameras.map((el) => el.name),
				after: afterTimestamp, // Use derived seconds timestamp
				before: beforeTimestamp, // Use derived seconds timestamp
				include_thumbnails: 1,
				timezone: userTimezone
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
				searchError = `Failed to fetch search results: ${response.statusText} - ${errorText}`;
				similaritySearchActive = false;
				similarityEventId = null;
				searchResults = []; // Clear results on error
				return;
			}

			searchResults = (await response.json()) as FrigateEvent[];
			if (searchResults.length === 0 && options?.searchType === 'similarity') {
				// Optionally keep the similarity active state even if no results?
				// searchError = `No similar events found for ${options.eventId}`; // Or use the dedicated 'no results' message
			}
		} catch (err: any) {
			console.error('Search Error:', err);
			searchError = err.message || 'An unexpected error occurred.';
			similaritySearchActive = false;
			similarityEventId = null;
			searchResults = []; // Clear results on error
		} finally {
			isLoading = false;
			console.log('Set isLoading to false');
		}
	}

	// Function to clear similarity search and run a normal search using current form values
	function clearSimilaritySearchAndRefresh() {
		// Reset state and perform a standard search
		similaritySearchActive = false;
		similarityEventId = null;
		performSearch();
	}

	// Ensure source_instance is a valid URL base (add http:// if needed, remove trailing slash)
	function normalizeBaseUrl(url: string | undefined | null): string | null {
		if (!url) return null;
		let normalized = url.trim();
		if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
			// Very basic assumption - might need refinement based on actual source_instance format
			normalized = 'http://' + normalized;
		}
		if (normalized.endsWith('/')) {
			normalized = normalized.slice(0, -1);
		}
		return normalized;
	}
</script>

<ScrollArea class="h-full overflow-x-visible p-4 text-gray-200">
	<h1 class="mb-6 text-2xl font-bold text-white">Frigate Event Search</h1>

	<!-- Search Form -->
	<div class="mb-8">
		<form
			class="mb-4 flex flex-col gap-4 md:flex-row"
			onsubmit={(e) => {
				e.preventDefault();
				performSearch(); // Trigger standard search
			}}
		>
			<!-- Input field for 'query' -->
			<div class="flex-grow">
				<label for="query" class="sr-only">Search Query</label>
				<input
					id="query"
					type="text"
					placeholder="Search events (e.g., 'red', delivery)"
					class={cn(
						'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
						similaritySearchActive && 'cursor-not-allowed bg-gray-700 opacity-50' // Style when disabled
					)}
					bind:value={query}
					disabled={similaritySearchActive || isLoading}
				/>
			</div>
			<!-- Submit Button -->
			<div>
				<button
					type="submit"
					class={cn(
						'flex w-full items-center justify-center gap-1 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 md:w-auto',
						'disabled:cursor-not-allowed disabled:opacity-50'
					)}
					disabled={isLoading || similaritySearchActive}
				>
					{#if isLoading && !similaritySearchActive}
						<div class="animate-spin">
							<Loader2 />
						</div>
						<div>Searching...</div>
					{:else}
						<SearchIcon class="mr-1 size-4" /> Search
					{/if}
				</button>
			</div>
		</form>

		<!-- Search Options -->
		<div class="grid grid-cols-1 items-end gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Date Range Picker -->
			<div class="pt-1">
				<label class="mb-1 block text-sm font-medium text-gray-300">Date Range</label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-start border-gray-700 bg-gray-800 text-left font-normal hover:bg-gray-700', // Adjusted colors
							!dateRange.start && 'text-muted-foreground',
							(similaritySearchActive || isLoading) && 'cursor-not-allowed opacity-50' // Disable style
						)}
						disabled={similaritySearchActive || isLoading}
					>
						<CalendarIcon class="mr-2 size-4 shrink-0" />
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
					<Popover.Content class="w-auto border-gray-700 bg-gray-900 p-0" align="start">
						<RangeCalendar
							bind:value={dateRange}
							numberOfMonths={2}
							placeholder={today(getLocalTimeZone())}
							minValue={new CalendarDate(2020, 1, 1)}
							disabled={similaritySearchActive || isLoading}
							class="[&_caption]:text-sm [&_td]:text-xs"
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Labels Select -->
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-300">Labels</label>
				<Select.Root
					type="multiple"
					onValueChange={(e) => {
						selectedLabels = e as unknown as LabelValue[];
					}}
					value={selectedLabels}
					disabled={similaritySearchActive || isLoading}
				>
					<Select.Trigger class={cn(similaritySearchActive && 'cursor-not-allowed opacity-50')}>
						{#if selectedLabels.length > 0}{selectedLabels.join(', ')}{:else}Any Label{/if}
					</Select.Trigger>
					<Select.Content class="border-gray-700 bg-gray-800 text-gray-200">
						{#each availableLabels as label (label)}
							<Select.Item
								class="capitalize data-[highlighted]:bg-blue-600 data-[state=checked]:bg-blue-700"
								value={label}>{label}</Select.Item
							>
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
						cameras = e.map(
							(el) =>
								data.cameras.find((el2) => el2.id.toString() === el) ?? {
									// Ensure string comparison
									id: -1,
									name: 'Error',
									category: 'Unknown',
									url: ''
								}
						);
					}}
					value={cameras.map((c) => c.id.toString())}
					disabled={similaritySearchActive || isLoading}
				>
					<Select.Trigger class={cn(similaritySearchActive && 'cursor-not-allowed opacity-50')}>
						{#if cameras.length > 0}{cameras.map((el)=>el.name).join(', ')}{:else}Any Camera{/if}
					</Select.Trigger>
					<Select.Content class="border-gray-700 bg-gray-800 text-gray-200">
						{#each data.cameras as camera (camera.id)}
							<Select.Item
								value={camera.id.toString()}
								class="data-[highlighted]:bg-blue-600 data-[state=checked]:bg-blue-700"
							>
								<div class="flex w-full items-center justify-between text-sm">
									<span>{camera.name}</span>
									<span class="font-mono text-xs text-gray-400">ID: {camera.id}</span>
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
					class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
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
			class="mb-4 flex items-center justify-between rounded border-l-4 border-blue-500 bg-gray-800/50 p-3 text-blue-300"
		>
			<p class="text-sm">
				Showing results similar to event: <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
					>{similarityEventId}</code
				>
				<span class="ml-2 text-xs italic text-gray-400">(Filters disabled)</span>
			</p>
			<button
				onclick={clearSimilaritySearchAndRefresh}
				class="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-200 transition-colors hover:bg-blue-700 hover:text-white"
				title="Clear similarity search and show results based on filters"
				disabled={isLoading}
			>
				<XCircleIcon class="size-4" />
				Clear & Refresh
			</button>
		</div>
	{/if}

	<!-- Loading Indicator for Similarity Search -->
	{#if similaritySearchActive && isLoading}
		<div
			class="mb-4 flex items-center gap-2 rounded border-l-4 border-blue-500 bg-gray-800/50 p-3 text-blue-300"
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
		<div class="mb-6 rounded border-l-4 border-red-500 bg-red-900/30 p-4 text-red-200">
			<p><strong class="font-semibold">Error:</strong> {searchError}</p>
		</div>
	{/if}

	<!-- Search Results -->
	{#if searchResults?.length > 0}
		<h2 class="mb-4 text-xl font-semibold text-white">
			Results {#if similaritySearchActive && similarityEventId}(similar to {similarityEventId}){/if}
			({searchResults.length})
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each searchResults as result (result.id)}
				{@const baseUrl = normalizeBaseUrl(result.source_instance)}
				{@const snapshotUrl =
					baseUrl && result.has_snapshot ? `${baseUrl}/api/events/${result.id}/snapshot.jpg` : null}
				{@const clipUrl =
					baseUrl && result.has_clip ? `${baseUrl}/api/events/${result.id}/clip.mp4` : null}
				<Dialog.Root>
					<Dialog.Trigger>
						{#snippet child({ props: triggerProps })}
							<div
								class="relative cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all hover:shadow-xl hover:ring-2 hover:ring-blue-500"
								{...triggerProps}
							>
								<!-- Similarity Search Button -->
								<button
									class="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1.5 text-gray-300 backdrop-blur-sm transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
									title="Find similar events"
									onclick={(e) => {
										e.stopPropagation(); // Prevent dialog from opening
										if (!isLoading) {
											performSearch({ searchType: 'similarity', eventId: result.id });
										}
									}}
									disabled={isLoading ||
										(similaritySearchActive && similarityEventId === result.id)}
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
										<div
											class="flex h-full w-full items-center justify-center text-xs text-gray-500"
										>
											No Thumbnail
										</div>
									{/if}
									<!-- Similarity score overlay -->
									{#if result.search_distance !== undefined}
										<div
											class="absolute bottom-0 left-0 bg-black/60 px-1.5 py-0.5 text-xs text-blue-300 backdrop-blur-sm"
										>
											Dist: {result.search_distance.toFixed(3)}
										</div>
									{/if}
								</div>
								<div class="space-y-0.5 p-3 text-sm">
									<p class="truncate font-semibold text-white" title={result.label}>
										{result.label}{#if result.sub_label}
											<span class="text-gray-400">({result.sub_label})</span>{/if}
									</p>
									<p class="truncate text-xs text-gray-300" title={result.camera}>
										<span class="font-medium">Cam:</span>
										{result.camera}
									</p>
									<p class="text-xs text-gray-400">
										<span class="font-medium">Time:</span>
										{formatTimestampShort(result.start_time)}
									</p>
									{#if result.top_score !== undefined && result.top_score !== null}
										<p class="text-xs text-gray-400">
											<span class="font-medium">Score:</span>
											{typeof result.top_score === 'number'
												? result.top_score.toFixed(3)
												: result.top_score}
										</p>
									{/if}
									{#if result.source_instance}
										<p class="truncate text-xs text-gray-500" title={result.source_instance}>
											<span class="font-medium">Src:</span>
											{frigateInstances.find((el)=>el.url===result.source_instance)?.name}
										</p>
									{/if}
									<div class="pt-1 text-xs text-gray-400">
										<span class={result.has_clip ? 'text-green-400' : 'text-gray-500'}>Clip</span> |
										<span class={result.has_snapshot ? 'text-green-400' : 'text-gray-500'}>
											Snap</span
										>
									</div>
								</div>
							</div>
						{/snippet}
					</Dialog.Trigger>

					<Dialog.Content class="max-w-3xl border-gray-700 bg-background text-gray-200">
						<Dialog.Header>
							<Dialog.Title class="text-xl text-white">Event Details: {result.id}</Dialog.Title>
							<Dialog.Description class="text-gray-400">
								{result.label} on camera "{result.camera}"
							</Dialog.Description>
						</Dialog.Header>

						<Tabs.Root value="details" class="w-full pt-2">
							<Tabs.List class="border-b border-gray-700">
								<Tabs.Trigger
									value="details"
									class="data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
								>
									Details
								</Tabs.Trigger>
								{#if snapshotUrl}
									<Tabs.Trigger
										value="snapshot"
										class="data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
									>
										Snapshot
									</Tabs.Trigger>
								{:else if result.has_snapshot}
									<Tabs.Trigger value="snapshot" disabled class="cursor-not-allowed text-gray-600"
										>Snapshot (No URL)</Tabs.Trigger
									>
								{/if}
								{#if clipUrl}
									<Tabs.Trigger
										value="video"
										class="data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
									>
										Video
									</Tabs.Trigger>
								{:else if result.has_clip}
									<Tabs.Trigger value="video" disabled class="cursor-not-allowed text-gray-600"
										>Video (No URL)</Tabs.Trigger
									>
								{/if}
							</Tabs.List>

							<Tabs.Content value="details" class="mt-4 text-sm outline-none focus:ring-0">
								<!-- Apply min-w-0 to the direct children of the grid (the <div> elements) -->
								<dl class="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Event ID</dt>

										<dd class="truncate break-all font-mono text-gray-200">{result.id}</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Label</dt>

										<dd class="truncate text-gray-200">
											{result.label}{#if result.sub_label}
												<span class="text-gray-400">({result.sub_label})</span>{/if}
										</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Camera</dt>
										<dd class="truncate text-gray-200">{result.camera}</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Source Instance</dt>

										<dd class="truncate font-mono text-gray-200" title={result.source_instance}>
											{result.source_instance || 'N/A'}
										</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Start Time</dt>
										<dd class="text-gray-200">{formatTimestamp(result.start_time)}</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">End Time</dt>
										<dd class="text-gray-200">
											{result.end_time ? formatTimestamp(result.end_time) : 'Still Active / N/A'}
										</dd>
									</div>
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Zones</dt>

										<dd class="truncate text-gray-200">
											{result.zones?.length > 0 ? result.zones.join(', ') : 'None'}
										</dd>
									</div>
									{#if result.top_score !== undefined && result.top_score !== null}
										<div class="min-w-0 md:col-span-1">
											<dt class="font-semibold text-gray-400">Top Score</dt>
											<dd class="text-gray-200">
												{typeof result.top_score === 'number'
													? result.top_score.toFixed(4)
													: result.top_score}
											</dd>
										</div>
									{/if}
									{#if result.search_distance !== undefined}
										<div class="min-w-0 md:col-span-1">
											<dt class="font-semibold text-gray-400">Similarity Distance</dt>
											<dd class="text-gray-200">{result.search_distance.toFixed(4)}</dd>
										</div>
									{/if}
									<div class="min-w-0 md:col-span-1">
										<dt class="font-semibold text-gray-400">Media Available</dt>
										<dd class="flex items-center gap-2 text-gray-200">
											<span class={result.has_snapshot ? 'text-green-400' : 'text-red-400'}
												>Snapshot</span
											>
											|
											<span class={result.has_clip ? 'text-green-400' : 'text-red-400'}>Clip</span>
										</dd>
									</div>
									{#if result.plus_id}
										<div class="min-w-0 md:col-span-1">
											<dt class="font-semibold text-gray-400">Plus ID</dt>

											<dd class="truncate break-all font-mono text-gray-200">{result.plus_id}</dd>
										</div>
									{/if}
								</dl>
							</Tabs.Content>

							{#if result.has_snapshot}
								<Tabs.Content value="snapshot" class="mt-4 outline-none focus:ring-0">
									{#if snapshotUrl}
										<div class="relative">
											<img
												src={snapshotUrl}
												alt="Snapshot for event {result.id}"
												class="mx-auto max-h-[70vh] max-w-full rounded object-contain"
												loading="lazy"
												onerror={(e) => {
													const target = e.target as HTMLImageElement;
													target.style.display = 'none'; // Hide broken image
													// Find the sibling error message and display it
													const errorMsg = target.nextElementSibling;
													if (errorMsg && errorMsg.tagName === 'P') {
														(errorMsg as HTMLElement).style.display = 'block';
													}
												}}
											/>
											<p
												class="absolute inset-x-0 top-0 mt-2 text-center text-red-400"
												style="display: none;"
											>
												Failed to load snapshot. Check console & ensure '{baseUrl}' is accessible.
											</p>
										</div>
									{:else}
										<div
											class="flex h-40 items-center justify-center rounded border border-dashed border-gray-600 bg-gray-800 text-center text-gray-400"
										>
											<p>
												Snapshot exists but the source instance URL ('{result.source_instance ||
													'missing'}') seems invalid or missing.<br />Cannot construct snapshot URL.
											</p>
										</div>
									{/if}
								</Tabs.Content>
							{/if}

							{#if result.has_clip}
								<Tabs.Content value="video" class="mt-4 outline-none focus:ring-0">
									{#if clipUrl}
										<div class="relative">
											<!-- svelte-ignore a11y_media_has_caption -->
											<video
												src={clipUrl}
												controls
												preload="metadata"
												class="max-h-[70vh] w-full rounded bg-black"
												onerror={(e) => {
													const target = e.target as HTMLVideoElement;
													target.style.display = 'none'; // Hide broken video player
													// Find the sibling error message and display it
													const errorMsg = target.nextElementSibling;
													if (errorMsg && errorMsg.tagName === 'P') {
														(errorMsg as HTMLElement).style.display = 'block';
													}
												}}
											>
												Your browser does not support the video tag.
											</video>
											<p
												class="absolute inset-x-0 top-0 mt-2 text-center text-red-400"
												style="display: none;"
											>
												Failed to load video clip. Check console & ensure '{baseUrl}' is accessible.
											</p>
										</div>
									{:else}
										<div
											class="flex h-40 items-center justify-center rounded border border-dashed border-gray-600 bg-gray-800 text-center text-gray-400"
										>
											<p>
												Video clip exists but the source instance URL ('{result.source_instance ||
													'missing'}') seems invalid or missing.<br />Cannot construct video URL.
											</p>
										</div>
									{/if}
								</Tabs.Content>
							{/if}
						</Tabs.Root>
					</Dialog.Content>
				</Dialog.Root>
			{/each}
		</div>
	{:else if !isLoading && searchResults.length === 0 && !searchError}
		<div
			class="rounded border-l-4 border-yellow-500 bg-yellow-900/30 p-4 text-center text-yellow-300"
		>
			{#if similaritySearchActive}
				No similar events found for event <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
					>{similarityEventId}</code
				>.
				<button
					class="ml-2 text-blue-300 underline hover:text-blue-200"
					onclick={clearSimilaritySearchAndRefresh}>Clear similarity search</button
				>
			{:else}
				No results found matching your criteria. Try adjusting the filters or search query.
			{/if}
		</div>
	{/if}
</ScrollArea>
