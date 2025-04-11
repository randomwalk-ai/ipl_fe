<script lang="ts">
	// --- UI Components & Utils ---
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ImagePlusIcon from '@lucide/svelte/icons/image-plus'; // Icon for image upload
	import FileIcon from '@lucide/svelte/icons/file'; // Icon for selected file
	import XCircleIcon from '@lucide/svelte/icons/x-circle';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants, Button } from '$lib/components/ui/button'; // Import Button
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
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { getPageState } from '$lib/stores/index.svelte.js';
	import { Input } from '$lib/components/ui/input/index.js'; // Use Input component
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Tooltip from '$lib/components/ui/tooltip';

	// --- Data from load function ---
	let { data } = $props();
	let PageState = getPageState();

	PageState.title = 'Universal Search';

	// --- State ---
	let isLoading = $state(false);
	let searchResults: FrigateEvent[] = $state([]);
	let searchError: string | null = $state(null);
	let similaritySearchActive = $state(false); // Is a similarity search currently displayed?
	let similaritySourceDescription = $state<string | null>(null); // e.g., "image upload", "event xyz"
	let cameraSearchQuery = $state('');
	let selectedImageFile = $state<File | null>(null); // State for uploaded image file
	let imageInputRef: HTMLInputElement | null = $state(null); // Ref for file input

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
	let conf = $state(85); // Represents min_confidence (0-100)
	// *** NEW: State for Max Distance ***
	let maxDistance = $state<number | undefined>(undefined); // Undefined means no limit
	let cameras = $state<CameraType[]>([]);
	let sortBy: 'date_desc' | 'score_desc' | 'date_asc' | 'score_asc' = $state('date_desc'); // Match backend options

	// Date Range State
	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	const dtf = new DateFormatter('en-US', { dateStyle: 'medium', timeStyle: 'medium' });
	let dateRange: { start: DateValue | undefined; end: DateValue | undefined } = $state({
		start: undefined,
		end: undefined
	});

	// --- Derived State ---
	let afterTimestamp = $derived(
		dateRange.start
			? Math.floor(dateRange.start.toDate(getLocalTimeZone()).getTime() / 1000)
			: undefined
	);
	let beforeTimestamp = $derived(
		dateRange.end
			? Math.floor(dateRange.end.add({ days: 1 }).toDate(getLocalTimeZone()).getTime() / 1000)
			: undefined
	);

	// Determine if standard search fields should be disabled
	let standardFieldsDisabled = $derived(isLoading);

	// --- Helpers ---
	// ... (keep existing helper functions: formatTimestamp, formatTimestampShort, handleLimitInput, handleConfInput, handleImageFileChange, clearSelectedImage, base64ToFile, normalizeBaseUrl) ...
	function formatTimestamp(unixTimestamp: number): string {
		if (!unixTimestamp) return 'N/A';
		try {
			return dtf.format(new Date(unixTimestamp * 1000));
		} catch (e) {
			return 'Invalid Date';
		}
	}
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
		if (num > 1000) num = 1000; // Allow higher limit if backend supports it
		limit = num;
		input.value = String(num);
	}

	function handleConfInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let num = parseInt(input.value, 10);
		if (isNaN(num) || num < 0) num = 0; // Allow 0 confidence
		if (num > 100) num = 100;
		conf = num;
		input.value = String(num);
	}

	// *** NEW: Handler for Max Distance Input ***
	function handleMaxDistInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let val = input.value.trim();
		if (val === '') {
			maxDistance = undefined; // Allow clearing the input
			return;
		}
		let num = parseFloat(val);
		if (isNaN(num) || num < 0) {
			num = 0; // Minimum distance is 0
			input.value = '0';
		}
		// Optional: Add a maximum reasonable distance if needed, e.g., 2.0 for cosine distance
		// if (num > 2.0) num = 2.0;
		maxDistance = num;
		// Don't force rounding/formatting here, keep it as user entered if valid float
	}

	function handleImageFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			selectedImageFile = file;
			// query = ''; // Optional: Decide if selecting image should clear text query
			similaritySearchActive = false; // Reset similarity display state until search is performed
			similaritySourceDescription = null;
			console.log('Selected image:', file.name, file.type, file.size);
		} else {
			selectedImageFile = null;
		}
	}

	function clearSelectedImage() {
		selectedImageFile = null;
		if (imageInputRef) {
			imageInputRef.value = ''; // Clear the file input visually
		}
		// Optionally reset similarity active state if needed
		// similaritySearchActive = false;
		// similaritySourceDescription = null;
	}

	function base64ToFile(base64: string, filename: string, mimeType = 'image/jpeg'): File | null {
		try {
			const byteCharacters = atob(base64);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: mimeType });
			return new File([blob], filename, { type: mimeType });
		} catch (e) {
			console.error('Error converting base64 to File:', e);
			return null;
		}
	}

	// --- Search Function ---
	async function performSearch(options?: {
		similarityImageFile?: File;
		similaritySourceDesc?: string;
	}) {
		isLoading = true;
		searchError = null;

		const currentImageFile = options?.similarityImageFile ?? selectedImageFile;
		const isSimilaritySearch = !!currentImageFile;
		const currentSourceDesc =
			options?.similaritySourceDesc ??
			(selectedImageFile ? `uploaded file: ${selectedImageFile.name}` : null);

		searchResults = [];
		similaritySearchActive = false;
		similaritySourceDescription = null;

		const formData = new FormData();
		const userTimezone = getLocalTimeZone();

		// --- Append Common Fields ---
		formData.append('limit', limit.toString());
		formData.append('cameras', cameras.length > 0 ? cameras.map((c) => c.name).join(',') : 'all');
		formData.append('labels', selectedLabels.length > 0 ? selectedLabels.join(',') : 'all');
		if (afterTimestamp !== undefined) formData.append('after', afterTimestamp.toString());
		if (beforeTimestamp !== undefined) formData.append('before', beforeTimestamp.toString());
		if (userTimezone) formData.append('timezone', userTimezone);
		formData.append('include_thumbnails', '1');
		formData.append('sort', sortBy);
		formData.append('min_confidence', conf.toString());

		// *** NEW: Append max_distance if defined and valid ***
		if (typeof maxDistance === 'number' && !isNaN(maxDistance) && maxDistance >= 0) {
			formData.append('max_distance', maxDistance.toString());
		}

		// --- Append Search-Specific Fields ---
		if (isSimilaritySearch && currentImageFile) {
			console.log(
				'Performing SIMILARITY search with image:',
				currentSourceDesc ?? 'Unknown source',
				// *** Update log to include maxDistance ***
				'and filters:',
				{
					cameras: cameras.map((c) => c.name),
					labels: selectedLabels,
					after: afterTimestamp,
					before: beforeTimestamp,
					limit,
					conf,
					maxDistance,
					sortBy
				}
			);
			formData.append('image', currentImageFile, currentImageFile.name);
		} else if (query && query.trim() !== '') {
			console.log(
				'Performing STANDARD TEXT search with query:',
				query,
				// *** Update log to include maxDistance ***
				'and filters:',
				{
					cameras: cameras.map((c) => c.name),
					labels: selectedLabels,
					after: afterTimestamp,
					before: beforeTimestamp,
					limit,
					conf,
					maxDistance,
					sortBy
				}
			);
			formData.append('query', query.trim());
		} else {
			searchError = 'Please provide either a text query or select an image for search.';
			isLoading = false;
			return;
		}

		try {
			// Endpoint should be /api/events/search based on file structure
			// Using /api/searchDirect implies a different endpoint - adjust if needed
			const response = await fetch('/api/searchDirect', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`API fetch error: ${response.status} ${response.statusText}`, errorText);
				searchError = `Failed to fetch search results: ${response.statusText} - ${errorText}`;
				similaritySearchActive = false;
				similaritySourceDescription = null;
				searchResults = [];
				return;
			}

			searchResults = (await response.json()) as FrigateEvent[];

			if (isSimilaritySearch) {
				similaritySearchActive = true;
				similaritySourceDescription = currentSourceDesc;
			} else {
				similaritySearchActive = false;
				similaritySourceDescription = null;
			}

			if (searchResults.length === 0 && isSimilaritySearch) {
				console.log(`No similar events found for ${currentSourceDesc} with applied filters.`);
			} else if (searchResults.length === 0) {
				console.log(`No events found for query "${query}" with applied filters.`);
			}
		} catch (err: any) {
			console.error('Search Error:', err);
			searchError = err.message || 'An unexpected error occurred.';
			similaritySearchActive = false;
			similaritySourceDescription = null;
			searchResults = [];
		} finally {
			isLoading = false;
			console.log('Set isLoading to false');
		}
	}

	// Function to clear similarity search and run a normal search using current form values
	function clearSimilaritySearchAndRefresh() {
		similaritySearchActive = false;
		similaritySourceDescription = null;
		clearSelectedImage();
		if (query.trim() !== '') {
			performSearch();
		} else {
			searchResults = [];
			searchError = null;
		}
	}

	function normalizeBaseUrl(url: string | undefined | null): string | null {
		if (!url) return null;
		let normalized = url.trim();
		if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
			normalized = 'http://' + normalized;
		}
		if (normalized.endsWith('/')) {
			normalized = normalized.slice(0, -1);
		}
		return normalized;
	}

	function getSortLabel(): string {
		switch (sortBy) {
			case 'date_desc':
				return 'Newest First';
			case 'date_asc':
				return 'Oldest First';
			case 'score_desc':
				return 'Most Similar/Confident First';
			case 'score_asc':
				return 'Least Similar/Confident First';
			default:
				return 'Unknown Sort';
		}
	}
</script>

<Tooltip.Provider>
	<ScrollArea class="h-full overflow-x-visible p-4 text-gray-200">
		<!-- Search Form -->
		<div class="mb-8">
			<form
				class="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-end"
				onsubmit={(e) => {
					e.preventDefault();
					if (query.trim() || selectedImageFile) {
						performSearch();
					} else {
						searchError = 'Please enter a text query or select an image.';
					}
				}}
			>
				<!-- Text Query Input -->
				<div class="w-full flex-grow">
					<label for="query" class="sr-only">Search Query (Text)</label>
					<Input
						id="query"
						type="text"
						placeholder="Text search (e.g., 'red', 'delivery')"
						class={cn(
							'w-full border-gray-700 bg-gray-800 text-white focus:ring-blue-500',
							isLoading && 'cursor-not-allowed bg-gray-700 opacity-50'
						)}
						bind:value={query}
						oninput={() => {
							if (selectedImageFile) clearSelectedImage();
						}}
						disabled={isLoading}
					/>
				</div>

				<!-- OR Separator -->
				<div class="hidden self-center pb-2 text-gray-500 md:block">OR</div>

				<!-- Image Upload Button / Indicator -->
				<div class="w-full md:w-auto">
					{#if selectedImageFile}
						<div
							class="flex items-center gap-2 rounded-md border border-dashed border-blue-600 bg-gray-800 p-2 text-sm"
						>
							<FileIcon class="size-4 shrink-0 text-blue-400" />
							<span class="truncate" title={selectedImageFile.name}>{selectedImageFile.name}</span>
							<button
								type="button"
								class="ml-auto text-gray-400 hover:text-white"
								title="Clear selected image"
								onclick={clearSelectedImage}
								disabled={isLoading}
							>
								<XCircleIcon class="size-4" />
							</button>
						</div>
					{:else}
						<Button
							type="button"
							variant="outline"
							class={cn(
								'w-full justify-center gap-2 border-gray-700 bg-gray-800 hover:bg-gray-700 md:w-auto',
								isLoading && 'cursor-not-allowed opacity-50'
							)}
							onclick={() => {
								if (query) query = '';
								imageInputRef?.click();
							}}
							disabled={isLoading}
							title="Select an image for similarity search"
						>
							<ImagePlusIcon class="size-4" />
							Suspect Face Search
						</Button>
						<input
							type="file"
							accept="image/png, image/jpeg, image/webp"
							class="hidden"
							bind:this={imageInputRef}
							onchange={(e) => {
								if (query) query = '';
								handleImageFileChange(e);
							}}
							disabled={isLoading}
						/>
					{/if}
				</div>

				<!-- Submit Button -->
				<div class="w-full md:w-auto">
					<Button
						type="submit"
						class={cn(
							'w-full justify-center gap-1 font-medium md:w-auto',
							'disabled:cursor-not-allowed disabled:opacity-50'
						)}
						disabled={isLoading || (!query.trim() && !selectedImageFile)}
					>
						{#if isLoading}
							<div class="animate-spin"><Loader2 class="size-4" /></div>
							<div>Searching...</div>
						{:else}
							<SearchIcon class="mr-1 size-4" />
							{#if selectedImageFile}Find Similar{:else}Search{/if}
						{/if}
					</Button>
				</div>
			</form>
			<p class="mb-4 text-xs italic text-gray-400">
				Filters (Date, Labels, Cameras, Confidence, Max Distance, Sort) apply to both text and image
				searches.
			</p>
			<div
				class="grid grid-cols-1 items-end gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
			>
				<div class="pt-1">
					<label class="mb-1 block text-sm font-medium text-gray-300">Date Range</label>
					<Popover.Root>
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-full justify-start border-gray-700 bg-gray-800 text-left font-normal hover:bg-gray-700',
								!dateRange.start && 'text-muted-foreground',
								standardFieldsDisabled && 'cursor-not-allowed opacity-50'
							)}
							disabled={standardFieldsDisabled}
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
								disabled={standardFieldsDisabled}
								class="[&_caption]:text-sm [&_td]:text-xs"
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-300">Labels</label>
					<Select.Root
						type="multiple"
						onValueChange={(e) => {
							selectedLabels = e as unknown as LabelValue[];
						}}
						value={selectedLabels}
						disabled={standardFieldsDisabled}
					>
						<Select.Trigger class={cn(standardFieldsDisabled && 'cursor-not-allowed opacity-50')}>
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
							{#if cameras.length > 0}
								{cameras.length} {cameras.length === 1 ? 'camera' : 'cameras'} selected
							{:else}Any Camera{/if}
						</Select.Trigger>
						<Select.Content class="border-gray-700 bg-gray-800 text-gray-200">
							<!-- Add search input field -->
							<div class="sticky top-0 z-50 border-b border-gray-700 bg-gray-800">
								<div class="p-1">
									<input
										type="text"
										placeholder="Search cameras..."
										class="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
										bind:value={cameraSearchQuery}
									/>
								</div>
								<div class="flex justify-between px-1 pb-1">
									<button
										type="button"
										class="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
										onclick={() => {
											cameras = data.cameras.filter((camera) =>
												camera.name.toLowerCase().includes(cameraSearchQuery.toLowerCase())
											);
										}}
									>
										Select All
									</button>
									<button
										type="button"
										class="rounded bg-gray-600 px-2 py-0.5 text-xs text-white hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
										onclick={() => {
											cameras = [];
										}}
									>
										Clear All
									</button>
								</div>
							</div>
							<div class="py-1">
								{#if cameras.length > 0}
									<!-- Selected cameras section -->
									<div class="bg-gray-900 px-2 py-1 text-xs font-semibold text-blue-300">
										Selected Cameras
									</div>
									{#each cameras as camera (camera.id)}
										<Select.Item
											value={camera.id.toString()}
											class="data-[highlighted]:bg-blue-600 data-[state=checked]:bg-blue-700"
										>
											<div class="flex w-full items-center justify-between text-sm">
												<span>{camera.name.split('_').join(' ')}</span>
											</div>
										</Select.Item>
									{/each}
									<!-- Divider -->
									<div class="my-1 border-t border-gray-700"></div>
									<!-- All cameras section -->
									<div class="bg-gray-900 px-2 py-1 text-xs font-semibold text-gray-400">
										All Cameras
									</div>
								{/if}

								{#each data.cameras.filter((camera) => camera.name
											.toLowerCase()
											.includes(cameraSearchQuery.toLowerCase()) && !cameras.some((selected) => selected.id === camera.id)) as camera (camera.id)}
									<Select.Item
										value={camera.id.toString()}
										class="data-[highlighted]:bg-blue-600 data-[state=checked]:bg-blue-700"
									>
										<div class="flex w-full items-center justify-between text-sm">
											<span>{camera.name.split('_').join(' ')}</span>
										</div>
									</Select.Item>
								{:else}
									{#if cameras.length === 0 || cameras.length === data.cameras.filter((c) => c.name
													.toLowerCase()
													.includes(cameraSearchQuery.toLowerCase())).length}
										<div class="px-2 py-2 text-sm text-gray-400 text-center">
											No additional cameras found
										</div>
									{/if}
								{/each}
							</div>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="limit" class="mb-1 block text-sm font-medium text-gray-300"
						>Limit (1-1000)</label
					>
					<Input
						id="limit"
						type="number"
						min="1"
						max="1000"
						class="w-full border-gray-700 bg-gray-800 text-sm text-white focus:ring-blue-500 disabled:opacity-50"
						bind:value={limit}
						oninput={handleLimitInput}
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="conf" class="mb-1 block text-sm font-medium text-gray-300"
						>Min Confidence (0-100)</label
					>
					<div class="relative">
						<Input
							id="conf"
							type="number"
							min="0"
							max="100"
							defaultValue="85"
							class={cn(
								'w-full border-gray-700 bg-gray-800 pr-8 text-sm text-white focus:ring-blue-500', // Add padding for icon
								standardFieldsDisabled && 'cursor-not-allowed opacity-50'
							)}
							bind:value={conf}
							oninput={handleConfInput}
							disabled={standardFieldsDisabled}
						/>
						<Tooltip.Root>
							<Tooltip.Trigger class="absolute right-2 top-1/2 -translate-y-1/2 cursor-help">
								<InfoIcon class="size-4 text-gray-500" />
							</Tooltip.Trigger>
							<Tooltip.Content class="max-w-xs border-gray-700 bg-gray-900 text-gray-300">
								Minimum similarity confidence score (0-100). Only results with confidence >= this
								value will be returned. Provided by the semantic search service.
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
				<!-- *** NEW: Max Distance Input *** -->
				<div>
					<label for="max_dist" class="mb-1 block text-sm font-medium text-gray-300"
						>Max Distance (≥ 0)</label
					>
					<div class="relative">
						<Input
							id="max_dist"
							type="number"
							min="0"
							step="0.01"
							placeholder="Any (optional)"
							class={cn(
								'w-full border-gray-700 bg-gray-800 pr-8 text-sm text-white focus:ring-blue-500', // Add padding for icon
								standardFieldsDisabled && 'cursor-not-allowed opacity-50'
							)}
							bind:value={maxDistance}
							oninput={handleMaxDistInput}
							disabled={standardFieldsDisabled}
						/>
						<Tooltip.Root>
							<Tooltip.Trigger class="absolute right-2 top-1/2 -translate-y-1/2 cursor-help">
								<InfoIcon class="size-4 text-gray-500" />
							</Tooltip.Trigger>
							<Tooltip.Content class="max-w-xs border-gray-700 bg-gray-900 text-gray-300">
								{"Maximum vector distance (lower means more similar, 0 is identical). Filters results where distance <= this value. Useful with 'Most Similar' sort. Typical range 0.0 to ~1.5 depending on model. Leave blank for no distance limit."}
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-300">Sort By</label>
					<Select.Root
						onValueChange={(val) => {
							if (val) sortBy = val as typeof sortBy;
						}}
						type="single"
						value={sortBy}
						disabled={standardFieldsDisabled}
					>
						<Select.Trigger class={cn(standardFieldsDisabled && 'cursor-not-allowed opacity-50')}>
							{getSortLabel()}
						</Select.Trigger>
						<Select.Content class="border-gray-700 bg-gray-800 text-gray-200">
							<Select.Item value="date_desc" class="data-[highlighted]:bg-blue-600"
								>Newest First</Select.Item
							>
							<Select.Item value="date_asc" class="data-[highlighted]:bg-blue-600"
								>Oldest First</Select.Item
							>
							<Select.Item value="score_desc" class="data-[highlighted]:bg-blue-600"
								>Most Similar/Confident First</Select.Item
							>
							<Select.Item value="score_asc" class="data-[highlighted]:bg-blue-600"
								>Least Similar/Confident First</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Info about similarity score/distance relationship -->
		<div class="-mt-4 mb-6 flex items-center gap-1 text-xs text-gray-500">
			<InfoIcon class="size-3 shrink-0" />
			<span>
				Similarity is often calculated from distance (e.g., 1 - distance). Low distance ≈ High
				similarity. Confidence and Distance filters can be used together.
			</span>
		</div>

		{#if similaritySearchActive && !isLoading}
			<div
				class="mb-4 flex items-center justify-between rounded border-l-4 border-blue-500 bg-gray-800/50 p-3 text-blue-300"
			>
				<p class="text-sm">
					Showing results similar to: <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
						>{similaritySourceDescription ?? 'selected image'}</code
					>
					<span class="ml-2 text-xs italic text-gray-400">(Current filters applied)</span>
				</p>
				<button
					onclick={clearSimilaritySearchAndRefresh}
					class="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-200 transition-colors hover:bg-blue-700 hover:text-white"
					title="Clear similarity search and show results based only on filters"
					disabled={isLoading}
				>
					<XCircleIcon class="size-4" />
					Clear Similarity
				</button>
			</div>
		{/if}
		{#if isLoading && (selectedImageFile || similaritySearchActive)}
			<div
				class="mb-4 flex items-center gap-2 rounded border-l-4 border-blue-500 bg-gray-800/50 p-3 text-blue-300"
			>
				<span class="animate-spin"> <Loader2 class="size-4" /> </span>
				<p class="text-sm">
					Finding events similar to: <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
						>{similaritySourceDescription ?? 'selected image'}</code
					> (with filters)...
				</p>
			</div>
		{/if}
		{#if searchError}
			<div class="mb-6 rounded border-l-4 border-red-500 bg-red-900/30 p-4 text-red-200">
				<p><strong class="font-semibold">Error:</strong> {searchError}</p>
			</div>
		{/if}
		{#if searchResults?.length > 0}
			<h2 class="mb-4 text-xl font-semibold text-white">
				Results {#if similaritySearchActive}(similar to {similaritySourceDescription ??
						'selected image'}){/if}
				({searchResults.length})
			</h2>
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each searchResults as result}
					{@const baseUrl = normalizeBaseUrl(result.source_instance)}
					{@const snapshotUrl =
						baseUrl && result.has_snapshot
							? `${baseUrl}/api/events/${result.id}/snapshot.jpg`
							: result.search_source === 'semantic' && result.thumbnail
								? result.thumbnail
								: null}
					{@const clipUrl =
						baseUrl && result.has_clip ? `${baseUrl}/api/events/${result.id}/clip.mp4` : null}

					<Dialog.Root>
						<Dialog.Trigger>
							{#snippet child({ props: triggerProps })}
								<div
									class="relative cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all hover:shadow-xl hover:ring-2 hover:ring-blue-500"
									{...triggerProps}
								>
									<button
										class="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1.5 text-gray-300 backdrop-blur-sm transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
										title="Find similar events (using current filters)"
										onclick={(e) => {
											e.stopPropagation();
											if (!isLoading && result.thumbnail) {
												const base64Data = result.thumbnail.startsWith('data:')
													? result.thumbnail.split(',')[1]
													: result.thumbnail;
												const imageFile = base64ToFile(base64Data, `${result.id}_thumb.jpg`);
												if (imageFile) {
													performSearch({
														similarityImageFile: imageFile,
														similaritySourceDesc: `event ${result.id}`
													});
												} else {
													searchError = 'Could not process thumbnail for similarity search.';
												}
											} else if (!result.thumbnail) {
												searchError =
													'Event thumbnail is missing, cannot perform similarity search.';
											}
										}}
										disabled={isLoading || !result.thumbnail}
									>
										<SearchIcon class="size-4" />
									</button>

									<div class="relative aspect-video bg-gray-700">
										{#if result.thumbnail}
											<img
												src={result.thumbnail}
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
										<!-- Similarity score/distance overlay -->
										{#if typeof result.search_distance === 'number' || typeof result.search_confidence === 'number'}
											<div
												class="absolute bottom-0 left-0 bg-black/60 px-1.5 py-0.5 text-xs backdrop-blur-sm"
											>
												{#if typeof result.search_distance === 'number'}
													{@const distanceFormatted = result.search_distance.toFixed(3)}
													<span
														class="text-blue-300"
														title={`Lower distance is more similar. Raw: ${result.search_distance}`}
													>
														Dist: {distanceFormatted}
													</span>
													{#if typeof result.search_confidence === 'number'}<span
															class="text-gray-400"
														>
															|
														</span>{/if}
												{/if}
												{#if typeof result.search_confidence === 'number'}
													<span class="text-green-300">
														Conf: {result.search_confidence.toFixed(0)}%
													</span>
												{/if}
											</div>
										{/if}
									</div>
									<div class="space-y-0.5 p-3 text-sm">
										<p class="truncate font-semibold text-white" title={result.label}>
											{result.label}{#if result.sub_label}<span class="text-gray-400"
													>({result.sub_label})</span
												>{/if}
										</p>
										<p class="truncate text-xs text-gray-300" title={result.camera}>
											<span class="font-medium">Cam:</span>
											{result.camera}
										</p>
										<p class="text-xs text-gray-400">
											<span class="font-medium">Time:</span>
											{formatTimestampShort(result.start_time)}
										</p>
										{#if typeof result.top_score === 'number' && result.top_score > 0}
											<p class="text-xs text-gray-400">
												<span class="font-medium">Detect Conf:</span>
												{Math.round(result.top_score * 100)}%
											</p>
										{/if}
										{#if result.source_instance}
											<p class="truncate text-xs text-gray-500" title={result.source_instance}>
												<span class="font-medium">Src:</span>
												{frigateInstances.find((el) => el.url === result.source_instance)?.name ??
													result.source_instance}
											</p>
										{/if}
										<div class="pt-1 text-xs text-gray-400">
											<span class={result.has_clip ? 'text-green-400' : 'text-gray-500'}>Clip</span>
											|
											<span class={result.has_snapshot ? 'text-green-400' : 'text-gray-500'}
												>Snap</span
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
										>Details</Tabs.Trigger
									>
									{#if snapshotUrl && result.has_snapshot}
										<Tabs.Trigger
											value="snapshot"
											class="data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
											>Snapshot</Tabs.Trigger
										>
									{:else if result.has_snapshot}
										<Tabs.Trigger value="snapshot" disabled class="cursor-not-allowed text-gray-600"
											>Snapshot (Unavailable)</Tabs.Trigger
										>
									{/if}
									{#if clipUrl && result.has_clip}
										<Tabs.Trigger
											value="video"
											class="data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
											>Video</Tabs.Trigger
										>
									{:else if result.has_clip}
										<Tabs.Trigger value="video" disabled class="cursor-not-allowed text-gray-600"
											>Video (Unavailable)</Tabs.Trigger
										>
									{/if}
								</Tabs.List>
								<Tabs.Content value="details" class="mt-4 text-sm outline-none focus:ring-0">
									<dl class="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
										<!-- Standard Details -->
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Event ID</dt>
											<dd class="mt-1">{result.id}</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Camera</dt>
											<dd class="mt-1">{result.camera}</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Label</dt>
											<dd class="mt-1">
												{result.label}
												{#if result.sub_label}({result.sub_label}){/if}
											</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Detection Confidence</dt>
											<dd class="mt-1">
												{result.top_score ? `${Math.round(result.top_score * 100)}%` : 'N/A'}
											</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Start Time</dt>
											<dd class="mt-1">{formatTimestamp(result.start_time)}</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">End Time</dt>
											<dd class="mt-1">
												{result.end_time ? formatTimestamp(result.end_time) : 'N/A'}
											</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Has Clip</dt>
											<dd class="mt-1">{result.has_clip ? 'Yes' : 'No'}</dd>
										</div>
										<div class="sm:col-span-1">
											<dt class="font-medium text-gray-400">Has Snapshot</dt>
											<dd class="mt-1">{result.has_snapshot ? 'Yes' : 'No'}</dd>
										</div>
										{#if result.source_instance}<div class="sm:col-span-1">
												<dt class="font-medium text-gray-400">Source Instance</dt>
												<dd class="mt-1">
													{frigateInstances.find((inst) => inst.url === result.source_instance)
														?.name ?? result.source_instance}
												</dd>
											</div>{/if}

										<!-- Semantic Search Specific Details -->
										{#if typeof result.search_distance === 'number'}
											<div class="sm:col-span-1">
												<dt class="font-medium text-gray-400">Search Distance</dt>
												<dd class="mt-1 text-blue-300">
													{result.search_distance.toFixed(4)} (Lower is more similar)
												</dd>
											</div>
										{/if}
										{#if typeof result.search_confidence === 'number'}
											<div class="sm:col-span-1">
												<dt class="font-medium text-gray-400">Search Confidence</dt>
												<dd class="mt-1 text-green-300">{result.search_confidence.toFixed(1)}%</dd>
											</div>
										{/if}

										<!-- Additional Data if available -->
										{#if result.data?.type}<div class="sm:col-span-1">
												<dt class="font-medium text-gray-400">Type</dt>
												<dd class="mt-1">{result.data.type}</dd>
											</div>{/if}
										{#if result.data?.score && result.data.score !== -1}<div class="sm:col-span-1">
												<dt class="font-medium text-gray-400">Score (Raw)</dt>
												<dd class="mt-1">{result.data.score.toFixed(3)}</dd>
											</div>{/if}
										{#if result.data?.attributes && result.data.attributes.length > 0}<div
												class="sm:col-span-2"
											>
												<dt class="font-medium text-gray-400">Attributes</dt>
												<dd class="mt-1">
													<pre class="whitespace-pre-wrap text-xs">{JSON.stringify(
															result.data.attributes,
															null,
															2
														)}</pre>
												</dd>
											</div>{/if}
									</dl>
								</Tabs.Content>
								{#if snapshotUrl && result.has_snapshot}
									<Tabs.Content value="snapshot" class="mt-4 outline-none focus:ring-0">
										<div class="relative">
											<img
												src={snapshotUrl}
												alt="Snapshot for event {result.id}"
												class="mx-auto max-h-[70vh] max-w-full rounded object-contain"
												loading="lazy"
												onerror={(e) => {
													(e.target as HTMLImageElement).nextElementSibling?.setAttribute(
														'style',
														'display: block;'
													);
												}}
											/>
											<p
												class="absolute inset-x-0 top-0 mt-2 text-center text-red-400"
												style="display: none;"
											>
												Failed to load snapshot...
											</p>
										</div>
									</Tabs.Content>
								{/if}
								{#if clipUrl && result.has_clip}
									<Tabs.Content value="video" class="mt-4 outline-none focus:ring-0">
										<div class="relative">
											<video
												src={clipUrl}
												controls
												preload="metadata"
												class="max-h-[70vh] w-full rounded bg-black"
												onerror={(e) => {
													(e.target as HTMLVideoElement).nextElementSibling?.setAttribute(
														'style',
														'display: block;'
													);
												}}>Your browser does not support the video tag.</video
											>
											<p
												class="absolute inset-x-0 top-0 mt-2 text-center text-red-400"
												style="display: none;"
											>
												Failed to load video clip...
											</p>
										</div>
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
					No similar events found for <code class="rounded bg-gray-700 px-1 py-0.5 text-xs"
						>{similaritySourceDescription ?? 'selected image'}</code
					>
					matching the current filters.
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
</Tooltip.Provider>
