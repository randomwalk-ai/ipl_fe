<!-- src/lib/components/FaceDetailDialogContent.svelte -->
<script lang="ts">
	import type { Face } from './fetchers'; // Adjust path if needed
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CircleX } from '@lucide/svelte';

	// --- Props ---
	// Receives the specific face to display
	let { face }: { face: Face } = $props();

	// --- Hardcoded Dimensions (Same assumption as the original component) ---
	// Ideally, these should come from the Face object or be determined dynamically
	const imageWidth = 704;
	const imageHeight = 576;

	// --- Helpers ---
	// You can reuse the getBoundingBoxStyle function here.
	// For brevity, I'll assume it's imported or copied here.
	// Let's copy it for self-containment:
	/**
	 * Generates CSS style for an absolutely positioned bounding box.
	 * Coordinates are assumed to be in pixels relative to the image.
	 */
	function getBoundingBoxStyle(
		box: number[] | undefined | null,
		imgW: number,
		imgH: number
	): string {
		if (!box || box.length !== 4 || !imgW || !imgH || imgW <= 0 || imgH <= 0) {
			return 'display: none;'; // Hide if invalid
		}
		const [x_min, y_min, x_max, y_max] = box;
		if (x_min >= x_max || y_min >= y_max) return 'display: none;';
		const safe_x_min = Math.max(0, x_min);
		const safe_y_min = Math.max(0, y_min);
		const safe_x_max = Math.min(imgW, x_max);
		const safe_y_max = Math.min(imgH, y_max);
		const pixelWidth = safe_x_max - safe_x_min;
		const pixelHeight = safe_y_max - safe_y_min;
		if (pixelWidth <= 0 || pixelHeight <= 0) return 'display: none;';
		const leftPercent = (safe_x_min / imgW) * 100;
		const topPercent = (safe_y_min / imgH) * 100;
		const widthPercent = (pixelWidth / imgW) * 100;
		const heightPercent = (pixelHeight / imgH) * 100;
		return `
        position: absolute;
        left: ${leftPercent.toFixed(2)}%;
        top: ${topPercent.toFixed(2)}%;
        width: ${widthPercent.toFixed(2)}%;
        height: ${heightPercent.toFixed(2)}%;
        border: 2px solid cyan; /* Different color for detail view? */
        box-sizing: border-box;
        box-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
        pointer-events: none;
    `;
	}

	const formattedTimestamp = new Date(face.timestamp).toLocaleString();
	const boxString = face.detection_box?.map((n) => n.toFixed(0)).join(', ') ?? 'N/A';
	const qualityString = face.image_quality.toFixed(3);
</script>

<Dialog.Title class="mb-4 text-lg font-semibold">Face Detail</Dialog.Title>
<Dialog.Description class="mb-4 text-sm text-muted-foreground">
	From Camera {face.camera_id} at {formattedTimestamp}. Quality: {qualityString}. Box: [{boxString}]
</Dialog.Description>

<!-- Container for the image and bounding box -->
<div class="relative mx-auto mb-4 max-h-[70vh] w-auto max-w-full overflow-hidden">
	<!--
      NOTE: Using thumbnail_url again. If a higher-res URL exists on the Face object,
      use that instead (e.g., face.full_image_url).
      Also, the hardcoded imageWidth/imageHeight might be incorrect if the source
      image for thumbnail_url isn't actually 704x576. A more robust solution
      would involve getting the naturalWidth/naturalHeight of the loaded image.
     -->
	<img
		src={face.thumbnail_url}
		alt="Face detail from camera {face.camera_id}"
		class="block h-auto w-full object-contain"
		width={imageWidth}
		height={imageHeight}
		loading="lazy"
	/>
	<!-- Bounding Box Overlay -->
	<div
		style={getBoundingBoxStyle(face.detection_box, imageWidth, imageHeight)}
		aria-hidden="true"
		title="Detected Face"
	></div>
</div>
