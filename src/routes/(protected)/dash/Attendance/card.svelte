<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { UsersIcon } from '@lucide/svelte';
	import AttendanceChart from './chart.svelte';

	type Props = {
		data: {
			max: number;
			timeData: {
				times: string[];
				incoming: number[];
				outgoing: number[];
			};
		};
	};
	let { data }: Props = $props();

	let current = $derived.by(
		() =>
			data.timeData.incoming.reduce((a, b) => a + b, 0) -
			data.timeData.outgoing.reduce((a, b) => a + b, 0)
	);
	let percentageFull = $derived.by(() => Math.round((current / data.max) * 100));

	// Format numbers with commas
	const formatNumber = (num: number) => num.toLocaleString();
</script>

<Card class="w-full max-w-xl dark:bg-background dark:text-white">
	<CardHeader class="pb-2 flex flex-row items-center justify-between">
		<div class="flex items-center gap-2">
			<UsersIcon class="h-5 w-5" />
			<h3 class="font-medium">Attendance Tracking</h3>
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
	<CardContent>
		<AttendanceChart timeData={data.timeData} />
	</CardContent>
</Card>
