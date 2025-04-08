<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { StarIcon, UsersIcon } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { invalidateAll } from '$app/navigation';
	import ClusterDialogContent from './ClusterDialogContent.svelte';

	let PageState = getPageState();
	PageState.title = 'Face Recognition';

	let { data } = $props();

	onMount(() => {
		let id = setInterval(
			() => {
				invalidateAll();
			},
			10000 // 10 second
		);
		return () => {
			clearInterval(id);
		};
	});

	// Format date to readable string
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<ScrollArea class="h-full overflow-x-visible p-4 text-gray-200">
	<div
		class="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
	>
		{#if data.clusters.length === 0}
			<div
				class="col-span-full flex h-full items-center justify-center rounded-lg bg-gray-800 p-4 text-gray-400"
			>
				No clusters found.
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
							<div class="relative aspect-video bg-gray-700">
								<img
									src={cluster.representative_thumbnail_url}
									alt={`Cluster ${cluster.cluster_id}`}
									class="absolute inset-0 h-full w-full object-cover"
								/>
							</div>
							<div class="space-y-2 p-3 text-sm">
								<div class="flex items-center justify-between text-gray-200">
									<div class="flex items-center gap-1">
										<UsersIcon class="h-4 w-4" />
										<span>{cluster.member_count}</span>
									</div>
									<div class="flex items-center gap-1">
										<StarIcon class="h-4 w-4" />
										<span>{cluster.max_recorded_quality}</span>
									</div>
								</div>

								<div class="text-xs text-gray-400">
									<p>Created: {formatDate(cluster.created_at)}</p>
									<p>Updated: {formatDate(cluster.last_updated_at)}</p>
								</div>
							</div>
						</div>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="max-w-5xl border-gray-700 bg-background text-gray-200">
					<ClusterDialogContent cluster_id={cluster.cluster_id} />
				</Dialog.Content>
			</Dialog.Root>
		{/each}
	</div>
</ScrollArea>
