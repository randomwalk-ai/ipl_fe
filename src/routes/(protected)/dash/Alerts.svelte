<script lang="ts">
	import { BellRingIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert as AlertType, AnomalyType, LoiteringData } from '../types';
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition'; // Import a transition
	import SimpleDialog from './SimpleDialog.svelte';
	import { addHoursToDate, parseUtcToIstTime, timeAgo } from '$lib/utils';

	// Define a unified type for the combined list
	interface CombinedAlertItem {
		id: string; // Ensure unique ID across all types (e.g., prefixing)
		query: string;
		time: string; // ISO string timestamp for sorting
		description: string;
		type: 'alert' | 'anomaly' | 'loitering';
		redirect_url?: string; // URL for alert iframe
		media_url?: string; // Relative path for anomaly/loitering video
		cameraName?: string; // Optional camera name display
	}

	// Base URL for media files (anomalies, loitering clips) - adjust as needed
	// Assuming the proxy handles the base path
	const MEDIA_BASE_URL = 'https://29eu3i0mi1l4hg-8090.proxy.runpod.net/';

	// State for fetched data
	let alerts: AlertType[] | null = $state(null);
	let anomalies: AnomalyType[] | null = $state(null);
	let loitering: LoiteringData[] | null = $state(null);
	let refreshInterval: ReturnType<typeof setInterval>;

	// Derive combined and sorted data
	let combinedData = $derived.by(() => {
		const mappedAlerts: CombinedAlertItem[] = (alerts ?? []).map((item) => ({
			id: `alert-${item.id}`, // Prefix ID for uniqueness
			query: item.query,
			time: item.createdAt,
			description:
				item.results.results.find((result) => !!result.data.description)?.data.description ||
				'No description available.',
			type: 'alert',
			redirect_url: item.results.redirect_url,
			media_url: undefined, // Alerts use redirect_url
			cameraName: undefined // AlertType doesn't have direct camera info
		}));

		const mappedAnomalies: CombinedAlertItem[] = (anomalies ?? []).map((item) => ({
			id: `anomaly-${item.id}`, // Prefix ID
			query: 'Crowd Anomaly', // Implicit query for anomalies
			time: item.createdAt,
			// Use camera name in description if available
			description: `Detected unusual crowd activity${item.camera ? ` near ${item.camera.name}` : ''}.`,
			type: 'anomaly',
			redirect_url: undefined,
			media_url: item.filePath, // Store the relative path
			cameraName: item.camera?.name
		}));

		const mappedLoitering: CombinedAlertItem[] = (loitering ?? []).map((item) => ({
			id: `loitering-${item.id}`, // Prefix ID
			query: item.label || 'Loitering Detected',
			time: item.timestampEntry, // Use entry time as the event time
			description: `Object '${item.label || 'Unknown'}' detected loitering ${item.zone ? `in zone ${item.zone}` : ''}. ${item.durationSeconds ? `Duration: ${item.durationSeconds}s` : 'Ongoing.'}`,
			type: 'loitering',
			redirect_url: undefined,
			media_url: item.clipFilename || undefined, // Store relative path if available
			cameraName: item.cameraId!
		}));

		// Combine, sort by time (most recent first), and return
		return [...mappedAlerts, ...mappedAnomalies, ...mappedLoitering].sort(
			(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
		);
	});

	// Modal state for Alert iframe
	let showAlertModal = $state(false);
	let selectedAlertUrl = $state('');
	let selectedAlertTitle = $state('');

	// Modal state for Anomaly/Loitering video
	let showMediaModal = $state(false);
	let selectedMediaUrl = $state('');
	let selectedMediaTitle = $state('');

	// Function to open the appropriate modal
	function openModal(item: CombinedAlertItem) {
		if (item.type === 'alert' && item.redirect_url) {
			selectedAlertUrl = item.redirect_url;
			selectedAlertTitle = item.query || 'Alert Details';
			showAlertModal = true;
		} else if ((item.type === 'anomaly' || item.type === 'loitering') && item.media_url) {
			// Construct the full media URL here
			// The slice(6) was specific to the previous anomaly path structure, adjust if needed for both types
			// If media_url is already absolute or needs different prefixing, change this logic.
			// Assuming relative path like '/media/...' for both
			let fullUrl = '';
			if (item.media_url.startsWith('/media/')) {
				// Example adjustment based on common patterns
				fullUrl = MEDIA_BASE_URL + item.media_url.slice(6); // Adjust slice index if prefix changes
			} else {
				// Fallback or different logic if path is different
				fullUrl = MEDIA_BASE_URL + item.media_url;
			}

			selectedMediaUrl = fullUrl;
			selectedMediaTitle =
				item.query || (item.type === 'anomaly' ? 'Anomaly Details' : 'Loitering Details');
			showMediaModal = true;
		} else {
			console.warn('No suitable URL found for item:', item);
			// Optionally show a feedback message to the user
		}
	}

	function closeAlertModal() {
		showAlertModal = false;
	}

	function closeMediaModal() {
		showMediaModal = false;
	}

	// Function to fetch all data types
	async function fetchAllData() {
		try {
			const res = await fetch('/api/alert-notifications');
			if (!res.ok) {
				throw new Error(`API request failed with status ${res.status}`);
			}
			const data = (await res.json()) as {
				alertsData: AlertType[];
				anomaliesData: AnomalyType[];
				loiteringData: LoiteringData[];
			};

			// Process fetched data
			alerts = data.alertsData ?? [];
			anomalies = (data.anomaliesData ?? []).map((a) => ({
				...a,
				createdAt: addHoursToDate(a.createdAt) // Adjust timezone as before
			}));
			loitering = (data.loiteringData ?? []).map((l) => ({
				...l,
				timestampEntry: addHoursToDate(l.timestampEntry), // Adjust relevant timestamps
				timestampExit: l.timestampExit ? addHoursToDate(l.timestampExit) : null,
				updatedAt: l.updatedAt ? addHoursToDate(l.updatedAt) : null,
				insertedAt: l.insertedAt ? addHoursToDate(l.insertedAt) : null
			}));
		} catch (error) {
			console.error('Failed to fetch notification data:', error);
			// Optionally reset data or show error state
			alerts = alerts ?? [];
			anomalies = anomalies ?? [];
			loitering = loitering ?? [];
		}
	}

	onMount(() => {
		fetchAllData();
		refreshInterval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});
</script>

<Card class="flex h-full w-full flex-col dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4">
		<div class="flex items-center gap-2">
			<BellRingIcon class="h-5 w-5" />
			<h3 class="font-medium">Recent Alerts & Events</h3>
		</div>
	</CardHeader>
	<ScrollArea class="flex-1">
		<CardContent class="grid gap-4 p-4">
			{#if combinedData.length === 0}
				<p class="text-center text-gray-500 dark:text-gray-400">No recent events</p>
			{:else}
				{#each combinedData as item (item.id)}
					<div
						class="grid cursor-pointer gap-1 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						role="button"
						tabindex="0"
						onclick={() => openModal(item)}
						onkeydown={(e) => e.key === 'Enter' && openModal(item)}
						in:fly={{ y: 10, duration: 200, delay: 50 }}
						out:fly={{ y: -10, duration: 200 }}
					>
						<div class="flex items-center justify-between gap-2">
							<!-- Maybe add an icon based on type? -->
							<!-- Example: {#if item.type === 'anomaly'} <Icon.../> {/if} -->
							<div class="flex grow flex-col gap-1">
								<div
									class="text-md flex w-full items-center justify-between font-medium leading-none"
								>
									<span class="truncate pr-2">
										Detected {item.query}
										{#if item.cameraName}
											at {item.cameraName}
										{/if}
									</span>
									<span class="flex-shrink-0 text-sm text-muted-foreground">
										{timeAgo(item.time)}
									</span>
								</div>
								<span class="text-xs leading-tight text-muted-foreground">
									{item.description}
								</span>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</CardContent>
	</ScrollArea>
</Card>

<!-- Alert Modal (iframe) -->
<SimpleDialog
	bind:open={showAlertModal}
	title={selectedAlertTitle}
	fullHeight={true}
	fullWidth={true}
	on:close={closeAlertModal}
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
			<p class="p-4 text-center">Content for this alert is not available.</p>
		{/if}
	</div>
</SimpleDialog>

<!-- Anomaly / Loitering Modal (video) -->
<SimpleDialog
	bind:open={showMediaModal}
	title={selectedMediaTitle}
	fullHeight={true}
	fullWidth={true}
	on:close={closeMediaModal}
>
	<div class="flex h-full w-full items-center justify-center bg-black">
		{#if selectedMediaUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video controls autoplay class="max-h-full max-w-full">
				<source src={selectedMediaUrl} type="video/mp4" />
				Your browser does not support the video tag. Try downloading the video.
				<br />
				<a href={selectedMediaUrl} download class="text-blue-400 hover:underline">Download Video</a>
			</video>
		{:else}
			<p class="p-4 text-center text-white">No video available for this event.</p>
		{/if}
	</div>
</SimpleDialog>
