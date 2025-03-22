<script lang="ts">
	import { BellRingIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert as AlertType } from '../types';
	import { onMount, onDestroy } from 'svelte';
	import SimpleDialog from './SimpleDialog.svelte';

	// Remove the alerts prop since we'll fetch them internally
	let alerts: AlertType[] = [];
	let refreshInterval: ReturnType<typeof setInterval>;
	
	// Modal state
	let showModal = false;
	let selectedAlertUrl = '';
	let selectedAlertTitle = '';

	function openAlertModal(alert: AlertType) {
		if (alert.redirect_url) {
			selectedAlertUrl = alert.redirect_url;
			selectedAlertTitle = alert.query || 'Alert Details';
			showModal = true;
		}
	}

	function closeModal() {
		showModal = false;
	}

	// Function to fetch alerts data
	async function fetchAlerts() {
		try {
			const res = await fetch('/api/alert-notifications');
			const alertsData = await res.json();
			console.log('Raw alerts data:', alertsData);
			
			// Make sure alertsData is an array
			if (Array.isArray(alertsData)) {
				alerts = alertsData;
			} else if (alertsData && typeof alertsData === 'object') {
				// If it's an object with a data property, use that
				alerts = Array.isArray(alertsData.data) ? alertsData.data : [];
			} else {
				alerts = [];
			}
			console.log('Processed alerts for rendering:', alerts);
		} catch (error) {
			console.error('Failed to fetch alerts:', error);
			alerts = []; // Ensure alerts is always an array
		}
	}

	onMount(() => {
		// Initial fetch
		fetchAlerts();
		
		// Set up refresh interval (every 30 seconds)
		refreshInterval = setInterval(fetchAlerts, 30000);
	});

	onDestroy(() => {
		// Clean up interval when component is destroyed
		if (refreshInterval) clearInterval(refreshInterval);
	});

	// Map severity to color classes
	const severityColorMap: Record<AlertType['severity'], string> = {
		high: 'bg-red-500',
		medium: 'bg-orange-500',
		low: 'bg-yellow-500',
		info: 'bg-blue-500'
	};

	function timeAgo(date: Date): string {
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (seconds < 0) {
			return 'in the future'; //Handle dates in the future gracefully.
		}

		if (seconds < 60) {
			return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
		}

		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) {
			return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
		}

		const hours = Math.floor(minutes / 60);
		if (hours < 24) {
			return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		}

		const days = Math.floor(hours / 24);
		if (days < 7) {
			return days === 1 ? '1 day ago' : `${days} days ago`;
		}

		const weeks = Math.floor(days / 7);
		if (weeks < 4) {
			// Roughly 4 weeks in a month
			return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
		}

		const months = Math.floor(days / 30); // Approximate months (consider using date-fns or similar for precise calculations)
		if (months < 12) {
			return months === 1 ? '1 month ago' : `${months} months ago`;
		}

		const years = Math.floor(days / 365); // Approximate years
		return years === 1 ? '1 year ago' : `${years} years ago`;
	}
</script>

<Card class="flex h-full w-full flex-col dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4">
		<div class="flex items-center gap-2">
			<BellRingIcon class="h-5 w-5" />
			<h3 class="font-medium">Recent Alerts</h3>
		</div>
	</CardHeader>
	<ScrollArea class="flex-1">
		<CardContent class="grid gap-4 p-4">
			{#if !alerts || alerts.length === 0}
				<p class="text-gray-500 dark:text-gray-400">No alerts at this time</p>
			{:else}
				{#each alerts as alert (alert.id)}
					<div 
						class="grid gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
						on:click={() => openAlertModal(alert)}
						role="button"
						tabindex="0"
						on:keydown={(e) => e.key === 'Enter' && openAlertModal(alert)}
					>
						<div class="flex items-center gap-2">
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<!-- <span class={`h-2 w-2 rounded-full ${severityColorMap[alert.severity]}`} /> -->
							<!-- {JSON.stringify(alert)} -->
							<p class="text-sm font-medium leading-none">
								Detected {alert.query}
							</p>
						</div>
					</div>
				{/each}
			{/if}
		</CardContent>
	</ScrollArea>
</Card>

<!-- Alert Modal with iframe -->
<SimpleDialog 
	bind:open={showModal} 
	title={selectedAlertTitle} 
	fullHeight={true}
	fullWidth={true}
	on:close={closeModal}
>
	<div class="w-full h-full">
		{#if selectedAlertUrl}
			<iframe 
				src={selectedAlertUrl} 
				title="Alert Details" 
				class="w-full h-full border-0"
				sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
			></iframe>
		{:else}
			<p class="text-center">No URL available for this alert.</p>
		{/if}
	</div>
</SimpleDialog>
