<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { onMount, onDestroy } from 'svelte';

	const PageState = getPageState();
	PageState.title = 'Crowd Monitor';

	// Camera configuration
	const cameraConfig = {
    "125_ExternalCamerasWallaja1": "rtsp://183.82.32.232:8554/125_ExternalCamerasWallaja1",
    "126_ExternalCamerasWallaja2": "rtsp://183.82.32.232:8554/126_ExternalCamerasWallaja2",
    "127_ExternalCamerasWallaja3": "rtsp://183.82.32.232:8554/127_ExternalCamerasWallaja3",
    "128_ExternalCamerasWallaja4": "rtsp://183.82.32.232:8554/128_ExternalCamerasWallaja4",
    "129_ExternalCamerasWallaja5": "rtsp://183.82.32.232:8554/129_ExternalCamerasWallaja5",
    "130_ExternalCamerasWallaja6": "rtsp://183.82.32.232:8554/130_ExternalCamerasWallaja6",
    "131_ExternalCamerasWallaja7": "rtsp://183.82.32.232:8554/131_ExternalCamerasWallaja7",
    "132_ExternalCamerasWallaja8": "rtsp://183.82.32.232:8554/132_ExternalCamerasWallaja8",
    "133_ExternalCamerasWallaja9": "rtsp://183.82.32.232:8554/133_ExternalCamerasWallaja9",
    "134_ExternalCamerasWallaja10": "rtsp://183.82.32.232:8554/134_ExternalCamerasWallaja10",
    "135_ExternalCamerasWallaja11": "rtsp://183.82.32.232:8554/135_ExternalCamerasWallaja11",
    "136_ExternalCamerasWallaja12": "rtsp://183.82.32.232:8554/136_ExternalCamerasWallaja12",
    "137_ExternalCamerasWallaja13": "rtsp://183.82.32.232:8554/137_ExternalCamerasWallaja13",
    "138_ExternalCamerasWallaja14": "rtsp://183.82.32.232:8554/138_ExternalCamerasWallaja14",
    "139_ExternalCamerasWallaja15": "rtsp://183.82.32.232:8554/139_ExternalCamerasWallaja15",
    "140_ExternalCamerasWallaja16": "rtsp://183.82.32.232:8554/140_ExternalCamerasWallaja16",
    "141_ExternalCamerasWallaja17": "rtsp://183.82.32.232:8554/141_ExternalCamerasWallaja17",
    "142_ExternalCamerasWallaja18": "rtsp://183.82.32.232:8554/142_ExternalCamerasWallaja18",
    "143_ExternalCamerasWallaja19": "rtsp://183.82.32.232:8554/143_ExternalCamerasWallaja19",
    "144_ExternalCamerasWallaja20": "rtsp://183.82.32.232:8554/144_ExternalCamerasWallaja20",
    "145_ExternalCamerasWallaja21": "rtsp://183.82.32.232:8554/145_ExternalCamerasWallaja21",
    "146_ExternalCamerasWallaja22": "rtsp://183.82.32.232:8554/146_ExternalCamerasWallaja22",
    "147_ExternalCamerasWallaja23": "rtsp://183.82.32.232:8554/147_ExternalCamerasWallaja23",
    "148_ExternalCamerasWallaja24": "rtsp://183.82.32.232:8554/148_ExternalCamerasWallaja24",
    "149_ExternalCamerasWallaja25": "rtsp://183.82.32.232:8554/149_ExternalCamerasWallaja25",
    "150_ExternalCamerasWallaja26": "rtsp://183.82.32.232:8554/150_ExternalCamerasWallaja26",
    "151_ExternalCamerasWallaja27": "rtsp://183.82.32.232:8554/151_ExternalCamerasWallaja27",
    "152_ExternalCamerasWallaja28": "rtsp://183.82.32.232:8554/152_ExternalCamerasWallaja28",
    "153_ExternalCamerasWallaja29": "rtsp://183.82.32.232:8554/153_ExternalCamerasWallaja29",
    "154_ExternalCamerasWallaja30": "rtsp://183.82.32.232:8554/154_ExternalCamerasWallaja30",
    "155_ExternalCamerasWallaja31": "rtsp://183.82.32.232:8554/155_ExternalCamerasWallaja31",
    "156_ExternalCamerasWallaja32": "rtsp://183.82.32.232:8554/156_ExternalCamerasWallaja32"
};

	// Default IP address
	let ipAddress = "localhost:8090";
	
	// Search filter
	let searchQuery = "";
	
	// Timestamp for cache busting
	let timestamp = Date.now();
	
	// API call indicator
	let isUpdating = false;
	
	// Update timestamp every 10 seconds to refresh images
	let refreshInterval: ReturnType<typeof setInterval>;
	
	onMount(() => {
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
		url: `http://${ipAddress}/crowd_hotspot/${cameraName}.jpg?t=${timestamp}`
	}));
	
	// Filter images based on search query
	$: images = allImages.filter(image => 
		image.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
</script>

<div class="container mx-auto p-4">
	<div class="flex flex-col md:flex-row gap-4 mb-4">
		<div class="flex-1">
			<label for="ipAddress" class="block text-sm font-medium text-gray-700 mb-1">IP Address:</label>
			<input 
				type="text" 
				id="ipAddress" 
				bind:value={ipAddress} 
				class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
			/>
		</div>
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
