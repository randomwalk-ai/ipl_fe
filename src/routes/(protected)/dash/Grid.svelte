<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import {
		Users2Icon,
		BellIcon,
		CameraIcon,
		TrendingUpIcon,
		TrendingDownIcon
	} from '@lucide/svelte';
	import type { AnalyticsData } from '../types';

	type Props = {
		data: AnalyticsData;
	};

	let { data }: Props = $props();

	// let attendancePercentage = $derived.by(() => {
	// 	if (data.attendance.prevTotal === 0) return 0;
	// 	return Math.round(
	// 		((data.attendance.total - data.attendance.prevTotal) / data.attendance.prevTotal) * 100
	// 	);
	// });

	// let alertsPercentage = $derived.by(() => {
	// 	if (data.alerts.prevCount === 0) return 0;
	// 	return Math.round(((data.alerts.count - data.alerts.prevCount) / data.alerts.prevCount) * 100);
	// });

	let team1FansPercentage = $derived.by(() => {
		if (data.teams.team1.prevFans === 0) return 0;
		return Math.round(
			((data.teams.team1.fans - data.teams.team1.prevFans) / data.teams.team1.prevFans) * 100
		);
	});

	let team2FansPercentage = $derived.by(() => {
		if (data.teams.team2.prevFans === 0) return 0;
		return Math.round(
			((data.teams.team2.fans - data.teams.team2.prevFans) / data.teams.team2.prevFans) * 100
		);
	});

	// Format number to K format if over 1000
	const formatNumber = (num: number): string => {
		// return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
		return new Intl.NumberFormat('en-IN').format(num);
	};
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-4">
	<!-- Attendance Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Total Attendance</span>
				<Users2Icon class="h-4 w-4 text-blue-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{formatNumber(data.attendance.allTotal)}</span>
				
			</div>
			<!-- <span class="text-xs text-muted-foreground">vs. previous match</span> -->
		</div>
	</Card>

	<!-- Alerts Card -->
	<!-- <Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Active Alerts</span>
				<BellIcon class="h-4 w-4 text-rose-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{data.alerts.count}</span>
			</div>
		</div>
	</Card> -->

	<!-- Cameras Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Active Cameras</span>
				<CameraIcon class="h-4 w-4 text-blue-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{data.cameras.active}/{data.cameras.total}</span>
			</div>
		</div>
	</Card>

	<!-- Team 1 Fans Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">{data.teams.team1.name} fans</span>
				<!-- Colored Circle Icon -->
				<div class="h-4 w-4 rounded-full" style="background-color: {data.teams.team1.color};" />
			</div>
			<div class="flex items-end justify-between">
                <!-- Assuming team1Fans exists on the data object.  If not, replace with the correct path -->
				<span class="text-2xl font-bold">{formatNumber(data.teams.team1.allFans)}</span>
                <div
					class={[
						'flex items-center gap-1',
						team1FansPercentage > 0 ? 'text-emerald-500' : 'text-rose-500'
					]}
				>
					{#if team1FansPercentage > 0}
						<TrendingUpIcon class="h-4 w-4" />
						<span class="text-sm">{team1FansPercentage}%</span>
					{:else}
						<TrendingDownIcon class="h-4 w-4" />
						<span class="text-sm">{Math.abs(team1FansPercentage)}%</span>
					{/if}
                </div>
			</div>
            <span class="text-xs text-muted-foreground">vs. past hour</span>
		</div>
	</Card>

	<!-- Team 2 Fans Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">{data.teams.team2.name} fans</span>
				<!-- Colored Circle Icon -->
				<div class="h-4 w-4 rounded-full" style="background-color: {data.teams.team2.color};" />
			</div>
			<div class="flex items-end justify-between">
              <!-- Assuming team2Fans exists on the data object. If not, replace with the correct path -->
				<span class="text-2xl font-bold">{formatNumber(data.teams.team2.allFans)}</span>
                <div
					class={[
						'flex items-center gap-1',
						team2FansPercentage > 0 ? 'text-emerald-500' : 'text-rose-500'
					]}
				>
					{#if team2FansPercentage > 0}
						<TrendingUpIcon class="h-4 w-4" />
						<span class="text-sm">{team2FansPercentage}%</span>
					{:else}
						<TrendingDownIcon class="h-4 w-4" />
						<span class="text-sm">{Math.abs(team2FansPercentage)}%</span>
					{/if}
                </div>
			</div>
            <span class="text-xs text-muted-foreground">vs. past hour</span>
		</div>
	</Card>
</div>