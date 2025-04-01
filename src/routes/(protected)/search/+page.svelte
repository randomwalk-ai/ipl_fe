<script lang="ts">
	// --- UI Components & Utils ---
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { RangeCalendar } from '$lib/components/ui/range-calendar'; // Adjust path if needed
	import * as Popover from '$lib/components/ui/popover'; // Adjust path if needed
	import { buttonVariants } from '$lib/components/ui/button'; // Adjust path if needed
	import { cn } from '$lib/utils.js'; // Adjust path if needed
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

	// --- Data from load function ---
	let { data } = $props();

	// --- State ---
	let isLoading = $state(false);
	let searchResults: any[] = $state([]);
	let searchError: string | null = $state(null);

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
	let limit = $state(25); // Default as a number
	let cameras = $state<CameraType[]>([]);

	// Date Range State
	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	let dateRange: { start: DateValue | undefined; end: DateValue | undefined } = $state({
		start: undefined,
		end: undefined
	});

	// --- Derived State (Calculated from other states) ---
	let afterTimestamp = $derived(
		dateRange.start ? new Date(dateRange.start.toString()).getTime() : undefined
	);
	let beforeTimestamp = $derived(
		dateRange.end ? new Date(dateRange.end.toString()).getTime() : undefined
	);
	$inspect('Daterange: ', dateRange, beforeTimestamp, afterTimestamp);

	// --- Helper ---
	function formatTimestamp(unixTimestamp: number): string {
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
		// Need to manually update the input value in case it was corrected
		input.value = String(num);
	}

	async function performSearch() {
		isLoading = true;
		searchError = null;
		searchResults = [];

		try {
			const response = await fetch('/api/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query,
					labels: selectedLabels,
					limit,
					cameras: cameras.map((el) => `${el.id}_${el.name}`),
					after: afterTimestamp,
					before: beforeTimestamp,
					include_thumbnails: 1 // Always include thumbnails
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`API fetch error: ${response.status} ${response.statusText}`, errorText);
				searchError = `Failed to fetch search results: ${response.statusText}`;
				return; // Exit the function if there is an error
			}

			searchResults = await response.json();
		} catch (err: any) {
			console.error('Search Error:', err);
			searchError = err.message || 'An unexpected error occurred.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto h-full p-4">
	<h1 class="mb-6 text-2xl font-bold text-white">Frigate Event Search</h1>

	<!-- Search Form -->
	<div class="mb-8">
		<div class="mb-4 flex flex-col gap-4 md:flex-row">
			<div class="flex-grow">
				<label for="query" class="sr-only">Search Query</label>
				<input
					id="query"
					type="text"
					placeholder="Search events (e.g., 'red', delivery)"
					class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					bind:value={query}
				/>
			</div>
			<div>
				<button
					type="button"
					class="w-full rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto flex items-center justify-center gap-1"
					disabled={isLoading}
					onclick={performSearch}
				>
					{#if isLoading}
						<span class="mr-2 inline-block animate-spin">
							<Loader2 />
						</span>Searching...
					{:else}
						Search
					{/if}
				</button>
			</div>
		</div>

		<!-- Search Options -->
		<div class="grid grid-cols-1 items-end gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Date Range Picker -->
			<div class="pt-1">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 block text-sm font-medium text-gray-300">Date Range</label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-start text-left font-normal', // Ensure full width and alignment
							!dateRange.start && 'text-muted-foreground' // Style if no date picked
						)}
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
					<Popover.Content class="w-auto p-0" align="start">
						<RangeCalendar
							bind:value={dateRange}
							numberOfMonths={2}
							placeholder={today(getLocalTimeZone())}
							minValue={new CalendarDate(2020, 1, 1)}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Labels Checkboxes -->
			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-2 block text-sm font-medium text-gray-300">Labels</label>
				<div class="flex flex-wrap gap-x-4 gap-y-2">
					<Select.Root
						type="multiple"
						onValueChange={(e) => {
							selectedLabels = e as unknown as LabelValue[];
						}}
					>
						<Select.Trigger>
							{selectedLabels.join(', ')}
						</Select.Trigger>
						<Select.Content>
							{#each availableLabels as label (label)}
								<Select.Item class="capitalize" value={label}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Cameras Input -->
			<div>
				<label for="cameras" class="mb-1 block text-sm font-medium text-gray-300">Cameras</label>
				<!-- <input
					id="cameras"
					type="text"
					placeholder="Comma-separated camera names"
					class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
					bind:value={cameras}
				/> -->
				<Select.Root
					type="multiple"
					onValueChange={(e) => {
						cameras = e.map(
							(el) =>
								data.cameras.find((el2) => el2.id === parseInt(el)) ?? {
									id: -1,
									name: 'Error',
									category: 'Unknown',
									url: ''
								}
						);
					}}
				>
					<Select.Trigger>
						{cameras.map((el) => el.name).join(', ')}
					</Select.Trigger>
					<Select.Content>
						{#each data.cameras as camera (camera.id)}
							<Select.Item value={camera.id.toString()}>
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
				/>
			</div>
		</div>
	</div>

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
				<!-- Same result display structure as before -->
				<div
					class="overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-shadow hover:shadow-xl"
				>
					<div class="relative aspect-video bg-gray-700">
						{#if result.thumbnail}
							<img
								src={`data:image/jpeg;base64,${result.thumbnail}`}
								alt={`Event ${result.id} - ${result.label}`}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center text-xs text-gray-500">
								No Thumbnail
							</div>
						{/if}
					</div>
					<div class="p-3 text-sm">
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
			No results found. Try adjusting the filters.
		</div>
	{/if}
</div>
