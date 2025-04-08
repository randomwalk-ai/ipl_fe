<!-- src/lib/components/ClusterDialogContent.svelte (or adjust path as needed) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { getClusterFaces, type Face } from './fetchers';

	// --- Props ---
	let { cluster_id }: { cluster_id: string } = $props();

	// --- State ---
	let faces: Face[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);

	// --- Lifecycle ---
	onMount(async () => {
		isLoading = true;
		error = null;
		faces = []; // Reset faces on mount/remount
		try {
			faces = await getClusterFaces(cluster_id);
		} catch (e: any) {
			error = e.message || 'Failed to load cluster faces.';
		} finally {
			isLoading = false;
		}
	});

	// --- Helpers ---
	/**
	 * Generates CSS style for an absolutely positioned bounding box.
	 * Coordinates are assumed to be in pixels relative to the image.
	 *
	 * @param box - Array [x_min, y_min, x_max, y_max] in pixels.
	 * @param imageWidth - The width of the image in pixels.
	 * @param imageHeight - The height of the image in pixels.
	 * @returns CSS style string or an empty string/display:none for invalid input.
	 */
	function getBoundingBoxStyle(
		box: number[] | undefined | null,
		imageWidth: number,
		imageHeight: number
	): string {
		// --- Input Validation ---
		if (!box || box.length !== 4) {
			console.warn('getBoundingBoxStyle: Invalid box data received.');
			return ''; // Hide the element if box data is bad
		}

		if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) {
			console.warn('getBoundingBoxStyle: Invalid image dimensions received.', {
				imageWidth,
				imageHeight
			});
			// You might want to return display:none or position:absolute; visibility:hidden;
			// depending on how you handle loading states.
			return '';
		}

		const [x_min, y_min, x_max, y_max] = box;

		// --- Basic Coordinate Validation (Optional but Recommended) ---
		// Ensure coordinates are somewhat sensible (e.g., min < max)
		if (x_min >= x_max || y_min >= y_max) {
			console.warn('getBoundingBoxStyle: Invalid box coordinates (min >= max).', { box });
			return '';
		}

		// --- Clamp coordinates to be within image bounds ---
		// This prevents boxes from visually spilling outside the container due to rounding
		// or slightly incorrect detection coordinates.
		const safe_x_min = Math.max(0, x_min);
		const safe_y_min = Math.max(0, y_min);
		const safe_x_max = Math.min(imageWidth, x_max);
		const safe_y_max = Math.min(imageHeight, y_max);

		// --- Calculate Dimensions in Pixels ---
		const pixelWidth = safe_x_max - safe_x_min;
		const pixelHeight = safe_y_max - safe_y_min;

		// --- Final check for valid dimensions after clamping ---
		if (pixelWidth <= 0 || pixelHeight <= 0) {
			console.warn('getBoundingBoxStyle: Calculated zero or negative dimensions.', {
				box,
				imageWidth,
				imageHeight,
				pixelWidth,
				pixelHeight
			});
			return '';
		}

		// --- Calculate Percentage Values ---
		const leftPercent = (safe_x_min / imageWidth) * 100;
		const topPercent = (safe_y_min / imageHeight) * 100;
		const widthPercent = (pixelWidth / imageWidth) * 100;
		const heightPercent = (pixelHeight / imageHeight) * 100;

		// --- Construct CSS String ---
		// Use 'box-sizing: border-box' so the border doesn't add to the total width/height
		// Use 'pointer-events: none' if you want clicks to go "through" the box to the image
		return `
        position: absolute;
        left: ${leftPercent.toFixed(2)}%;
        top: ${topPercent.toFixed(2)}%;
        width: ${widthPercent.toFixed(2)}%;
        height: ${heightPercent.toFixed(2)}%;
        border: 2px solid red;
        box-sizing: border-box;
        box-shadow: 0 0 5px rgba(255, 0, 0, 0.7);
        pointer-events: none;
    `;
	}
</script>

<Dialog.Title class="mb-4 text-lg font-semibold">Cluster {cluster_id} Faces</Dialog.Title>

<div class="max-h-[90vh] overflow-y-auto pr-2">
	{#if isLoading}
		<div class="flex h-40 items-center justify-center text-gray-400">Loading faces...</div>
	{:else if error}
		<div class="rounded bg-red-900/50 p-4 text-red-300">
			<p>Error loading faces:</p>
			<p class="mt-1 text-sm">{error}</p>
		</div>
	{:else if faces.length === 0}
		<div class="flex h-40 items-center justify-center text-gray-400">
			No faces found in this cluster.
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each faces as face (face.embedding_id)}
                {@const imageWidth = 704}
                {@const imageHeight = 576}
				<div class="relative aspect-square overflow-hidden rounded bg-gray-700">
					<img
						src={face.thumbnail_url}
						alt={`Face from camera ${face.camera_id} at ${new Date(
							face.timestamp
						).toLocaleString()}`}
						class="absolute inset-0 h-full w-full object-cover"
						loading="lazy"
					/>
					<!-- Bounding Box Overlay -->
					<div
						style={getBoundingBoxStyle(face.detection_box, imageWidth, imageHeight)}
						aria-hidden="true"
						title={`Box: [${face.detection_box?.map((n) => n.toFixed(2)).join(', ')}] Quality: ${face.image_quality.toFixed(2)}`}
					></div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Dialog.Close
	class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg
	>
	<span class="sr-only">Close</span>
</Dialog.Close>
