<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { UsersIcon } from '@lucide/svelte';
	import AttendanceChart from './chart.svelte';
	import LiveBadge from './LiveBadge.svelte';
	import type { AttendanceData } from '../../types';

	type Props = {
		data: {
			max: number;
			timeData: AttendanceData;
		};
	};
	let { data }: Props = $props();

	let current = $derived.by(() => data.timeData.incoming.at(-1) ?? 0);
	let percentageFull = $derived.by(() => Math.round((current / data.max) * 100));

	// Format numbers with commas
	const formatNumber = (num: number) => num.toLocaleString();
</script>

<Card class="h-full w-full dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4">
		<div class="flex items-center gap-2">
			<UsersIcon class="h-5 w-5" />
			<h3 class="font-medium">Attendance Tracking</h3>
			<LiveBadge />
		</div>
		<div class="flex items-center gap-2 text-sm">
			<span>{formatNumber(current)} / {formatNumber(data.max)}</span>
			<span
				class={[
					percentageFull < 80 && 'text-[#22c55e]',
					percentageFull >= 80 && percentageFull < 100 && 'text-[#f59e0b]',
					percentageFull >= 100 && 'text-[#ef4444]'
				]}>{percentageFull}% Full</span
			>
		</div>
	</CardHeader>
	<CardContent class="flex grow items-center justify-center">
		<AttendanceChart timeData={data.timeData} />
	</CardContent>
</Card>
