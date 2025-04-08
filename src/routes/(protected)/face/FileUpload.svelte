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
	import { onDestroy } from 'svelte';
	import { formatDate, getBoundingBoxStyle } from '$lib/utils';
	import type { CameraType } from '../types';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	let { cameras: dataCameras }: { cameras: CameraType[] } = $props();

	// --- State for Search Dialog ---
	let isSearchDialogOpen = $state(false);
	let searchResults = $state<(FaceSearchResult | ClusterSearchResult)[] | null>(null);
	let searchLoading = $state(false);
	let searchError = $state<string | null>(null);
	let queryImageUrl = $state<string | null>(null); // To display the uploaded image
	let queryFaceFound = $state<boolean>(true); // Assume true initially

	// --- State for Search Filters ---
	let searchPriority = $state<SearchPriority>('faces');
	let searchLimit = $state(20);
	let selectedCameras = $state<CameraType[]>([]); // Renamed from 'cameras' to avoid conflict
	let cameraSearchQuery = $state('');
	let startTime = $state<string>(''); // Use string for datetime-local input binding
	let endTime = $state<string>(''); // Use string for datetime-local input binding
	let minImageQuality = $state<number | undefined>(undefined);
	let minClusterQuality = $state<number | undefined>(undefined);
	let minClusterSize = $state<number | undefined>(undefined);

	// --- Function to handle file upload and trigger search ---
	async function handleFileUpload(files: File[]) {
		if (files.length === 0) {
			console.warn('No files provided to handleFileUpload.');
			return;
		}
		const file = files[0];

		// Reset state for new search
		searchLoading = true;
		searchError = null;
		searchResults = null;
		queryFaceFound = true; // Reset face found status

		// Clean up previous object URL if any
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
		}
		queryImageUrl = URL.createObjectURL(file);

		// Open the dialog immediately
		isSearchDialogOpen = true;

		// Construct search options from state
		const options: SearchOptions = {};
		if (searchPriority === 'faces') {
			// Only include face-specific filters if priority is 'faces'
			if (startTime) options.startTime = new Date(startTime); // Convert string to Date
			if (endTime) options.endTime = new Date(endTime); // Convert string to Date
			if (selectedCameras.length > 0)
				options.cameraIds = selectedCameras.map((c) => c.id.toString());
			if (minImageQuality !== undefined && minImageQuality !== null)
				options.minImageQuality = minImageQuality;
		} else if (searchPriority === 'clusters') {
			// Only include cluster-specific filters if priority is 'clusters'
			if (minClusterQuality !== undefined && minClusterQuality !== null)
				options.minClusterQuality = minClusterQuality;
			if (minClusterSize !== undefined && minClusterSize !== null)
				options.minClusterSize = minClusterSize;
		}

		try {
			const response = await searchByImage(file, searchPriority, searchLimit, options);
			searchResults = response.matches;
			queryFaceFound = response.query_face_found;

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
		}
	}

	// --- Dialog Close Handler ---
	function onSearchDialogClose() {
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
			queryImageUrl = null;
		}
	}

	const formatDistance = (distance: number): string => {
		const maxReasonableDistance = 1.0; // Adjust based on typical distances
		const similarity = Math.max(0, (1 - distance / maxReasonableDistance) * 100);
		return `${similarity.toFixed(1)}%`; // Removed " similar" for brevity
	};

	// Helper to check if a match is a FaceSearchResult (using a unique mandatory property)
	function isFaceSearchResult(
		match: FaceSearchResult | ClusterSearchResult
	): match is FaceSearchResult {
		return 'embedding_id' in match;
	}

	// Helper to check if a match is a ClusterSearchResult
	function isClusterSearchResult(
		match: FaceSearchResult | ClusterSearchResult
	): match is ClusterSearchResult {
		return 'member_count' in match; // Use a property unique to ClusterSearchResult
	}

	// Function to reset filters
	function resetFilters() {
		// searchPriority = 'faces'; // Keep priority maybe?
		searchLimit = 20;
		selectedCameras = [];
		cameraSearchQuery = '';
		startTime = '';
		endTime = '';
		minImageQuality = undefined;
		minClusterQuality = undefined;
		minClusterSize = undefined;
		// Maybe re-run search after reset? Or require user interaction.
	}

	onDestroy(() => {
		if (queryImageUrl) {
			URL.revokeObjectURL(queryImageUrl);
		}
	});
</script>

<!-- File Drop Zone triggers the search -->
<FileDropZone
	class="mb-4 flex cursor-pointer flex-col border-2 border-dashed border-gray-600 p-6 text-center text-gray-400 transition-colors duration-200 ease-in-out hover:border-blue-500 hover:bg-gray-800/50"
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
	<Dialog.Content
		class="max-w-4xl border-gray-700 bg-background text-gray-200 sm:max-w-5xl lg:max-w-6xl"
	>
		<Dialog.Header>
			<Dialog.Title class="text-xl font-semibold text-gray-100">Image Search Results</Dialog.Title>
			{#if !searchLoading}
				<Dialog.Description class="text-gray-400">
					Showing matches for the uploaded image.
				</Dialog.Description>
			{/if}
		</Dialog.Header>

		<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-4">
			<!-- Query Image Display -->
			<div class="md:col-span-1">
				<h3 class="mb-2 font-semibold text-gray-300">Query Image</h3>
				{#if queryImageUrl}
					<img
						src={queryImageUrl}
						alt="Uploaded query"
						class="mb-2 w-full rounded-md border border-gray-700 object-contain"
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
					<label class="mb-1 block text-sm font-medium text-gray-300">Cameras</label>
				</div>
			</div>

			<!-- Search Results Area -->
			<div class="md:col-span-3">
				<h3 class="mb-2 font-semibold text-gray-300">Matches Found</h3>
				{#if searchLoading}
					<div class="flex h-64 items-center justify-center text-gray-400">
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
					<ScrollArea class="h-[60vh] pr-3">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each searchResults as match (isFaceSearchResult(match) ? match.embedding_id : match.cluster_id)}
								{@const imageWidth = 704}
								<!-- Adjust if necessary -->
								{@const imageHeight = 576}
								<!-- Adjust if necessary -->
								{#if isFaceSearchResult(match)}
									<!-- Face Result Card -->
									<div
										class="overflow-hidden rounded-lg bg-gray-800 shadow-md transition-shadow hover:shadow-lg hover:shadow-blue-900/30"
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
													class="absolute inset-0 flex items-center justify-center bg-gray-600 text-xs text-gray-400"
													style="display: none;"
												>
													No Thumbnail
												</div>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-gray-600 text-xs text-gray-400"
												>
													No Thumbnail
												</div>
											{/if}
											<!-- Bounding Box Overlay -->
											{#if match.detection_box}
												<div
													style={getBoundingBoxStyle(match.detection_box as any, imageWidth, imageHeight)}
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
										<div class="space-y-1 p-3 text-xs text-gray-400">
											<p><strong>Cam:</strong> {match.camera_id ?? 'N/A'}</p>
											<p><strong>Time:</strong> {formatDate(match.timestamp)}</p>
											<p class="truncate" title={match.cluster_id ?? ''}>
												<strong>Cluster:</strong>
												{match.cluster_id?.substring(0, 8) ?? 'N/A'}...
											</p>
											<!-- Maybe add link/action to view cluster? -->
										</div>
									</div>
								{:else if isClusterSearchResult(match)}
									<!-- Cluster Result Card -->
									<div
										class="overflow-hidden rounded-lg bg-gray-800 shadow-md transition-shadow hover:shadow-lg hover:shadow-purple-900/30"
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
													class="absolute inset-0 flex items-center justify-center bg-gray-600 text-xs text-gray-400"
													style="display: none;"
												>
													No Thumbnail
												</div>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-gray-600 text-xs text-gray-400"
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
										<div class="space-y-1 p-3 text-xs text-gray-400">
											<p class="truncate font-semibold text-gray-300" title={match.cluster_id}>
												Cluster: {match.cluster_id.substring(0, 8)}...
											</p>
											<p><strong>Members:</strong> {match.member_count}</p>
											<p><strong>Created:</strong> {formatDate(match.created_at)}</p>
											<p><strong>Updated:</strong> {formatDate(match.last_updated_at)}</p>
											<!-- Maybe add link/action to view cluster details? -->
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</ScrollArea>
				{:else if searchResults && searchResults.length === 0}
					<div
						class="flex h-64 items-center justify-center rounded-lg bg-gray-800 p-4 text-gray-400"
					>
						No matches found in the database for the detected face.
					</div>
				{:else if !queryFaceFound}
					<div
						class="flex h-64 items-center justify-center rounded-lg bg-gray-800 p-4 text-gray-400"
					>
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
