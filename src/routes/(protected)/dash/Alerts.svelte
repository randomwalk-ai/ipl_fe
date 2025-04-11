<script lang="ts">
	import { BellRingIcon, SettingsIcon, ArrowLeftIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { onMount } from 'svelte'; // Keep necessary import
	import { writable } from 'svelte/store'; // Import writable for state management
	import type {
		Alert as AlertType,
		AnomalyType,
		LoiteringData,
		PoliceMonitoringType
	} from '../types';
	import PoliceMonitoring from './components/police.svelte';
	import html2canvas from 'html2canvas';
	
	// Create writable stores for the data
	const alertsStore = writable<AlertType[]>([]);
	const anomaliesStore = writable<AnomalyType[]>([]);
	const loiteringStore = writable<LoiteringData[]>([]);
	const policeMonitoringStore = writable<PoliceMonitoringType[]>([]);
	
	// Derived store for organized alerts
	let organized_grouped_alerts = writable<any[]>([]);
	
	// Subscribe to alertsStore to update organized_grouped_alerts
	alertsStore.subscribe(alerts => {
		console.log("alets area",alerts);
		if (!alerts || alerts.length === 0) {
			organized_grouped_alerts.set([]);
			return;
		}
		
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
		
		alerts.forEach(alert => {
			const query = alert.query;
			
			if (!queryMap.has(query)) {
				queryMap.set(query, {
					query,
					cameras: new Map()
				});
			}
			
			if (alert.results && alert.results.results) {
				alert.results.results.forEach(result => {
					if (result.camera) {
						const cameraName = result.camera;
						const queryGroup = queryMap.get(query)!;
						
						if (!queryGroup.cameras.has(cameraName)) {
							queryGroup.cameras.set(cameraName, {
								cameraName,
								alerts: []
							});
						}
						
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
		
		const organizedAlerts = Array.from(queryMap.values()).map(queryGroup => ({
			query: queryGroup.query,
			cameras: Array.from(queryGroup.cameras.values())
		}));
		console.log("organizedAlerts",organizedAlerts);
		organized_grouped_alerts.set(organizedAlerts);
		console.log("organized_grouped_alerts",organized_grouped_alerts);
	});
	
	export { alertsStore, anomaliesStore, loiteringStore, policeMonitoringStore };

	const config = [
		{
			mainTitle: 'Banners & Slogans',
			alertTitle: [ 'people holding placards'],
			cardType: 'alert',
			description: 'Detection of unauthorized banners, posters, or slogans in restricted areas.'
		},
		{
			mainTitle: 'Animals',
			alertTitle: ['dogs'],
			cardType: 'alert',
			description: 'Detection of Animals in the stadium areas.'
		},
		{
			mainTitle: 'Loitering',
			alertTitle: ['motorcycle', 'cars'],
			cardType: 'loitering',
			description: 'Detection of suspicious loitering in specific areas.'
		},
		{
			mainTitle: 'No Police',
			cardType: 'police',
			description: 'Detection of places without police presence in the stadium areas.',
			mediaBaseUrl:"https://1020-49-207-184-66.ngrok-free.app/clip"
		},
		{
			mainTitle: 'Prohibited Items',
			description: 'Detection of items not allowed in the premises.',
			cardType: 'hardcoded'
		},
		{
			mainTitle: 'Stampede Risk',
			description: 'Detection of crowd conditions that may lead to stampede.',
			cardType: 'hardcoded'
		},
		{
			mainTitle: 'Fire & Smoke',
			description: 'Detection of fire or smoke in monitored areas.',
			cardType: 'hardcoded'
		},
		{
			mainTitle: 'Suspect Alert',
			description: 'Detection of known suspects or persons of interest.',
			cardType: 'hardcoded'
		},
		{
			mainTitle: 'Unattended Baggage',
			description: 'Detection of bags or packages left unattended.',
			cardType: 'hardcoded'
		},
		{
			mainTitle: 'Weapons',
			description: 'Detection of potential weapons in monitored areas.',
			cardType: 'hardcoded'
		}
	];

	let selectedCardTitle = writable<string | null>(null);
	let activeTab = writable<string>("all");

	async function fetchAllData(mode: string = "all") {
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
				policeMonitoringDataRecent: PoliceMonitoringType[];
			};
			if(mode === "all"){
				alertsStore.set(data.alertsData);
				anomaliesStore.set(data.anomaliesData);
				loiteringStore.set(data.loiteringData);
				policeMonitoringStore.set(data.policeMonitoringData);
			}else{
				alertsStore.set(data.alertsData);
				anomaliesStore.set(data.anomaliesData);
				loiteringStore.set(data.loiteringData);
				policeMonitoringStore.set(data.policeMonitoringDataRecent);
				console.log(data.policeMonitoringDataRecent);
			}
		} catch (error) {
			console.error('Failed to fetch notification data:', error);
		}
	}

	onMount(() => {
		fetchAllData();
	});

	function setTab(tab: string) {
		activeTab.set(tab);
		fetchAllData(tab);
	}

	function captureScreenshot() {
		const cardElement = document.getElementById('alert-card');
		if (cardElement) {
			html2canvas(cardElement).then(canvas => {
				// Create a download link
				const link = document.createElement('a');
				link.download = `alert-${Date.now()}.png`;
				link.href = canvas.toDataURL('image/png');
				link.click();
			});
		}
	}

</script>

<Card id="alert-card" class="flex h-full w-full flex-col dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-start rounded-t-md bg-secondary p-4">
		{#if $selectedCardTitle}
			<button on:click={() => selectedCardTitle.set(null)} class="flex items-center">
				<ArrowLeftIcon class="mr-2" />
				<span class="text-lg font-semibold">Back</span>
			</button>
			<span class="mx-2">|</span>
			<span class="ml-4 text-lg font-semibold">{$selectedCardTitle || ''}</span>
		{:else}
			<BellRingIcon class="mx-2" />
			<span class="mx-2">|</span>
			<h2 class="ml-2 text-lg font-semibold">Alerts</h2>
		{/if}
		<p class="text-lg ml-4">Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
		<div class="ml-auto flex items-center">
			<button 
				on:click={captureScreenshot} 
				class="px-3 py-1 mr-2 bg-blue-600 text-white rounded hover:bg-blue-700">
				Download
			</button>
			<div class="flex">
				<button 
					on:click={() => setTab("all")} 
					class="px-3 py-1 rounded-l {$activeTab === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}">
					All
				</button>
				<button 
					on:click={() => setTab("recent")} 
					class="px-3 py-1 rounded-r {$activeTab === 'recent' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}">
					Recent
				</button>
			</div>
		</div>
	</CardHeader>
	{#if $selectedCardTitle === null}
		<div class="grid grid-cols-1 gap-4 p-4 text-center sm:grid-cols-2 md:grid-cols-3">
			{#each config as card}
				<div class="flex flex-col rounded-lg border p-4 shadow-md cursor-pointer" on:click={() => { console.log(card); selectedCardTitle.set(card.mainTitle ?? null); }}>
					<h2 class="text-lg font-semibold">{card.mainTitle}</h2>
					<p class="text-xs text-gray-500">{card.description}</p>
					<div class="mt-auto text-center">
						{#if card.mainTitle === "No Police"}
							<p class="text-xl">{$policeMonitoringStore.length}</p>
						{:else if card.mainTitle === "Banners & Slogans"}
								<p class="text-xl">
									{JSON.stringify(
										$organized_grouped_alerts
											.filter(alert => {
												const card = config.find(card => card.alertTitle?.includes(alert.query));
												return card && card.cardType === "alert";
											})
											.reduce((acc, curr) => acc + (curr.cameras?.length || 0), 0) || 0
									)}
								</p>
						{:else}
						<p class="text-xl">0</p>
						{/if}
						<p class="text-sm text-gray-500">Total</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		{#if config.find(card => card.mainTitle === $selectedCardTitle)?.cardType === "hardcoded"}
			<div class="flex items-center justify-center h-full">No instances found yet for {$selectedCardTitle}</div>
		{:else if config.find(card => card.mainTitle === $selectedCardTitle)?.cardType === "alert"}
			<div class="flex items-center justify-center h-full">alerts lessgo {$selectedCardTitle}</div>
		{:else if config.find(card => card.mainTitle === $selectedCardTitle)?.cardType === "loitering"}
			<div class="flex items-center justify-center h-full">loitering lessgo {$selectedCardTitle}</div>
		{:else if config.find(card => card.mainTitle === $selectedCardTitle)?.cardType === "police"}
		<PoliceMonitoring title={$selectedCardTitle} data={$policeMonitoringStore} mediaBaseUrl={config.find(card => card.mainTitle === $selectedCardTitle)?.mediaBaseUrl || ""}/>
		{:else}
			<div class="flex items-center justify-center h-full">unknown</div>
		{/if}
	{/if}
</Card>
