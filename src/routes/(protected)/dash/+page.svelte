<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
    import AttendanceCard from './Attendance';

    // Mock data for testing
	const attendanceData = {
		max: 50000,
		timeData: {
			times: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
			incoming: [2000, 4000, 7000, 8000, 11000, 12000, 15000, 18000],
			outgoing: [0, 500, 1000, 1500, 2000, 2500, 3500, 4500],
		},
	};

	const PageState = getPageState();
	PageState.title = 'Dashboard';
</script>

<AttendanceCard data={attendanceData} />