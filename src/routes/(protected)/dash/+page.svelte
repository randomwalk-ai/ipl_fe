<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import Alerts from './Alerts.svelte';
	import AttendanceCard from './Attendance';
	import type { Alert as AlertType, AnalyticsData } from '../types';
	import Grid from './Grid.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	// Mock data for testing
	const attendanceData = {
		max: 50000,
		timeData: {
			times: data.attData.attendanceData.map((d) => d.minute),
			incoming: data.attData.attendanceData.map((d) => d.totalUniqueCount)
			// outgoing: [0, 500, 1000, 1500, 2000, 2500, 3500, 4500]
		}
	};

	// Mock alerts data with more items to show scrolling
	const alerts = [
		{
			id: 1,
			title: 'Overcrowding detected at Gate B entrance',
			location: 'Gate B',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'high'
		},
		{
			id: 2,
			title: 'Unusual movement pattern near south stand',
			location: 'South Stand',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'medium'
		},
		{
			id: 3,
			title: 'Gate C attendance approaching capacity',
			location: 'Gate C',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'info'
		},
		{
			id: 4,
			title: 'Social media threat detected',
			location: 'Online',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'medium'
		},
		{
			id: 5,
			title: 'Suspicious package reported',
			location: 'North Stand',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'high'
		},
		{
			id: 6,
			title: 'Weather alert: Heavy rain expected',
			location: 'Stadium-wide',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'info'
		},
		{
			id: 7,
			title: 'Parking lot A reaching capacity',
			location: 'Parking A',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'low'
		},
		{
			id: 8,
			title: 'Medical assistance requested',
			location: 'Section 103',
			timestamp: new Date('2025-01-01T12:00:00Z'),
			severity: 'high'
		}
	] as AlertType[];

	// Mock analytics data
	const analyticsData: AnalyticsData = {
		attendance: {
			total: data.attData.attendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
			prevTotal: data.attData.oldAttendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
			allTotal: data.attData.allAttendanceData[-1].totalUniqueCount
		},
		alerts: {
			count: 8,
			prevCount: 18
		},
		cameras: {
			active: 24,
			total: 26
		},
		teams: {
			team1: {
				name: 'CSK',
				color: '#f59e0b', // Yellow
				fans: data.attData.attendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
				prevFans: data.attData.oldAttendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
				allFans: data.attData.allAttendanceData.reduce((a, b) => a + b.totalUniqueCount, 0)
			},
			team2: {
				name: 'MI',
				color: '#ef4444', // Red
				fans: data.attData.attendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
				prevFans: data.attData.oldAttendanceData.reduce((a, b) => a + b.totalUniqueCount, 0),
				allFans: data.attData.allAttendanceData.reduce((a, b) => a + b.totalUniqueCount, 0)
			}
		}
	} as AnalyticsData;

	const PageState = getPageState();
	PageState.title = 'Dashboard';

	onMount(() => {
		setInterval(() => {
			invalidateAll();
		}, 10000);
	});
</script>

<Grid data={analyticsData} />
<div class="flex h-96 w-full gap-2">
	<div class="min-h-32 grow basis-2/3">
		<AttendanceCard data={attendanceData} />
	</div>
	<div class="min-h-32 shrink-0 grow basis-1/3">
		<Alerts {alerts} />
	</div>
</div>
