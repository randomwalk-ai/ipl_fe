<!-- CamStats.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { ScrollArea, ScrollAreaScrollbar } from '$lib/components/ui/scroll-area';
	import { CameraIcon } from '@lucide/svelte';
	import type { CamAttendanceType } from '../types';

	// Define props for the component
	type Props = {
		/** Camera attendance data */
		data: CamAttendanceType;
	};

	// Get props using $props() rune
	let { data }: Props = $props();

	// Get the latest camera data
	const latestData = $derived(data.cameraData?.[0]?.cameras.toSorted((a, b) => b.max_unique_count - a.max_unique_count));

    const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
</script>

<div transition:fade class="flex flex-col h-1/2 min-h-0">
	<!-- Use scroll area for scrolling -->
	<ScrollArea class="flex-1 w-full rounded-md border min-h-0">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="w-[100px]">Camera ID</TableHead>
					<TableHead class="min-w-[100px] text-right">Camera Name</TableHead>
					<TableHead class="min-w-[100px] text-right">Blue Jersey</TableHead>
					<TableHead class="min-w-[100px] text-right">Yellow Jersey</TableHead>
					<TableHead class="min-w-[100px] text-right">Other Jersey</TableHead>
					<TableHead class="min-w-[100px] text-right">Total Count</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each latestData as camera (camera.camera_id)}
					<TableRow>
						<TableCell class="font-medium">
							<div class="flex items-center gap-2">
								<CameraIcon class="h-4 w-4" />
								{camera.camera_id}
							</div>
						</TableCell>
						<TableCell class="text-right">{camera.camera_name}</TableCell>
						<TableCell class="text-right">{formatNumber(camera.max_jersey_blue)}</TableCell>
						<TableCell class="text-right">{formatNumber(camera.max_jersey_yellow)}</TableCell>
						<TableCell class="text-right">{formatNumber(camera.max_jersey_others)}</TableCell>
						<TableCell class="text-right">{formatNumber(camera.max_unique_count)}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<ScrollAreaScrollbar orientation="horizontal" />
	</ScrollArea>

	<!-- Show timestamp -->
	<p class="mt-2 text-sm text-muted-foreground flex-none">
		Last updated: {new Date(data.timestamp).toLocaleString()}
	</p>
</div>