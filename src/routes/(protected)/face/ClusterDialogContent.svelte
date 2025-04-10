<!-- src/lib/components/ClusterDialogContent.svelte (or adjust path as needed) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { getClusterFaces, type Face } from './fetchers'; // Adjust path if needed
	import FaceDetailDialogContent from './FaceDetailDialogContent.svelte'; // Import the new component
	import { CircleX } from '@lucide/svelte';
	import { getBoundingBoxStyle } from '$lib/utils';

	// --- Props ---
	let { cluster_id }: { cluster_id: string } = $props();

	// --- State ---
	let faces: Face[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let selectedFace: Face | null = $state(null); // State for the selected face detail

	// --- Lifecycle ---
	onMount(async () => {
		isLoading = true;
		error = null;
		faces = []; // Reset faces on mount/remount
		selectedFace = null; // Reset selected face as well
		try {
			faces = await getClusterFaces(cluster_id);
		} catch (e: any) {
			error = e.message || 'Failed to load cluster faces.';
		} finally {
			isLoading = false;
		}
	});

	// --- Event Handlers ---
	function handleFaceClick(face: Face) {
		selectedFace = face;
	}

	function handleDetailDialogClose(open: boolean) {
		// This function is called by Dialog.Root's onOpenChange
		// when the detail dialog's state changes (e.g., closed via overlay click or Esc)
		if (!open) {
			selectedFace = null;
		}
	}
</script>

<!-- This is the *main* dialog content for the cluster -->
<Dialog.Title class="mb-4 text-lg font-semibold">Cluster {cluster_id} Faces</Dialog.Title>

<div class="max-h-[60vh] overflow-y-auto pr-2">
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
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2">
			{#each faces as face (face.embedding_id)}
				{@const imageWidth = 704}
				{@const imageHeight = 576}
				<!-- Make the container clickable -->
				<div
					class="relative aspect-square cursor-pointer overflow-hidden rounded bg-gray-700 transition-transform duration-150 ease-in-out hover:outline"
					onclick={() => handleFaceClick(face)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleFaceClick(face)}
					title="Click to view details"
				>
					<img
						src={face.thumbnail_url}
						alt={`Face from camera ${face.camera_id} at ${new Date(
							face.timestamp
						).toLocaleString()}`}
						class="absolute inset-0 h-full w-full"
						loading="lazy"
					/>
					<!-- Bounding Box Overlay -->
					<div
						style={getBoundingBoxStyle(face.detection_box, imageWidth, imageHeight)}
						aria-hidden="true"
						title={`Box: [${face.detection_box?.map((n) => n.toFixed(0)).join(', ')}] Quality: ${face.image_quality.toFixed(2)}`}
					></div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Secondary Dialog for Face Detail -->
{#if selectedFace}
	<!--
        We use Dialog.Root here to manage the open state based on `selectedFace`.
        The `onOpenChange` ensures that if the dialog is closed by clicking outside
        or pressing Esc, our `selectedFace` state is updated accordingly.
     -->
	<Dialog.Root open={!!selectedFace} onOpenChange={handleDetailDialogClose}>
		<!--
            Note: We don't need Dialog.Trigger here because we're controlling
            the 'open' state programmatically via the 'selectedFace' variable.
            The clicking logic is handled by the `on:click` on the thumbnail div.
         -->
		<Dialog.Content class="sm:max-w-[600px]">
			<!-- Adjust size as needed -->
			<!-- Render the detail content component, passing the selected face -->
			<FaceDetailDialogContent face={selectedFace} />
		</Dialog.Content>
	</Dialog.Root>
{/if}
