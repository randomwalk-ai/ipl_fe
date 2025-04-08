<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { onMount, onDestroy } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { StarIcon, UsersIcon, UploadCloud, AlertCircle, Loader2 } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { invalidateAll } from '$app/navigation';
	import ClusterDialogContent from './ClusterDialogContent.svelte';
	import { formatDate } from '$lib/utils';
	import FileUpload from './FileUpload.svelte';

	// --- Component Logic ---
	let PageState = getPageState();
	PageState.title = 'Face Recognition';

	let { data } = $props();

	// --- Interval for Cluster Refresh ---
	let intervalId: NodeJS.Timeout | null = $state(null);
	onMount(() => {
		intervalId = setInterval(() => {
			invalidateAll();
		}, 10000); // 10 seconds
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<FileUpload cameras={data.cameras} />
<!-- Existing Cluster Display -->
<ScrollArea class="h-full overflow-x-visible p-4 text-gray-200">
	<h2 class="mb-4 text-xl font-semibold text-gray-100">Existing Clusters</h2>
	<div
		class="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
	>
		{#if data.clusters.length === 0}
			<div
				class="col-span-full flex h-full items-center justify-center rounded-lg bg-gray-800 p-4 text-gray-400"
			>
				No clusters found. Start by uploading images or connecting cameras.
			</div>
		{/if}
		{#each data.clusters as cluster (cluster.cluster_id)}
			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props: triggerProps })}
						<div
							class="relative cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-md transition-all hover:shadow-xl hover:ring-2 hover:ring-blue-500"
							{...triggerProps}
						>
							<!-- Cluster Thumbnail -->
							<div class="relative aspect-video bg-gray-700">
								{#if cluster.representative_thumbnail_url}
									<img
										src={cluster.representative_thumbnail_url}
										alt={`Cluster ${cluster.cluster_id}`}
										class="absolute inset-0 h-full w-full"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-full items-center justify-center text-gray-500">No Image</div>
								{/if}
							</div>
							<!-- Cluster Info -->
							<div class="space-y-2 p-3 text-sm">
								<div class="flex items-center justify-between text-gray-200">
									<div class="flex items-center gap-1" title="Members in Cluster">
										<UsersIcon class="h-4 w-4" />
										<span>{cluster.member_count}</span>
									</div>
									<div class="flex items-center gap-1" title="Highest Quality Score">
										<StarIcon class="h-4 w-4" />
										<span>{((cluster.max_recorded_quality ?? 0) * 100).toFixed(1) ?? 'N/A'}%</span>
									</div>
								</div>
								<div class="text-xs text-gray-400">
									<p>Updated: {formatDate(cluster.last_updated_at)}</p>
								</div>
							</div>
						</div>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="max-w-5xl border-gray-700 bg-background text-gray-200">
					<!-- Cluster Detail View -->
					<ClusterDialogContent cluster_id={cluster.cluster_id} />
				</Dialog.Content>
			</Dialog.Root>
		{/each}
	</div>
</ScrollArea>
