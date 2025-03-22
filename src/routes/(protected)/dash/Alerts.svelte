<script lang="ts">
	import { BellRingIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert as AlertType } from '../types';
	import { onMount, onDestroy } from 'svelte';
	import SimpleDialog from './SimpleDialog.svelte';
	import { timeAgo } from '$lib/utils';

	// Remove the alerts prop since we'll fetch them internally
	let alerts: AlertType[] | null = $state(null);
	let refreshInterval: ReturnType<typeof setInterval>;

	// Modal state
	let showModal = $state(false);
	let selectedAlertUrl = '';
	let selectedAlertTitle = '';

	function openAlertModal(alert: AlertType) {
		// if (alert.redirect_url) {
		// 	selectedAlertUrl = alert.redirect_url;
		// 	selectedAlertTitle = alert.query || 'Alert Details';
		// 	showModal = true;
		// }
	}

	function closeModal() {
		showModal = false;
	}

	// Function to fetch alerts data
	async function fetchAlerts() {
		try {
			const res = await fetch('/api/alert-notifications');
			const alertsData = (await res.json()) as {
				alertsData: AlertType[];
			};
			console.log('Raw alerts data:', alertsData);
			alerts = alertsData.alertsData;

			// // Make sure alertsData is an array
			// if (Array.isArray(alertsData)) {
			// 	alerts = alertsData;
			// } else if (alertsData && typeof alertsData === 'object') {
			// 	// If it's an object with a data property, use that
			// 	alerts = Array.isArray(alertsData.data) ? alertsData.data : [];
			// } else {
			// 	alerts = [];
			// }
			// console.log('Processed alerts for rendering:', alerts);
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
	// const severityColorMap: Record<AlertType['severity'], string> = {
	// 	high: 'bg-red-500',
	// 	medium: 'bg-orange-500',
	// 	low: 'bg-yellow-500',
	// 	info: 'bg-blue-500'
	// };
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
						class="grid cursor-pointer gap-1 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						onclick={() => openAlertModal(alert)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && openAlertModal(alert)}
					>
						<div class="flex items-center justify-between gap-2">
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<!-- <span class={`h-2 w-2 rounded-full ${severityColorMap[alert.severity]}`} /> -->
							<!-- {JSON.stringify(alert)} -->
							<div class="flex grow flex-col gap-2">
								<div class="text-md font-medium leading-none w-full flex items-center justify-between">
									<span>
										Detected {alert.query}
									</span>
									<span class="text-sm">
										{timeAgo(alert.createdAt)}
									</span>
								</div>
								<span class="text-xs leading-tight">
									{alert.results.results.find((result) => !!result.data.description)?.data
										.description || 'No description'}
								</span>
							</div>
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
	<div class="h-full w-full">
		{#if selectedAlertUrl}
			<iframe
				src={selectedAlertUrl}
				title="Alert Details"
				class="h-full w-full border-0"
				sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
			></iframe>
		{:else}
			<p class="text-center">No URL available for this alert.</p>
		{/if}
	</div>
</SimpleDialog>
