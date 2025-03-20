<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import Alerts from './Alerts.svelte';
	import AttendanceCard from './Attendance';
	import type { Alert as AlertType, AnalyticsData } from '../types';
	import Grid from './Grid.svelte';
	// Mock data for testing
	const attendanceData = {
		max: 50000,
		timeData: {
			times: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
			incoming: [2000, 4000, 7000, 8000, 11000, 12000, 15000, 18000],
			outgoing: [0, 500, 1000, 1500, 2000, 2500, 3500, 4500]
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
			total: 34250,
			prevTotal: 34250 / 1.5
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
				fans: 10000,
				prevFans: 10000 / 1.5
			},
			team2: {
				name: 'MI',
				color: '#ef4444', // Red
				fans: 20000,
				prevFans: 20000 / 0.5
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
	<div class="min-h-32 grow basis-1/3 shrink-0">
		<Alerts {alerts} />
	</div>
</div>
