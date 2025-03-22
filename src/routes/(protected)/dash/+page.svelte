<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import Alerts from './Alerts.svelte';
	import AttendanceCard from './Attendance';
	import type { Alert as AlertType, AnalyticsData, AttendanceData } from '../types';
	import Grid from './Grid.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import localizedFormat from 'dayjs/plugin/localizedFormat';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(localizedFormat);

	function parseUtcToIstTime(utcString: string): string {
		try {
			const utcDate = dayjs.utc(utcString);

			if (!utcDate.isValid()) {
				throw new Error(`Invalid UTC date string: ${utcString}`);
			}

			const istDate = utcDate.tz('Asia/Kolkata');

			// Use localized format 'LT' for time in en-US locale.
			return istDate.locale('en-US').format('LT');
		} catch (error) {
			console.error('Error parsing UTC to IST time:', error);
			return 'Invalid Time'; // Or handle appropriately
		}
	}

	let { data } = $props();

	// Mock data for testing
	const attendanceData = {
		max: 38000,
		timeData: {
			times: data.attData.allAttendanceData.map((d) => parseUtcToIstTime(d.minute)),
			incoming: data.attData.allAttendanceData.map((d) => d.totalUniqueCount),
			team1: data.attData.allAttendanceData.map((d) => d.totalJerseyYellow),
			team2: data.attData.allAttendanceData.map((d) => d.totalJerseyBlue)
		} as AttendanceData
	};

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
	const analyticsData: AnalyticsData = {
		attendance: {
			total: (data.attData.attendanceData.at(-1) ?? { totalUniqueCount: 0 }).totalUniqueCount,
			prevTotal: (data.attData.oldAttendanceData.at(-1) ?? { totalUniqueCount: 0 })
				.totalUniqueCount,
			allTotal: (data.attData.allAttendanceData.at(-1) ?? { totalUniqueCount: 0 }).totalUniqueCount
		},
		alerts: {
			count: data.alertNotifsCount
		},
		cameras: {
			active: data.activeCamCount,
			total: 326
		},
		teams: {
			team1: {
				name: 'CSK',
				color: '#f59e0b', // Yellow
				fans: (data.attData.attendanceData.at(-1) ?? { totalJerseyYellow: 0 }).totalJerseyYellow,
				prevFans: (data.attData.oldAttendanceData.at(-1) ?? { totalJerseyYellow: 0 })
					.totalJerseyYellow,
				allFans: (data.attData.allAttendanceData.at(-1) ?? { totalJerseyYellow: 0 })
					.totalJerseyYellow
			},
			team2: {
				name: 'MI',
				color: '#3b82f6', // Blue
				fans: (data.attData.attendanceData.at(-1) ?? { totalJerseyBlue: 0 }).totalJerseyBlue,
				prevFans: (data.attData.oldAttendanceData.at(-1) ?? { totalJerseyBlue: 0 }).totalJerseyBlue,
				allFans: (data.attData.allAttendanceData.at(-1) ?? { totalJerseyBlue: 0 }).totalJerseyBlue
			}
		}
	} as AnalyticsData;

	const PageState = getPageState();
	PageState.title = 'Dashboard';
</script>

<Grid data={analyticsData} />
<div class="flex h-96 w-full gap-2">
	<div class="min-h-32 grow basis-2/3">
		<AttendanceCard data={attendanceData} />
	</div>
	<div class="min-h-32 shrink-0 grow basis-1/3">
		<Alerts />
	</div>
</div>
