<!-- src/lib/components/FileUploadSearchTrigger.svelte -->
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FileDropZone } from '$lib/components/ui/file-drop-zone';
	// Updated imports
	import {
		searchByImage,
		type ClusterSearchResult,
		type FaceSearchResult,
		type SearchOptions,
		type SearchPriority // Import SearchPriority
	} from './fetchers';
	import {
		UploadCloud,
		AlertCircle,
		Loader2,
		Settings2,
		Calendar,
		Users,
		Image as ImageIcon
	} from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { onDestroy, tick, untrack } from 'svelte';
	import { formatDate, getBoundingBoxStyle } from '$lib/utils';
	import type { CameraType } from '../types';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { browser } from '$app/environment';
	import { Switch } from '$lib/components/ui/switch';
	import ClusterDialogContent from './ClusterDialogContent.svelte';

	let { cameras: dataCameras }: { cameras: CameraType[] } = $props();

	// --- State for Search Dialog ---
	let isSearchDialogOpen = $state(false);
	let searchResults = $state<(FaceSearchResult | ClusterSearchResult)[] | null>(null);
	let searchLoading = $state(false);
	let searchError = $state<string | null>(null);
	let queryImageUrl = $state<string | null>(null); // To display the uploaded image
	let queryFaceFound = $state<boolean>(true); // Assume true initially
	let queryFile = $state<File | null>(null); // Store the actual query file
	let isInitialSearchComplete = $state(false); // Flag to control effect trigger

	// --- State for Search Filters ---
	let searchPriority = $state<SearchPriority>('faces');
	let searchLimit = $state(50);
	let selectedCameras = $state<CameraType[]>([]);
	let cameraSearchQuery = $state('');
	let startTime = $state<string>('');
	let endTime = $state<string>('');
	let minImageQuality = $state<number | undefined>(undefined);
	let minClusterQuality = $state<number | undefined>(undefined);
	let minClusterSize = $state<number | undefined>(undefined);
	let similarityThreshold = $state<number | undefined>(30); // For similarity-based search
	let maxDistance = $derived.by(() => {
		// Calculate max distance based on similarity threshold
		return similarityThreshold !== undefined ? 1 - similarityThreshold / 100 : undefined;
	});

	// --- Reusable Search Logic ---
	async function performSearch() {
		if (!queryFile) {
			console.warn('performSearch called without a query file.');
			searchError = 'Cannot perform search without a query image.';
			searchResults = [];
			searchLoading = false;
			isInitialSearchComplete = false; // Reset if file is gone
			return;
		}

		searchLoading = true;
		searchError = null;

		// Construct search options from current state
		const options: SearchOptions = {};
		if (maxDistance !== undefined) options.maxDistance = maxDistance;
		if (searchPriority === 'faces') {
			if (selectedCameras.length > 0)
				options.cameraIds = selectedCameras.map((c) => c.id.toString());
			if (minImageQuality !== undefined && minImageQuality !== null && minImageQuality >= 0)
				options.minImageQuality = minImageQuality;
		} else if (searchPriority === 'clusters') {
			if (minClusterQuality !== undefined && minClusterQuality !== null && minClusterQuality >= 0)
				options.minClusterQuality = minClusterQuality;
			if (minClusterSize !== undefined && minClusterSize !== null && minClusterSize > 0)
				options.minClusterSize = minClusterSize;
		}

		console.log(
			'Performing search with options:',
			options,
			'Priority:',
			searchPriority,
			'Limit:',
			searchLimit
		);

		try {
			const response = await searchByImage(queryFile, searchPriority, searchLimit, options);
			searchResults = response.matches;
			queryFaceFound = response.query_face_found; // Update this even on refetch

			if (!response.query_face_found) {
				console.warn('No face found in the uploaded query image.');
			}
			if (response.matches.length === 0 && response.query_face_found) {
				console.info(
					`Face found in query, but no matching ${searchPriority} found in the database with current filters.`
				);
			} else if (response.matches.length > 0) {
				console.info(`Found ${response.matches.length} matching ${searchPriority}.`);
			}
		} catch (error: any) {
			console.error('Error during image search:', error);
			searchError = error.message || 'An unexpected error occurred during the search.';
			searchResults = []; // Ensure results are empty on error
		} finally {
			searchLoading = false;
			if (!isInitialSearchComplete) {
				isInitialSearchComplete = true; // Mark initial search as done *after* it finishes
			}
		}
	}

	// --- Effect for Refetching on Filter Changes ---
	$effect(() => {
		// Run only on the client
		if (!browser) return;

		// Read all filter dependencies to track them
		const currentFilters = {
			priority: searchPriority,
			limit: searchLimit,
			cameras: selectedCameras.map((c) => c.id).join(','), // Simple way to track changes
			start: startTime,
			end: endTime,
			imgQuality: minImageQuality,
			clustQuality: minClusterQuality,
			clustSize: minClusterSize
		};

		// Guard clauses:
		// 1. Don't run if there's no query file yet.
		// 2. Don't run if the dialog isn't open.
		// 3. Don't run if the initial search hasn't completed yet.
		if (!queryFile || !isSearchDialogOpen || !isInitialSearchComplete) {
			console.log('Effect skipped: preconditions not met', {
				hasFile: !!queryFile,
				isOpen: isSearchDialogOpen,
				isInitialDone: isInitialSearchComplete
			});
			return;
		}

		// Don't run if a search is already in progress
		if (untrack(() => searchLoading)) {
			console.log('Effect skipped: search already loading');
			return;
		}

		console.log('Effect triggered: filters changed, initiating debounced search.', currentFilters);
		// Call the debounced search function
		performSearch();
	});

	// Function to handle initial file upload
	async function handleFileUpload(files: File[]) {
		if (files.length === 0) {
			console.warn('No files provided to handleFileUpload.');
			return;
		}
		const file = files[0];

		// Reset state for new search
		searchLoading = true; // Set loading true *before* async call
		searchError = null;
		searchResults = null; // Clear previous results on *new* upload
		queryFaceFound = true;
		similarityThreshold = 30; // Reset to default
		isInitialSearchComplete = false; // Reset initial search flag

		// Clean up previous object URL if any
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
		}
		// Store the new file and create its URL
		queryFile = file;
		queryImageUrl = URL.createObjectURL(file);

		// Open the dialog immediately
		isSearchDialogOpen = true;

		// Wait a tick to ensure dialog state propagates if needed, then perform initial search
		await tick();
		await performSearch(); // Perform the initial search
	}

	// --- Dialog Close Handler ---
	function onSearchDialogClose() {
		// Don't revoke/clear if just closing dialog temporarily maybe?
		// Let's clear it on explicit close for now to free resources.
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
			queryImageUrl = null;
		}
		queryFile = null; // Clear the file reference
		searchResults = null;
		searchError = null;
		isInitialSearchComplete = false; // Reset flag when dialog closes
		isSearchDialogOpen = false; // Ensure state is consistent if closed via 'X' button
		// Maybe reset filters too? Optional.
		// resetFilters();
	}

	const formatDistance = (distance: number): string => {
		// Clamp distance between 0 and potentially > 1? Assume max reasonable is ~1.2 for display
		const clampedDistance = Math.max(0, Math.min(distance, 1.2));
		// Inverse relationship: lower distance = higher similarity
		// Simple linear scaling (1 - distance) * 100 for similarity %
		// Adjust the scaling factor if your distances have a different range or meaning.
		const similarity = Math.max(0, 1 - clampedDistance / 1.0) * 100; // Normalize against 1.0 distance
		return `${similarity.toFixed(1)}%`;
	};

	function isFaceSearchResult(
		match: FaceSearchResult | ClusterSearchResult
	): match is FaceSearchResult {
		return 'embedding_id' in match;
	}

	function isClusterSearchResult(
		match: FaceSearchResult | ClusterSearchResult
	): match is ClusterSearchResult {
		return 'member_count' in match;
	}

	function resetFilters() {
		searchPriority = 'faces'; // Reset priority or keep user's last choice? Let's reset.
		searchLimit = 20;
		selectedCameras = [];
		cameraSearchQuery = '';
		startTime = '';
		endTime = '';
		minImageQuality = undefined;
		minClusterQuality = undefined;
		minClusterSize = undefined;
		// The $effect will automatically trigger a debounced refetch if conditions are met
	}

	onDestroy(() => {
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
		}
		// Clear any pending debounce timers
		// Note: The debounce function itself should handle clearing its internal timer
		// if a new call comes in, but onDestroy might be needed if the component
		// is destroyed while a timer is pending. The simple debounce used here
		// doesn't return a cancel function, but it's generally good practice.
		// For the provided debounce, clearing timeoutId isn't directly possible from here.
	});
</script>

<!-- File Drop Zone triggers the search -->
<FileDropZone
	class="mb-4 flex cursor-pointer flex-col border-2 border-dashed border-gray-600 p-6 text-center transition-colors duration-200 ease-in-out hover:border-blue-500 hover:opacity-80"
	onUpload={handleFileUpload}
>
	<UploadCloud class="mx-auto mb-2 h-12 w-12" />
	Drop an image here or click to upload for search
</FileDropZone>

<!-- Search Results Dialog -->
<Dialog.Root
	bind:open={isSearchDialogOpen}
	onOpenChange={(open) => {
		if (!open) onSearchDialogClose();
	}}
>
	<Dialog.Content class="max-w-4xl border-gray-700 bg-background sm:max-w-5xl lg:max-w-6xl">
		<Dialog.Header>
			<Dialog.Title class="text-xl font-semibold">Suspect Face Search</Dialog.Title>
			{#if !searchLoading}
				<Dialog.Description>Showing matches for the uploaded image.</Dialog.Description>
			{/if}
		</Dialog.Header>

		<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-4">
			<!-- Query Image Display -->
			<div class="flex flex-col gap-2 md:col-span-1">
				<h3 class="mb-2 font-semibold">Query Image</h3>
				{#if queryImageUrl}
					<img
						src={queryImageUrl}
						alt="Uploaded query"
						class="mb-2 aspect-square w-full rounded-md border border-gray-700 object-cover"
					/>
				{/if}
				{#if !searchLoading && !queryFaceFound}
					<div
						class="mt-2 flex items-center gap-2 rounded bg-yellow-900 p-2 text-sm text-yellow-200"
					>
						<AlertCircle class="h-5 w-5 flex-shrink-0" />
						<span>No face detected in the query image. Results might be less relevant.</span>
					</div>
				{/if}
				<!-- Cameras Select -->
				<div>
					<label class="mb-1 block text-sm font-medium">Cameras</label>
					<Select.Root
						type="multiple"
						onValueChange={(e) => {
							selectedCameras = e.map(
								(el) =>
									dataCameras.find((el2) => el2.id.toString() === el) ?? {
										// Ensure string comparison
										id: -1,
										name: 'Error',
										category: 'Unknown',
										url: ''
									}
							);
						}}
						value={selectedCameras.map((c) => c.id.toString())}
						disabled={searchLoading}
					>
						<Select.Trigger>
							{#if selectedCameras.length > 0}
								{selectedCameras.length}
								{selectedCameras.length === 1 ? 'camera' : 'cameras'} selected
							{:else}Any Camera{/if}
						</Select.Trigger>
						<Select.Content class="border-gray-700">
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
											selectedCameras = dataCameras.filter((camera) =>
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
											selectedCameras = [];
										}}
									>
										Clear All
									</button>
								</div>
							</div>
							<div class="py-1">
								{#if selectedCameras.length > 0}
									<!-- Selected cameras section -->
									<div class="bg-gray-900 px-2 py-1 text-xs font-semibold text-blue-300">
										Selected Cameras
									</div>
									{#each selectedCameras as camera (camera.id)}
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
									<div class="px-2 py-1 text-xs font-semibold">All Cameras</div>
								{/if}

								{#each dataCameras.filter((camera) => camera.name
											.toLowerCase()
											.includes(cameraSearchQuery.toLowerCase()) && !selectedCameras.some((selected) => selected.id === camera.id)) as camera (camera.id)}
									<Select.Item
										value={camera.id.toString()}
										class="data-[highlighted]:bg-blue-600 data-[state=checked]:bg-blue-700"
									>
										<div class="flex w-full items-center justify-between text-sm">
											<span>{camera.name.split('_').join(' ')}</span>
										</div>
									</Select.Item>
								{:else}
									{#if selectedCameras.length === 0 || selectedCameras.length === dataCameras.filter( (c) => c.name
														.toLowerCase()
														.includes(cameraSearchQuery.toLowerCase()) ).length}
										<div class="px-2 py-2 text-sm text-center">No additional cameras found</div>
									{/if}
								{/each}
							</div>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Toggle between faces vs cluster -->
				<div>
					<label class="mb-1 block text-sm font-medium">Search for {searchPriority}</label>
					<Switch
						onCheckedChange={(e) => {
							searchPriority = e ? 'clusters' : 'faces';
						}}
					/>
				</div>

				<!-- Distance threshold -->
				<div>
					<label class="mb-1 block text-sm font-medium">Distance Threshold</label>
					<Input
						type="number"
						min={0}
						max={100}
						step={1}
						value={similarityThreshold}
						onchange={(e) => {
							const value = parseFloat((e.target as HTMLInputElement).value);
							if (!isNaN(value)) {
								similarityThreshold = value;
							}
						}}
						class="w-full"
						placeholder="0-100"
					/>
					<p class="mt-1 text-xs">Lower values yield more results. Default: 30</p>
				</div>
			</div>

			<!-- Search Results Area -->
			<div class="md:col-span-3">
				<h3 class="mb-2 font-semibold">Matches Found</h3>
				{#if searchLoading}
					<div class="flex h-64 items-center justify-center">
						<Loader2 class="animate-spin" />
						Searching...
					</div>
				{:else if searchError}
					<div
						class="flex h-64 flex-col items-center justify-center rounded-lg bg-red-900/50 p-4 text-red-300"
					>
						<AlertCircle class="mb-2 h-8 w-8" />
						<p class="font-semibold">Search Failed</p>
						<p class="mt-1 text-sm">{searchError}</p>
					</div>
				{:else if searchResults && searchResults.length > 0}
					<ScrollArea class="h-[60vh] pr-2">
						<div class="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 lg:grid-cols-3">
							{#each searchResults as match (isFaceSearchResult(match) ? match.embedding_id : match.cluster_id)}
								{@const imageWidth = 704}
								<!-- Adjust if necessary -->
								{@const imageHeight = 576}
								<!-- Adjust if necessary -->
								{#if isFaceSearchResult(match)}
									<!-- Face Result Card -->
									<Dialog.Root>
										<Dialog.Trigger disabled={!match.cluster_id}>
											{#snippet child({ props: triggerProps })}
												<div
													{...triggerProps}
													class="cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-shadow hover:outline"
												>
													<div class="relative aspect-[4/3] bg-gray-700">
														<!-- Aspect ratio more typical for cameras -->
														{#if match.thumbnail_url}
															<img
																src={match.thumbnail_url}
																alt={`Face match ${match.embedding_id.substring(0, 8)}`}
																class="absolute inset-0 h-full w-full object-cover"
																loading="lazy"
															/>
															<!-- Fallback text if image fails -->
															<div
																class="absolute inset-0 flex items-center justify-center bg-gray-600 text-xs"
																style="display: none;"
															>
																No Thumbnail
															</div>
														{:else}
															<div
																class="flex h-full w-full items-center justify-center bg-gray-600 text-xs"
															>
																No Thumbnail
															</div>
														{/if}
														<!-- Bounding Box Overlay -->
														{#if match.detection_box}
															<div
																style={getBoundingBoxStyle(
																	match.detection_box as any,
																	imageWidth,
																	imageHeight
																)}
																aria-hidden="true"
																class="absolute border-2 border-blue-400"
																title={`Box Quality: ${match.image_quality?.toFixed(2) ?? 'N/A'}\nDistance: ${match.distance.toFixed(3)}`}
															></div>
														{/if}
														<!-- Distance Overlay -->
														<div
															class="absolute bottom-0 left-0 bg-black/60 px-1.5 py-0.5 text-xs text-white"
														>
															Similarity: {formatDistance(match.distance)}
														</div>
														<!-- Quality Overlay -->
														{#if match.image_quality !== null && match.image_quality !== undefined}
															<div
																class="absolute bottom-0 right-0 bg-black/60 px-1.5 py-0.5 text-xs text-white"
															>
																Quality: {match.image_quality.toFixed(2)}
															</div>
														{/if}
													</div>
													<!-- Text Details -->
													<div class="space-y-1 p-3 text-xs">
														<p><strong>Cam:</strong> {match.camera_id ?? 'N/A'}</p>
														<p><strong>Time:</strong> {formatDate(match.timestamp)}</p>
														<p class="truncate" title={match.cluster_id ?? ''}>
															<strong>Cluster:</strong>
															{match.cluster_id?.substring(0, 8) ?? 'N/A'}...
														</p>
														<!-- Maybe add link/action to view cluster? -->
													</div>
												</div>
											{/snippet}
										</Dialog.Trigger>
										<Dialog.Content class="max-w-5xl border-gray-700 bg-background">
											<!-- Face Detail View -->
											<ClusterDialogContent cluster_id={match.cluster_id ?? ''} />
										</Dialog.Content>
									</Dialog.Root>
								{:else if isClusterSearchResult(match)}
									<!-- Cluster Result Card -->
									<Dialog.Root>
										<Dialog.Trigger>
											{#snippet child({ props: triggerProps })}
												<div
													{...triggerProps}
													class="cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-shadow hover:outline"
												>
													<div class="relative aspect-[4/3] bg-gray-700">
														{#if match.representative_thumbnail_url}
															<img
																src={match.representative_thumbnail_url}
																alt={`Cluster ${match.cluster_id.substring(0, 8)}`}
																class="absolute inset-0 h-full w-full object-cover"
																loading="lazy"
															/>
															<div
																class="absolute inset-0 flex items-center justify-center bg-gray-600 text-xs"
																style="display: none;"
															>
																No Thumbnail
															</div>
														{:else}
															<div
																class="flex h-full w-full items-center justify-center bg-gray-600 text-xs"
															>
																No Representative Thumbnail
															</div>
														{/if}
														<!-- Distance Overlay -->
														<div
															class="absolute bottom-0 left-0 bg-black/60 px-1.5 py-0.5 text-xs text-white"
														>
															Similarity: {formatDistance(match.distance)}
														</div>
														<!-- Quality Overlay -->
														<div
															class="absolute bottom-0 right-0 bg-black/60 px-1.5 py-0.5 text-xs text-white"
														>
															Max Quality: {match.max_recorded_quality.toFixed(2)}
														</div>
													</div>
													<!-- Text Details -->
													<div class="space-y-1 p-3 text-xs">
														<p class="truncate font-semibold" title={match.cluster_id}>
															Cluster: {match.cluster_id.substring(0, 8)}...
														</p>
														<p><strong>Members:</strong> {match.member_count}</p>
														<p><strong>Created:</strong> {formatDate(match.created_at)}</p>
														<p><strong>Updated:</strong> {formatDate(match.last_updated_at)}</p>
														<!-- Maybe add link/action to view cluster details? -->
													</div>
												</div>
											{/snippet}
										</Dialog.Trigger>
										<Dialog.Content class="max-w-5xl border-gray-700 bg-background">
											<ClusterDialogContent cluster_id={match.cluster_id} />
										</Dialog.Content>
									</Dialog.Root>
								{/if}
							{/each}
						</div>
					</ScrollArea>
				{:else if searchResults && searchResults.length === 0}
					<div class="flex h-64 items-center justify-center rounded-lg bg-secondary p-4">
						No matches found in the database for the detected face.
					</div>
				{:else if !queryFaceFound}
					<div class="flex h-64 items-center justify-center rounded-lg bg-secondary p-4">
						No face was detected in the uploaded image to search for.
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer class="mt-6 sm:justify-end">
			<Button
				variant="outline"
				onclick={() => {
					isSearchDialogOpen = false; // This should trigger the onOpenChange -> onSearchDialogClose path
				}}>Close</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
