<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_RUNPOD_ENDPOINT } from '$env/static/public';

	const PageState = getPageState();
	PageState.title = 'Crowd Monitor';

	// Camera configuration - will be fetched from API
	let cameraConfig = {};

	// Default endpoint if env variable is not set
	const runpodEndpoint = PUBLIC_RUNPOD_ENDPOINT || "https://29eu3i0mi1l4hg-8086.proxy.runpod.net";
	
	// Default IP address
	let ipAddress = runpodEndpoint;
	
	// Search filter
	let searchQuery = "";
	
	// Timestamp for cache busting
	let timestamp = Date.now();
	
	// API call indicator
	let isUpdating = false;
	
	// Update timestamp every 10 seconds to refresh images
	let refreshInterval: ReturnType<typeof setInterval>;
	
	// Fetch camera configuration from API
	async function fetchCameraConfig() {
		try {
			console.log(`${runpodEndpoint}/crowd-hotspot/config`);
			const response = await fetch(`${runpodEndpoint}/crowd-hotspot/config`);
			if (response.ok) {
				cameraConfig = await response.json();
				console.log(cameraConfig);
			} else {
				console.error('Failed to fetch camera configuration:', response.status);
			}
		} catch (error) {
			console.error('Error fetching camera configuration:', error);
		}
	}
	
	onMount(async () => {
		// Fetch camera configuration on initial load
		await fetchCameraConfig();
		
		refreshInterval = setInterval(() => {
			isUpdating = true;
			timestamp = Date.now();
			
			// Reset the updating indicator after a short delay
			setTimeout(() => {
				isUpdating = false;
			}, 1000);
		}, 10000);
	});
	
	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});
	
	// Generate image URLs based on IP address and camera names with timestamp for cache busting
	$: allImages = Object.keys(cameraConfig).map(cameraName => ({
		name: cameraName,
		url: `https://29eu3i0mi1l4hg-8090.proxy.runpod.net/ipl-gate-monitor/data/crowd_hotspot/${cameraName}.jpg`
	}));
	
	// Filter images based on search query
	$: images = allImages.filter(image => 
		image.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
</script>

<div class="container mx-auto p-4">
	<div class="flex flex-col md:flex-row gap-4 mb-4">
		{#if ipAddress === ""}
		<div class="flex-1">
			<label for="ipAddress" class="block text-sm font-medium text-gray-700 mb-1">IP Address:</label>
			<input 
				type="text" 
				id="ipAddress" 
				bind:value={ipAddress} 
				class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
			/>
		</div>
		{/if}
		<div class="flex-1">
			<label for="searchFilter" class="block text-sm font-medium text-gray-700 mb-1">Search Camera:</label>
			<input 
				type="text" 
				id="searchFilter" 
				bind:value={searchQuery} 
				placeholder="Search cameras..." 
				class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
			/>
		</div>
	</div>
	
	<div class="h-[calc(100vh-200px)] overflow-y-auto pr-2">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
			{#each images as image}
				<div class="bg-white rounded-lg shadow-md overflow-hidden relative">
					<div class="aspect-video">
						<img
							src={image.url}
							alt="Crowd monitoring image"
							class="w-full h-full object-cover"
						/>
						<div class="absolute bottom-0 left-0 right-0 bg-transparent text-white text-xs p-1 flex justify-between items-center">
							<span>{image.name}</span>
							{#if isUpdating}
								<span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		{#if images.length === 0}
			<div class="text-center py-8 text-gray-500">
				No cameras found matching your search.
			</div>
		{/if}
	</div>
</div>
