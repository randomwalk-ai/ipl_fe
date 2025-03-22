<script lang="ts">
	import { BellRingIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert as AlertType, AnomalyType } from '../types';
	import { onMount, onDestroy } from 'svelte';
	import SimpleDialog from './SimpleDialog.svelte';
	import { addHoursToDate, parseUtcToIstTime, timeAgo } from '$lib/utils';

	// Remove the alerts prop since we'll fetch them internally
	let alerts: AlertType[] | null = $state(null);
	let anomalies: AnomalyType[] | null = $state(null);
	let refreshInterval: ReturnType<typeof setInterval>;

	// derive collate both alerts and anomalies
	let combinedData = $derived.by(() => {
		return [...(alerts ?? []), ...(anomalies ?? [])]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.map((item) => {
				return {
					id: item.id,
					query: 'query' in item ? item.query : 'Crowd Anomaly',
					time: item.createdAt,
					description:
						'query' in item
							? item.results.results.find((result) => !!result.data.description)?.data
									.description || 'No description'
							: 'No description',
					type: 'query' in item ? 'alert' : 'anomaly',
					redirect_url: 'query' in item ? item.results.redirect_url : '',
					media_url: 'query' in item ? '': item.filePath
				};
			});
	});

	// Modal state
	let showModal = $state(false);
	let selectedAlertUrl = $state('');
	let selectedAlertTitle = $state('');

	// Function to open the alert modal
	function openAlertModal(alert: { query: string; redirect_url: string }) {
		if (alert.redirect_url) {
			selectedAlertUrl = alert.redirect_url;
			selectedAlertTitle = alert.query || 'Alert Details';
			showModal = true;
		}
	}

	// Modal state
	let showAnomalyModal = $state(false);
	let selectedAnomalyUrl = $state('');
	let selectedAnomalyTitle = $state('');

	// Function to open the anomaly modal
	function openAnomalyModal(anomaly: { query: string; media_url: string }) {
		selectedAnomalyTitle = anomaly.query;
		selectedAnomalyUrl = anomaly.media_url;
		showAnomalyModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	function closeAnomalyModal() {
		showAnomalyModal = false;
	}

	// Function to fetch alerts data
	async function fetchAlerts() {
		try {
			const res = await fetch('/api/alert-notifications');
			const alertsData = (await res.json()) as {
				alertsData: AlertType[];
				anomaliesData: AnomalyType[];
			};
			console.log('Raw alerts data:', alertsData);
			alerts = alertsData.alertsData;
			anomalies = alertsData.anomaliesData.map((a) => {
				a.createdAt = addHoursToDate(a.createdAt);
				// console.log('Anomaly createdAt:', a.createdAt);
				return a;
			});

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
				{#each combinedData as alert (alert.id)}
					<div
						class="grid cursor-pointer gap-1 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						onclick={() => alert.type === 'alert' ? openAlertModal(alert) : openAnomalyModal(alert)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && (alert.type === 'alert' ? openAlertModal(alert) : openAnomalyModal(alert))}
					>
						<div class="flex items-center justify-between gap-2">
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<!-- <span class={`h-2 w-2 rounded-full ${severityColorMap[alert.severity]}`} /> -->
							<!-- {JSON.stringify(alert)} -->
							<div class="flex grow flex-col gap-2">
								<div
									class="text-md flex w-full items-center justify-between font-medium leading-none"
								>
									<span>
										Detected {alert.query}
									</span>
									<span class="text-sm">
										{timeAgo(alert.time)}
									</span>
								</div>
								<span class="text-xs leading-tight">
									{alert.description}
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

<!-- Anomaly Modal with HTML5 video -->
<SimpleDialog
	bind:open={showAnomalyModal}
	title={selectedAnomalyTitle}
	fullHeight={true}
	fullWidth={true}
	on:close={closeAnomalyModal}
>
	<div class="h-full w-full">
		{#if selectedAnomalyUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video controls class="h-full w-full">
				<source src={'https://29eu3i0mi1l4hg-8000.proxy.runpod.net'+selectedAnomalyUrl.slice(1)} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		{:else}
			<p class="text-center">No video available for this anomaly.</p>
		{/if}
	</div>
</SimpleDialog>
