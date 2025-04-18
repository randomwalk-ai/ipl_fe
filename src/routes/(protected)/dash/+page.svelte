<!-- +page.svelte -->
<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import Alerts from './Alerts.svelte';
	import AttendanceCard from './Attendance';
	import type { Alert as AlertType, AnalyticsData, AttendanceData } from '../types';
	import Grid from './Grid.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { parseUtcToIstTime } from '$lib/utils';
	import CamStats from './CamStats.svelte';
	import AlertsOverview from './AlertsOverview.svelte';
	import { PUBLIC_AWAY_TEAM_NAME, PUBLIC_AWAY_TEAM_COLOR } from '$env/static/public';
	let { data } = $props();
	// $inspect(data.camAttendance);

	// Mock data for testing
	const attendanceData = $derived.by(() => ({
		max: 38000,
		timeData: {
			times: data.attData.allAttendanceData.map((d) => parseUtcToIstTime(d.minute)),
			incoming: data.attData.allAttendanceData.map((d) => d.totalUniqueCount),
			team1: data.attData.allAttendanceData.map((d) => d.totalJerseyYellow),
			team2: data.attData.allAttendanceData.map((d) => d.totalJerseyBlue)
		} as AttendanceData
	}));

	onMount(() => {
		// Only keep the page refresh interval
		const pageRefreshInterval = setInterval(() => {
			invalidateAll();
		}, 10000);

		return () => {
			// Clean up interval when component is destroyed
			clearInterval(pageRefreshInterval);
		};
	});

	// Mock analytics data
	let analyticsData: AnalyticsData = $derived.by(
		() =>
			({
				attendance: {
					total: (data.attData.attendanceData.at(-1) ?? { totalUniqueCount: 0 }).totalUniqueCount,
					prevTotal: (data.attData.oldAttendanceData.at(-1) ?? { totalUniqueCount: 0 })
						.totalUniqueCount,
					allTotal: (data.attData.allAttendanceData.at(-1) ?? { totalUniqueCount: 0 })
						.totalUniqueCount
				},
				alerts: {
					count: data.alertNotifsCount
				},
				cameras: {
					active: 252,
					total: 344
				},
				teams: {
					team1: {
						name: 'CSK',
						color: '#FFFF3C', // Yellow
						fans: (data.attData.attendanceData.at(-1) ?? { totalJerseyYellow: 0 })
							.totalJerseyYellow,
						prevFans: (data.attData.oldAttendanceData.at(-1) ?? { totalJerseyYellow: 0 })
							.totalJerseyYellow,
						allFans: (data.attData.allAttendanceData.at(-1) ?? { totalJerseyYellow: 0 })
							.totalJerseyYellow
					},
					team2: {
						name: PUBLIC_AWAY_TEAM_NAME,
						color: PUBLIC_AWAY_TEAM_COLOR, // Blue
						fans: (data.attData.attendanceData.at(-1) ?? { totalJerseyBlue: 0 }).totalJerseyBlue,
						prevFans: (data.attData.oldAttendanceData.at(-1) ?? { totalJerseyBlue: 0 })
							.totalJerseyBlue,
						allFans: (data.attData.allAttendanceData.at(-1) ?? { totalJerseyBlue: 0 })
							.totalJerseyBlue
					}
				}
			}) as AnalyticsData
	);

	// camAttendance
	let camAttendance = $derived(data.camAttendance);

	const PageState = getPageState();
	PageState.title = 'Dashboard';

</script>

<div class="flex h-full w-full flex-col gap-2 overflow-hidden">
	<Grid data={analyticsData} />
	<div class="flex min-h-0 flex-1 gap-2 h-full">
		<div class="flex min-h-0 flex-1 basis-1/2 flex-col gap-2">
			<AttendanceCard data={attendanceData} />
			<!-- <CamStats data={camAttendance} /> -->
		</div>
		<div class="min-h-0 flex-1 basis-1/2 overflow-y-auto h-full">
			<!-- <Alerts /> -->
			<AlertsOverview />
		</div>
	</div>
</div>
