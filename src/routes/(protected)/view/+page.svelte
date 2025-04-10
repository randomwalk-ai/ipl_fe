<script lang="ts">
	let selectedUrl = '';
	let isOpen = false;
	let hoveredBlock: any = null;
	let hoverTimeout: any = null;
	let viewMode: 'snap' | 'camera' = 'snap'; // Add view mode toggle state
	let activeBlock: any = null; // Track selected camera for both snap and camera views

	const blockData = [
		{
			name: 'Enterance Gate 1 IN',
			url: 'http://183.82.32.232:5010/#STAND_ENTRY_EXIT_CAMERA_DETAI_C_STAND_LOWER_ENTRY2',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_3.jpg'],
			top: 8050, // Changed from percentage to pixels
			left: 9150 // Changed from percentage to pixels
		},
		{
			name: 'Exit Gate 1 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_4.jpg'],
			top: 8050, // Changed from percentage to pixels
			left: 8750 // Changed from percentage to pixels
		},
		{
			name: 'Queue view Gate 4 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_5.jpg'],
			top: 6090, // Changed from percentage to pixels
			left: 9220 // Changed from percentage to pixels
		},
		{
			name: 'Road view Gate 4 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_6.jpg'],
			top: 6090, // Changed from percentage to pixels
			left: 8850 // Changed from percentage to pixels
		},
		{
			name: 'Parking view Gate 5 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_7.jpg'],
			top: 5280, // Changed from percentage to pixels
			left: 8850 // Changed from percentage to pixels
		},
		{
			name: 'Parking view Gate 6 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_8.jpg'],
			top: 4200, // Changed from percentage to pixels
			left: 9220 // Changed from percentage to pixels
		},
		{
			name: 'Road view Gate 6 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_9.jpg'],
			top: 4200, // Changed from percentage to pixels
			left: 8850 // Changed from percentage to pixels
		},
		{
			name: 'Blurr Gate 8 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_10.jpg'],
			top: 1250, // Changed from percentage to pixels
			left: 7320 // Changed from percentage to pixels
		},
		{
			name: 'Road view Gate 9 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_11.jpg'],
			top: 1250, // Changed from percentage to pixels
			left: 6320 // Changed from percentage to pixels
		},
		{
			name: 'Road view Gate 10 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_11.jpg'],
			top: 1650, // Changed from percentage to pixels
			left: 5380 // Changed from percentage to pixels
		},
		{
			name: 'Parking view Gate 11 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_13.jpg'],
			top: 1250, // Changed from percentage to pixels
			left: 5150 // Changed from percentage to pixels
		},
		{
			name: 'Parking view Gate 13 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_14.jpg'],
			top: 3600, // Changed from percentage to pixels
			left: 2650 // Changed from percentage to pixels
		},
		{
			name: 'Blurr Gate 13 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_15.jpg'],
			top: 3600, // Changed from percentage to pixels
			left: 2250 // Changed from percentage to pixels
		},
		{
			name: 'Entrance view Gate 14 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_16.jpg'],
			top: 4340, // Changed from percentage to pixels
			left: 2650 // Changed from percentage to pixels
		},
		{
			name: 'Queue Gate 14 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: [''],
			top: 4340, // Changed from percentage to pixels
			left: 2250 // Changed from percentage to pixels
		},
		{
			name: 'Blurr Gate 15 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_18.jpg'],
			top: 5170, // Changed from percentage to pixels
			left: 2250 // Changed from percentage to pixels
		},
		{
			name: 'Road and Building view Gate 16 OUT',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_19.jpg'],
			top: 6330, // Changed from percentage to pixels
			left: 2250 // Changed from percentage to pixels
		},
		{
			name: 'Parking view of MCC Gate 17 IN',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_20.jpg'],
			top: 6800, // Changed from percentage to pixels
			left: 2580 // Changed from percentage to pixels
		},
		{
			name: 'Road view of MCC Gate 17',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_21.jpg'],
			top: 6800, // Changed from percentage to pixels
			left: 2220 // Changed from percentage to pixels
		},
		{
			name: 'AG RAM SING GATE 12 camera 1',
			url: 'https://www.youtube.com/embed/7xbKipZXAyM?si=qtZq6FueTn2L3xrn',
			snapshot_urls: ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.2_8.jpg'],
			top: 3150, // Changed from percentage to pixels
			left: 2250 // Changed from percentage to pixels
		}
	];

	const openModal = (url: string) => {
		// Make sure to preserve the fragment identifier in the URL
		selectedUrl = url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
		isOpen = true;
	};

	const closeModal = () => {
		isOpen = false;
		selectedUrl = '';
	};

	// Setting the hovered block with a small intentional delay
	const handleMouseEnter = (block: any) => {
		clearTimeout(hoverTimeout);
		hoveredBlock = block;
	};

	// Adding a small delay before clearing the hover state to prevent flickering
	const handleMouseLeave = () => {
		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			hoveredBlock = null;
		}, 100); // Small delay to prevent flickering
	};

	// Function to handle camera clicks based on view mode
	const handleCameraClick = (block: any) => {
		if (viewMode === 'snap') {
			// In snap mode, set the activeBlock to display snapshots in the panel
			activeBlock = block;
		} else if (viewMode === 'camera') {
			// In camera mode, set activeBlock for camera view
			activeBlock = block;
		}
	};

	// Function to handle the "VIEW" button click in snap mode
	const handleOpenFullVideo = () => {
		if (activeBlock) {
			openModal(activeBlock.url);
		}
	};

	// Function to construct the camera URL with proper fragment handling
	function getCameraUrl(url: string): string {
		// For URLs with hash fragments, we need to ensure they're preserved
		// First add autoplay parameter without disrupting the hash
		let baseUrl = url;
		const hasHashIndex = url.indexOf('#');
		const hashPart = hasHashIndex >= 0 ? url.substring(hasHashIndex) : '';

		if (hasHashIndex >= 0) {
			baseUrl = url.substring(0, hasHashIndex);
		}

		// Add autoplay parameter
		const autoplayParam = 'autoplay=1';
		if (baseUrl.includes('?')) {
			baseUrl += '&' + autoplayParam;
		} else {
			baseUrl += '?' + autoplayParam;
		}

		// Re-add the hash part
		return baseUrl + hashPart;
	}

	// Get the container dimensions to calculate scaling ratio
	let stadiumMapWidth = 0;
	let stadiumMapHeight = 0;
	let mapContainer: HTMLElement;

	// Original dimensions of the map image where the pixel coordinates were calculated
	const originalMapWidth = 12000; // Assuming this is the width of the original map (adjust as needed)
	const originalMapHeight = 9000; // Assuming this is the height of the original map (adjust as needed)

	function updateMapDimensions() {
		if (mapContainer) {
			stadiumMapWidth = mapContainer.clientWidth;
			stadiumMapHeight = mapContainer.clientHeight;
		}
	}

	// Calculate scaled position based on original pixel coordinates
	function calculateScaledPosition(position: number, originalSize: number, newSize: number) {
		return (position / originalSize) * 100; // Convert to percentage for responsive positioning
	}

	// Toggle between snap and camera modes
	function setViewMode(mode: 'snap' | 'camera') {
		viewMode = mode;
		// Keep activeBlock when switching modes for better user experience
	}
	let scale = 1;
	let posX = 0;
	let posY = 0;

	const minScale = 1;
	const maxScale = 4;

	function handleWheel(event) {
		event.preventDefault();
		const rect = event.currentTarget.getBoundingClientRect();

		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		const prevScale = scale;
		const delta = event.deltaY < 0 ? 1 : -1;
		const zoomStep = 0.1;

		scale += delta * zoomStep;
		scale = Math.min(Math.max(scale, minScale), maxScale);

		// Zoom focus around mouse cursor
		const ratio = scale / prevScale;
		posX = mouseX - (mouseX - posX) * ratio;
		posY = mouseY - (mouseY - posY) * ratio;

		// Reset to default when zooming out fully
		if (scale === 1) {
			posX = 0;
			posY = 0;
		}
	}
</script>

<svelte:window on:resize={updateMapDimensions} />
<div class="flex w-full flex-col overflow-auto p-4 sm:p-6 md:p-8 mt-10 lg:p-5">
	<!-- Main content with responsive layout -->
	<div class="flex flex-col gap-4 sm:gap-6 lg:flex-row">
		<!-- Left side: Stadium map with cameras - takes more space on larger screens -->
		<div
			class="lg:w-2.5/5 relative w-full overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
			on:wheel={handleWheel}
		>
			<!-- Scaled content -->
			<div
				style="
                transform: translate({posX}px, {posY}px) scale({scale});
                transform-origin: 0 0;
                width: 100%;
                height: 100%;
                position: relative;
                transition: transform 0.05s linear;
            "
			>
				<img
					src="/stadium2.png"
					alt="Stadium Map"
					class="h-auto w-full invert-0 dark:invert"
					bind:this={mapContainer}
				/>

				<!-- Camera overlays -->
				<div class="pointer-events-none absolute left-0 top-0 h-full w-full">
					{#each blockData as block (block.name)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="pointer-events-auto absolute z-10 cursor-pointer"
							style="
                            top: {calculateScaledPosition(
								block.top,
								originalMapHeight,
								stadiumMapHeight
							)}%;
                            left: {calculateScaledPosition(
								block.left,
								originalMapWidth,
								stadiumMapWidth
							)}%;
                            transform: translate(-50%, -50%);
                        "
							title={block.name}
							on:click={() => handleCameraClick(block)}
							on:mouseenter={() => handleMouseEnter(block)}
							on:mouseleave={handleMouseLeave}
						>
							<img
								src="/camera-lens.png"
								alt={block.name}
								class={`block h-4 w-4 origin-center transform transition-transform duration-200 ease-in-out hover:scale-110 dark:invert ${activeBlock === block ? 'rounded-full ring-2 ring-blue-500' : ''}`}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<!-- Right side: Snapshots container - fixed width on larger screens, full width on smaller -->
		<div
			class="lg:w-2.5/5 flex h-[450px] w-full flex-col rounded-lg p-4 shadow-md sm:h-[500px] lg:h-auto"
		>
			<!-- Add toggle buttons for Snap and Camera -->
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold sm:text-lg">Camera View</h3>
				<div class="flex space-x-2">
					<button
						class={`rounded px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${viewMode === 'snap' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => setViewMode('snap')}
					>
						Snap
					</button>
					<button
						class={`rounded px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${viewMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => setViewMode('camera')}
					>
						Camera
					</button>
				</div>
			</div>

			<div class="relative flex-1 overflow-y-auto">
				<!-- Snapshot view mode -->
				{#if viewMode === 'snap'}
					{#if activeBlock && activeBlock.snapshot_urls && activeBlock.snapshot_urls.length > 0}
						<div class="space-y-4 transition-opacity duration-300">
							<div class="flex items-center justify-between">
								<h4 class="text-sm font-medium text-blue-600 sm:text-base">{activeBlock.name}</h4>
								<!-- <button
									class="rounded bg-blue-500 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700 sm:px-3"
									on:click={handleOpenFullVideo}
								>
									VIEW LIVE
								</button> -->
							</div>
							<div class="grid grid-cols-1 gap-3">
								{#each activeBlock.snapshot_urls as snapshotUrl, index}
									<div class="overflow-hidden rounded-md border border-gray-100">
										<img
											src={snapshotUrl}
											alt={`${activeBlock.name} Snapshot ${index + 1}`}
											class="w-full object-cover transition-all duration-300"
										/>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div
							class="flex h-40 items-center justify-center text-gray-500 transition-opacity duration-300"
						>
							Click on a camera to view snapshots
						</div>
					{/if}
					<!-- Camera view mode -->
				{:else if viewMode === 'camera'}
					{#if activeBlock}
						<div class="flex h-full flex-col">
							<h4 class="mb-3 text-sm font-medium text-blue-600 sm:text-base">
								{activeBlock.name} - Live Feed
							</h4>
							<div class="min-h-0 flex-1 overflow-hidden">
								<div class="-mb-5 -ml-16 h-[calc(100%+40px)] w-[calc(100%+30px)]">
									<iframe
										class="h-full w-full rounded-md border-0"
										src={getCameraUrl(activeBlock.url)}
										title="Camera Feed"
										frameborder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										allowfullscreen
									></iframe>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="flex h-40 items-center justify-center text-gray-500 transition-opacity duration-300"
						>
							Click on a camera to view live feed
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
