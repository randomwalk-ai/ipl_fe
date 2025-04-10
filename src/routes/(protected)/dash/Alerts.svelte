<script lang="ts">
	import { BellRingIcon, SettingsIcon, BarChartIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert as AlertType, AnomalyType, LoiteringData, PoliceMonitoringType } from '../types';
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition'; // Import a transition
	import SimpleDialog from './SimpleDialog.svelte';
	import { addHoursToDate, parseUtcToIstTime, timeAgo } from '$lib/utils';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import BannersAndSlogans from './BannersAndSlogans.svelte';
	import PoliceMonitoring from './PoliceMonitoring.svelte';

	// Define a unified type for the combined list
	interface CombinedAlertItem {
		id: string; // Ensure unique ID across all types (e.g., prefixing)
		query: string;
		time: string; // ISO string timestamp for sorting
		description: string;
		type: 'alert' | 'anomaly' | 'loitering';
		redirect_url?: string; // URL for alert iframe
		media_url?: string; // Relative path for anomaly/loitering video
		snapshot_filename?: string; // Relative path for loitering snapshot
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
	
	// State for view management
	let showingFilteredView = $state(false);
	let selectedQuery = $state('');
	
	// Time range filter settings
	let showTimeRangeSettings = $state(false);
	let fromDate = $state(new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16)); // Default: 5 minutes ago
	let toDate = $state(new Date().toISOString().slice(0, 16)); // Default: now

	// Analytics view state
	let showingAnalytics = $state(false);
	// banner and slogans config
	const bannerAndSlogansConfig = {
			mainTitle: "Banners & Slogans",
			alertTitle: ["person waving black flag","people holding placards"],
			description: "Detection of unauthorized banners, posters, or slogans in restricted areas."
		}
	const alertsWithThumbnails =[
		{
			mainTitle: "Banners & Slogans",
			alertTitle: ["person waving black flag","people holding placards"],
			description: "Detection of unauthorized banners, posters, or slogans in restricted areas."
		},
		{
			mainTitle: "Animals",
			alertTitle: ["dogs"],
			description: "Detection of Animals in the stadium areas."
		}
	]
	// State for police monitoring view
	let showingPoliceView = $state(false);

	// Additional alert cards
	const additionalAlertCards = [
		{
			mainTitle: "Animals",
			alertTitle: "dogs",
			icon: "PawPrintIcon",
			description: "Detection of animals in restricted areas."
		},
		{
			mainTitle: "Loitering",
			alertTitle: "motorcycle",
			icon: "FootprintsIcon",
			description: "Detection of suspicious loitering in specific areas."
		},
		{
			mainTitle: "Prohibited Items",
			alertTitle: "Prohibited Items",
			icon: "BanIcon",
			description: "Detection of items not allowed in the premises."
		},
		
		{
			mainTitle: "Stampede Risk",
			alertTitle: "stampede risk",
			icon: "UsersIcon",
			description: "Detection of crowd conditions that may lead to stampede."
		},
		{
			mainTitle: "Fire & Smoke",
			alertTitle: "fire & smoke",
			icon: "FlameIcon",
			description: "Detection of fire or smoke in monitored areas."
		},
		{
			mainTitle: "Suspect Alert",
			alertTitle: "suspect",
			icon: "AlertTriangleIcon",
			description: "Detection of known suspects or persons of interest."
		},
		
		{
			mainTitle: "Unattended Baggage",
			alertTitle: "unattended baggage",
			icon: "PackageIcon",
			description: "Detection of bags or packages left unattended."
		},
		{
			mainTitle: "Weapons",
			alertTitle: "weapons",
			icon: "SwordIcon",
			description: "Detection of potential weapons in monitored areas."
		}
	];

	// State for banner alerts view
	let showingBannerAlertsView = $state(false);
	let selectedCamera = $state('');
	let showingBannerQueriesView = $state(false);
	let selectedBannerQuery = $state('');
	
	// Organized alerts grouped by query and camera
	let organized_grouped_alerts = $derived.by(() => {
		if (!alerts) return [];
		
		// Create a map to organize by query
		const queryMap = new Map<string, {
			query: string,
			cameras: Map<string, {
				cameraName: string,
				alerts: Array<{
					redirectURL: string,
					thumbnail: string,
					id: string,
					end_time: string
				}>
			}>
		}>();
		// Process each alert
		alerts.forEach(alert => {
			const query = alert.query;
			
			// Initialize query group if it doesn't exist
			if (!queryMap.has(query)) {
				queryMap.set(query, {
					query,
					cameras: new Map()
				});
			}
			
			// Process each result in the alert
			if (alert.results && alert.results.results) {
				alert.results.results.forEach(result => {
					if (result.camera) {
						const cameraName = result.camera;
						const queryGroup = queryMap.get(query)!;
						
						// Initialize camera group if it doesn't exist
						if (!queryGroup.cameras.has(cameraName)) {
							queryGroup.cameras.set(cameraName, {
								cameraName,
								alerts: []
							});
						}
						
						// Add alert details to camera group
						queryGroup.cameras.get(cameraName)!.alerts.push({
							redirectURL: alert.results.redirect_url || '',
							thumbnail: result.thumbnail || '',
							id: alert.id,
							end_time: alert.createdAt
						});
					}
				});
			}
		});
		// Convert maps to arrays for easier iteration in the template
		return Array.from(queryMap.values()).map(queryGroup => ({
			query: queryGroup.query,
			cameras: Array.from(queryGroup.cameras.values())
		}));
	});
	let policeMonitoring = $state<PoliceMonitoringType[]>([]);
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
			description: `A '${item.label || 'Unknown'}' is loitering ${item.zone ? `` : ''}. ${item.durationSeconds ? `Duration: ${item.durationSeconds}s` : 'Ongoing.'}`,
			type: 'loitering',
			redirect_url: undefined,
			media_url: item.clipFilename || undefined, // Store relative path if available
			snapshot_filename: item.snapshotFilename || undefined,
			cameraName: item.cameraId!
		}));
		// Combine, sort by time (most recent first), and return
		return [...mappedAlerts, ...mappedAnomalies, ...mappedLoitering].sort(
			(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
		);
	});

	// Filtered data based on selected query
	let filteredData = $derived.by(() => {
		if (!showingFilteredView || !selectedQuery) return [];
		return combinedData.filter(item => item.query === selectedQuery);
	});

	// Group data by query with time range filter
	let groupedData = $derived.by(() => {
		const groups = new Map<string, { total: number, recent: number, uniqueCameras: Set<string>, items: CombinedAlertItem[] }>();
		const fromTimestamp = new Date(fromDate).getTime();
		const toTimestamp = new Date(toDate).getTime();
		
		combinedData.forEach(item => {
			if (!groups.has(item.query)) {
				groups.set(item.query, { total: 0, recent: 0, uniqueCameras: new Set(), items: [] });
			}
			
			const group = groups.get(item.query)!;
			group.total++;
			group.items.push(item);
			
			const itemTime = new Date(item.time).getTime();
			if (itemTime >= fromTimestamp && itemTime <= toTimestamp) {
				group.recent++;
				if (item.cameraName) {
					group.uniqueCameras.add(item.cameraName);
				}
			}
		});
		
		return Array.from(groups.entries()).map(([query, data]) => ({
			query,
			total: data.total,
			recent: data.recent,
			uniqueCamerasCount: data.uniqueCameras.size,
			items: data.items
		}));
	});

	// Modal state for Alert iframe
	let showAlertModal = $state(false);
	let selectedAlertUrl = $state('');
	let selectedAlertTitle = $state('');

	// Modal state for Anomaly/Loitering video
	let showMediaModal = $state(false);
	let selectedMediaUrl = $state('');
	let selectedMediaTitle = $state('');

	// Function to toggle time range settings
	function toggleTimeRangeSettings() {
		showTimeRangeSettings = !showTimeRangeSettings;
	}

	// Function to toggle analytics view
	function toggleAnalyticsView() {
		showingAnalytics = !showingAnalytics;
	}

	// Function to apply time range filter
	function applyTimeRangeFilter() {
		// The filter is automatically applied through the reactive $derived.by
		showTimeRangeSettings = false;
	}

	// Function to show filtered view for a specific query
	function showFilteredView(query: string) {
		selectedQuery = query;
		showingFilteredView = true;
	}

	// Function to go back to the grouped view
	function backToGroupedView() {
		showingFilteredView = false;
		selectedQuery = '';
		showingBannerAlertsView = false;
		showingBannerQueriesView = false;
		showingPoliceView = false;
		selectedCamera = '';
		selectedBannerQuery = '';
	}

	// Function to open the appropriate modal
	function openModal(item: CombinedAlertItem) {
		if (item.type === 'alert' && item.redirect_url) {
			selectedAlertUrl = item.redirect_url;
			selectedAlertTitle = item.query || 'Alert Details';
			showAlertModal = true;
		} else if ((item.type === 'anomaly' || item.type === 'loitering') && item.snapshot_filename) {
			// Construct the full media URL here
			let fullUrl = '';
			if (item.snapshot_filename.startsWith('/media/')) {
				// Example adjustment based on common patterns
				fullUrl = MEDIA_BASE_URL + item.snapshot_filename.slice(6); // Adjust slice index if prefix changes
			} else {
				// Fallback or different logic if path is different
				fullUrl = MEDIA_BASE_URL + item.media_url;
			}
			if (item.type === 'loitering') {
				fullUrl = "https://29eu3i0mi1l4hg-8090.proxy.runpod.net/mtqq_handlers/loitering_snapshots/"+item.snapshot_filename;
			}

			selectedMediaUrl = fullUrl;
			selectedMediaTitle =
				item.query || (item.type === 'anomaly' ? 'Anomaly Details' : 'Loitering Details');
			showMediaModal = true;
		} else if (item.type === 'loitering' && !item.media_url) {
			selectedMediaUrl = "https://29eu3i0mi1l4hg-8090.proxy.runpod.net/mtqq_handlers/loitering_snapshots/"+item.snapshot_filename;
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
				policeMonitoringData: PoliceMonitoringType[];
			};
			console.log(data.policeMonitoringData);
			
			policeMonitoring = data.policeMonitoringData ?? [];
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

	// Function to show banner queries view
	function showBannerQueriesView() {
		showingBannerQueriesView = true;
		showingBannerAlertsView = false;
		selectedCamera = '';
	}

	// Function to show banner alerts for a specific camera
	function showBannerAlertsView(camera: string) {
		selectedCamera = camera;
		showingBannerAlertsView = true;
		showingBannerQueriesView = false;
	}
	
	// Function to go back from banner alerts view
	function backFromBannerAlertsView() {
		showingBannerAlertsView = false;
		selectedCamera = '';
	}

	// Function to show alerts for a specific query
	function showBannerQueryAlerts(query: string) {
		selectedBannerQuery = query;
		showingBannerQueriesView = false;
		showingFilteredView = true;
		selectedQuery = query;
	}
	
	// Derived data for banner alerts
	let bannerAlertsData = $derived.by(() => {
		// Filter alerts related to banners and slogans
		const bannerAlerts = combinedData.filter(item => 
			bannerAndSlogansConfig.alertTitle.some(title => 
				item.query.toLowerCase().includes(title.toLowerCase())
			)
		);
		
		// Group by camera
		const cameraGroups = new Map<string, CombinedAlertItem[]>();
		
		bannerAlerts.forEach(alert => {
			if (alert.cameraName) {
				if (!cameraGroups.has(alert.cameraName)) {
					cameraGroups.set(alert.cameraName, []);
				}
				cameraGroups.get(alert.cameraName)!.push(alert);
			}
		});
		
		// Sort alerts within each camera group by time (most recent first)
		cameraGroups.forEach((alerts, camera) => {
			cameraGroups.set(camera, alerts.sort((a, b) => 
				new Date(b.time).getTime() - new Date(a.time).getTime()
			));
		});
		
		return {
			allAlerts: bannerAlerts,
			byCameras: Array.from(cameraGroups.entries()).map(([camera, alerts]) => ({
				camera,
				alerts,
				latestAlert: alerts[0],
				count: alerts.length
			}))
		};
	});

	// Get banner queries from organized_grouped_alerts
	let bannerQueries = $derived.by(() => {
		return organized_grouped_alerts.filter(group => 
			bannerAndSlogansConfig.alertTitle.some(title => 
				group.query.toLowerCase().includes(title.toLowerCase())
			)
		);
	});
	
	// Filtered banner alerts for a specific camera
	let filteredBannerAlerts = $derived.by(() => {
		if (!showingBannerAlertsView || !selectedCamera) return [];
		return bannerAlertsData.allAlerts.filter(item => item.cameraName === selectedCamera);
	});

	// Function to show police monitoring view
	function showPoliceView() {
		showingPoliceView = true;
	}
</script>

<Card class="flex h-full w-full flex-col dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4">
		<div class="flex items-center gap-2">
			{#if showingFilteredView || showingBannerAlertsView || showingBannerQueriesView}
				<button 
					class="flex items-center gap-1 text-sm hover:text-primary" 
					on:click={backToGroupedView}
				>
					<ArrowLeftIcon class="h-4 w-4" />
					<span>Back</span>
				</button>
				<span class="mx-2">|</span>
			{/if}
			<BellRingIcon class="h-5 w-5" />
			<h3 class="font-medium">
				{#if showingFilteredView}
					{selectedQuery} Alerts
				{:else if showingAnalytics}
					Alert Analytics
				{:else if showingBannerQueriesView}
					Banner & Slogan Queries
				{:else if showingBannerAlertsView}
					Banner & Slogan Alerts - {selectedCamera}
				{:else if showingPoliceView}
					No Police Alerts
				{:else}
					Recent Alerts & Events
				{/if}
			</h3>
		</div>
		{#if !showingFilteredView && !showingBannerAlertsView && !showingBannerQueriesView}
			<div class="flex items-center gap-2">
				<button 
					class="flex items-center gap-1 text-sm hover:text-primary" 
					on:click={toggleAnalyticsView}
					aria-label="Analytics view"
				>
					<BarChartIcon class="h-4 w-4" />
				</button>
				<button 
					class="flex items-center gap-1 text-sm hover:text-primary" 
					on:click={toggleTimeRangeSettings}
					aria-label="Time range settings"
				>
					<SettingsIcon class="h-4 w-4" />
				</button>
			</div>
		{/if}
	</CardHeader>
	
	{#if showTimeRangeSettings}
		<div class="bg-secondary/50 p-4 border-b dark:border-gray-700">
			<div class="flex flex-col sm:flex-row gap-4 items-end">
				<div class="flex flex-col gap-1 flex-1">
					<label for="from-date" class="text-sm font-medium">From</label>
					<input 
						id="from-date" 
						type="datetime-local" 
						bind:value={fromDate} 
						class="rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1 flex-1">
					<label for="to-date" class="text-sm font-medium">To</label>
					<input 
						id="to-date" 
						type="datetime-local" 
						bind:value={toDate} 
						class="rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 text-sm"
					/>
				</div>
				<button 
					class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
					on:click={applyTimeRangeFilter}
				>
					Apply
				</button>
			</div>
		</div>
	{/if}
	
	<ScrollArea class="flex-1">
		<CardContent class="p-4">
			{#if showingAnalytics}
				<!-- Analytics View -->
				<div></div>
			{:else if showingFilteredView}
				<!-- Filtered view showing specific alerts -->
				{#if filteredData.length === 0}
					<p class="text-center text-gray-500 dark:text-gray-400">No alerts found for "{selectedQuery}"</p>
				{:else}
					<div class="grid gap-4">
						{#each filteredData as item (item.id)}
							<div
								class="grid cursor-pointer gap-1 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
								role="button"
								tabindex="0"
								on:click={() => openModal(item)}
								on:keydown={(e) => e.key === 'Enter' && openModal(item)}
								in:fly={{ y: 10, duration: 200, delay: 50 }}
								out:fly={{ y: -10, duration: 200 }}
							>
								<div class="flex items-center justify-between gap-2">
									<div class="flex grow flex-col gap-1">
										<div
											class="text-md flex w-full items-center justify-between font-medium leading-none"
										>
											<span class="truncate pr-2">
												{#if item.cameraName}
													at {item.cameraName}
												{:else}
													Alert Details
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
					</div>
				{/if}
			{:else if showingBannerQueriesView || showingBannerAlertsView}
				<!-- Use the new BannersAndSlogans component -->
				<BannersAndSlogans
					{bannerAndSlogansConfig}
					{organized_grouped_alerts}
					{bannerAlertsData}
					{bannerQueries}
					{MEDIA_BASE_URL}
					{filteredBannerAlerts}
					{showingBannerQueriesView}
					{showingBannerAlertsView}
					{selectedCamera}
					{selectedBannerQuery}
					{showBannerQueriesView}
					{showBannerAlertsView}
					{showBannerQueryAlerts}
					{backToGroupedView}
					{openModal}
				/>
			{:else if showingPoliceView}
				<!-- Police Monitoring View -->
				<PoliceMonitoring
					policeMonitoringData={policeMonitoring}
					showingPoliceView={true}
					{showPoliceView}
					backToGroupedView={backToGroupedView}
					MEDIA_BASE_URL={MEDIA_BASE_URL}
				/>
			{:else}
				{#if groupedData.length === 0}
					<p class="text-center text-gray-500 dark:text-gray-400">No recent events</p>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						
						<!-- Banner & Slogans Card -->
						<BannersAndSlogans
							{bannerAndSlogansConfig}
							{organized_grouped_alerts}
							{bannerAlertsData}
							{bannerQueries}
							{MEDIA_BASE_URL}
							{filteredBannerAlerts}
							{showingBannerQueriesView}
							{showingBannerAlertsView}
							{selectedCamera}
							{selectedBannerQuery}
							{showBannerQueriesView}
							{showBannerAlertsView}
							{showBannerQueryAlerts}
							{backToGroupedView}
							{openModal}
						/>
						
						<!-- Police Monitoring Card -->
						<PoliceMonitoring
							policeMonitoringData={policeMonitoring}
							{showingPoliceView}
							{showPoliceView}
							{backToGroupedView}
							MEDIA_BASE_URL={MEDIA_BASE_URL}
						/>
						
						<!-- Additional Alert Cards -->
						{#each additionalAlertCards as card}
							<div
								class="flex flex-col cursor-pointer items-center justify-center rounded-md border p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
								role="button"
								tabindex="0"
								on:click={() => showFilteredView(card.alertTitle)}
								on:keydown={(e) => e.key === 'Enter' && showFilteredView(card.alertTitle)}
								in:fly={{ y: 10, duration: 200, delay: 50 }}
							>
								<h4 class="mb-2 text-lg font-semibold">{card.mainTitle}</h4>
								<div class="mt-auto grid grid-cols-3 gap-2 text-sm items-center justify-center">
									{#if groupedData.find(group => group.query === card.alertTitle)}
										{#each [groupedData.find(group => group.query === card.alertTitle)] as matchedGroup}
											{#if matchedGroup && matchedGroup.recent > 0}
											<div class="flex flex-col items-center justify-center col-span-3">

												<div class="mt-auto grid grid-cols-3 gap-2 text-sm flex-grow">
													<div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800">
														<span class="font-medium">{matchedGroup.total}</span>
														<span class="text-xs text-muted-foreground">Total</span>
													</div>
													<div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800">
														<span class="font-medium">{matchedGroup.recent}</span>
														<span class="text-xs text-muted-foreground">In Range</span>
													</div>
													<div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800">
														<span class="font-medium">{matchedGroup.uniqueCamerasCount}</span>
														<span class="text-xs text-muted-foreground">Cameras</span>
													</div>
												</div>
											</div>
											{:else if matchedGroup}
												<div class="flex flex-col items-center justify-center col-span-3">
														<span class="font-medium text-2xl">{matchedGroup.total}</span>
														<span class="text-xs text-muted-foreground">Total</span>
												</div>
											{/if}
										{/each}
									{:else}
										<div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800 col-span-3">
											<span class="font-medium">0</span>
											<span class="text-xs text-muted-foreground">Total</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
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
			<!-- <video controls autoplay class="max-h-full max-w-full">
				<source src={selectedMediaUrl} type="video/mp4" />
				Your browser does not support the video tag. Try downloading the video.
				<br />
				<a href={selectedMediaUrl} download class="text-blue-400 hover:underline">Download Video</a>
			</video> -->
			<!-- Show image -->
			<img src={selectedMediaUrl} alt="Loitering Snapshot" class="max-h-full max-w-full" />
		{:else}
			<p class="p-4 text-center text-white">No video available for this event.</p>
		{/if}
	</div>
</SimpleDialog>
