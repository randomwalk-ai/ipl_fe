<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_RUNPOD_ENDPOINT } from '$env/static/public';

	const PageState = getPageState();
	PageState.title = 'Crowd Monitor';

	// Camera configuration - will be fetched from API
	let cameraConfig = {};

	// Default endpoint if env variable is not set
	// const runpodEndpoint = PUBLIC_RUNPOD_ENDPOINT || "https://29eu3i0mi1l4hg-8086.proxy.runpod.net";
	const runpodEndpoint = 'https://29eu3i0mi1l4hg-8086.proxy.runpod.net';

	// Default IP address
	let ipAddress = runpodEndpoint;

	// Search filter
	let searchQuery = '';

	// Timestamp for cache busting
	let timestamp = Date.now();

	// API call indicator
	let isUpdating = false;

	// Full screen modal state
	let showFullScreen = false;
	let fullScreenImage = { name: '', url: '' };

	// Grid full screen state
	let isGridFullScreen = false;

	// Column count based on screen width
	let columnCount = 3;
	let gridContainerWidth = 0;

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

		// Add event listener for escape key to exit full screen
		window.addEventListener('keydown', handleKeyDown);

		// Initial calculation of columns
		updateColumnCount();

		// Add resize listener
		window.addEventListener('resize', updateColumnCount);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('resize', updateColumnCount);
	});

	// Handle keyboard events
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (showFullScreen) closeFullScreen();
			if (isGridFullScreen) toggleGridFullScreen();
		}
	}

	// Update column count based on container width
	function updateColumnCount() {
		const width = window.innerWidth;

		if (width < 640) {
			columnCount = 1;
		} else if (width < 768) {
			columnCount = 2;
		} else if (width < 1024) {
			columnCount = 3;
		} else if (width < 1280) {
			columnCount = 4;
		} else if (width < 1536) {
			columnCount = 5;
		} else {
			columnCount = 6;
		}
	}

	// Toggle grid full screen
	function toggleGridFullScreen() {
		isGridFullScreen = !isGridFullScreen;
		// Force recalculation of columns after toggling
		setTimeout(updateColumnCount, 100);
	}

	// Open full screen modal
	function openFullScreen(image: { name: string; url: string }) {
		fullScreenImage = image;
		showFullScreen = true;
	}

	// Close full screen modal
	function closeFullScreen() {
		showFullScreen = false;
	}

	// Generate image URLs based on IP address and camera names with timestamp for cache busting
	$: allImages = Object.keys(cameraConfig).map((cameraName) => ({
		name: cameraName,
		url: `https://29eu3i0mi1l4hg-8090.proxy.runpod.net/ipl-gate-monitor/data/crowd_hotspot/${cameraName}.jpg`
	}));

	// Filter images based on search query
	$: images = allImages.filter((image) =>
		image.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Dynamically set grid columns class
	$: gridColumnsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columnCount} xl:grid-cols-${columnCount + 1} 2xl:grid-cols-${columnCount + 2}`;
</script>

<div
	class={`transition-all duration-300 ${isGridFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : 'container mx-auto'} p-4`}
>
	<div class="mb-4 flex flex-col items-center gap-4 md:flex-row">
		{#if ipAddress === ''}
			<div class="flex-1">
				<label for="ipAddress" class="mb-1 block text-sm font-medium text-gray-700"
					>IP Address:</label
				>
				<input
					type="text"
					id="ipAddress"
					bind:value={ipAddress}
					class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
		{/if}
		<div class="flex-1">
			<label for="searchFilter" class="mb-1 block text-sm font-medium text-gray-700"
				>Search Camera:</label
			>
			<input
				type="text"
				id="searchFilter"
				bind:value={searchQuery}
				placeholder="Search cameras..."
				class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			/>
		</div>
		<div>
			<button
				on:click={toggleGridFullScreen}
				class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				{#if isGridFullScreen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
					Exit Full Screen
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
						/>
					</svg>
					Full Screen Grid
				{/if}
			</button>
		</div>
	</div>

	<div
		class={`${isGridFullScreen ? 'h-[calc(100vh-100px)]' : 'h-[calc(100vh-200px)]'} overflow-y-auto pr-2`}
		bind:clientWidth={gridContainerWidth}
	>
		<div class={`grid ${gridColumnsClass} auto-rows-fr gap-4`}>
			{#each images as image}
				<div class="group relative overflow-hidden rounded-lg bg-white shadow-md">
					<div class="aspect-video">
						<img src={image.url} alt="Crowd monitoring image" class="h-full w-full object-cover" />
						<div
							class="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black bg-opacity-50 p-2 text-xs text-white"
						>
							<span>{image.name}</span>
							<div class="flex items-center gap-2">
								{#if isUpdating}
									<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
								{/if}
								<button
									on:click={() => openFullScreen(image)}
									class="text-white hover:text-blue-300 focus:outline-none"
									title="View full screen"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if images.length === 0}
			<div class="py-8 text-center text-gray-500">No cameras found matching your search.</div>
		{/if}
	</div>
</div>

<!-- Full Screen Modal for individual image -->
{#if showFullScreen}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90"
		on:click={closeFullScreen}
	>
		<div class="relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col">
			<div class="absolute right-4 top-4 z-10">
				<button
					on:click|stopPropagation={closeFullScreen}
					class="text-white hover:text-gray-300 focus:outline-none"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="flex flex-1 items-center justify-center p-4">
				<img
					src={fullScreenImage.url}
					alt={fullScreenImage.name}
					class="max-h-full max-w-full object-contain"
					on:click|stopPropagation={() => {}}
				/>
			</div>

			<div class="bg-black bg-opacity-70 p-4 text-center text-white">
				<h3 class="text-xl font-semibold">{fullScreenImage.name}</h3>
			</div>
		</div>
	</div>
{/if}
