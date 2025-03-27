<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Loader2, Trash2, PauseCircle } from '@lucide/svelte';
	import SimpleDialog from '../dash/SimpleDialog.svelte';
	import { createEventDispatcher } from 'svelte';

	// Page state
	const PageState = getPageState();
	PageState.title = 'Alerts Configuration';

	// Form state
	let query = '';
	let intervalSeconds = 60;
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';
	let selectedCameras: string[] = [];

	// Camera categories and options
	const cameraCategories = {
		'Entry & Exit': {
			'C Lower': ["CLower12", "CLower30"],
			'C Upper': ["CUpper1", "CUpper2"],
			'D Lower': ["DLower29"],
			'D Upper': ["DUpper14", "DUpper15"],
			'E Lower': ["ELower29"],
			'E Upper': ["EUpper26", "EUpper27"],
			'F Lower': ["FLower7"],
			'F Upper': ["FUpper8", "FUpper9"],
			'G Upper': ["GUpper23", "GUpper24"],
			'H Lower': ["HLower5"],
			'H Upper': ["HUpper1", "HUpper2"],
			'I Upper': ["IUpper8", "IUpper9"],
			'J Lower': ["JLower19"],
			'J Upper': ["JUpper15", "JUpper16"],
			'K Lower': ["KLower19"],
			'K Upper': ["KUpper22", "KUpper23"]
		},
		'Stand': {
			'C Lower': ["CLower9", "CLower10"],
			'C Upper': ["CUpper12", "CUpper13"],
			'D Lower': ["DLower22", "DLower23"],
			'D Upper': ["DUpper24", "DUpper25"],
			'E Lower': ["ELower2", "ELower3"],
			'E Upper': ["EUpper5", "EUpper6"],
			'F Upper': ["FUpper21", "FUpper22"],
			'G Upper': ["GUpper31", "GUpper32"],
			'H Lower': ["HLower5"],
			'H Upper': ["HUpper6", "HUpper7"],
			'I Upper': ["IUpper12", "IUpper13"],
			'J Upper': ["JUpper19", "JUpper20"],
			'K Upper': ["KUpper26", "KUpper27"]
		}
	};
	const frigateBaseUrls = {
		'Stands Entry/Exit': { 'url': 'http://172.16.1.10:8080', 'cameras':[
			"22_StandEntryExitCameraDetaiCStandCamera1upperEntryLeftView",
  "23_StandEntryExitCameraDetaiCStandCamera2upperEntryRightView",
  "24_StandEntryExitCameraDetaiDStandCamera1upperEntryStraightView",
  "25_StandEntryExitCameraDetaiDStandCamera2upperEntryLeftView",
  "26_StandEntryExitCameraDetaiEStandCamera1upperEntryRightView",
  "27_StandEntryExitCameraDetaiEStandCamera2upperEntryLeftView",
  "28_StandEntryExitCameraDetaiFStandCamera1entrance",
  "29_StandEntryExitCameraDetaiFStandCamera2upperEntryLeftView",
  "30_StandEntryExitCameraDetaiFStandCamera3upperEntryLeftView",
  "31_StandEntryExitCameraDetaiFStandCamera4passage1",
  "32_StandEntryExitCameraDetaiGStandCamera1upperEntryRightView",
  "33_StandEntryExitCameraDetaiGStandCamera2upperEntryRightView",
  "34_StandEntryExitCameraDetaiHStandCamera1upperEntryCenterView",
  "35_StandEntryExitCameraDetaiHStandCamera2upperEntryLeftView",
  "36_StandEntryExitCameraDetaiHStandCamera3upperEntryLeftView",
  "37_StandEntryExitCameraDetaiIStandCamera1upperEntryRightView",
  "38_StandEntryExitCameraDetaiIStandCamera2upperEntryRightView",
  "39_StandEntryExitCameraDetaiJStandCamera1upperEntryRightView",
  "40_StandEntryExitCameraDetaiJStandCamera2upperEntryLeftView",
  "41_StandEntryExitCameraDetaiKStandCamera1upperEntryCenterView",
  "42_StandEntryExitCameraDetaiKStandCamera2upperEntryRightView",
  "43_StandEntryExitCameraDetaiKStandCamera3passage1CenterView",
  "44_StandEntryExitCameraDetaiKStandCamera4passage2RightView",
  "45_StandEntryExitCameraDetaiKmkStand1level2StairCaseEntry",
  "46_StandEntryExitCameraDetaiKmkStand2level2StairCaseEntry",
  "47_StandEntryExitCameraDetaiKmkStand3level2StairCaseEntry",
  "48_StandEntryExitCameraDetaiKmkStand4level2StairCaseEntry",
  "49_StandEntryExitCameraDetaiKmkStand5level2LiftEntry",
  "50_StandEntryExitCameraDetaiKmkStand6level2LiftEntry",
  "51_StandEntryExitCameraDetaiKmkStand1level3StairCaseEntry",
  "52_StandEntryExitCameraDetaiKmkStand2level3StairCaseEntry",
  "53_StandEntryExitCameraDetaiKmkStand3level3StairCaseEntry",
  "54_StandEntryExitCameraDetaiKmkStand4level3StairCaseEntry",
  "55_StandEntryExitCameraDetaiKmkStand5level3StairCaseEntry",
  "56_StandEntryExitCameraDetaiKmkStand6level3ServiceLiftEntry",
  "57_StandEntryExitCameraDetaiKmkStand7level3LiftEntry",
  "58_StandEntryExitCameraDetaiKmkStand8level3LiftEntry",

		] },
		'Galleries': { 'url': 'http://172.16.1.11:8080', 'cameras': ["89_GalleryCameraKmkGalleryCamera1level2UpperRightSideShow",
				"90_GalleryCameraKmkGalleryCamera2level2UpperLeftSideShow",
				"91_GalleryCameraKmkGalleryCamera3level2UpperRightSideShow",
				"92_GalleryCameraKmkGalleryCamera4level2UpperRightSideShow",
				"93_GalleryCameraKmkGalleryCamera5level2UpperRightSideShow",
				"94_GalleryCameraKmkGalleryCamera6level2UpperRightSideShow",
				"95_GalleryCameraKmkGalleryCamera7level2UpperRightSideShow",
				"96_GalleryCameraKmkGalleryCamera1level5DownToUpRightSideShow",
				"97_GalleryCameraKmkGalleryCamera2level5DownToUpLeftSideShow",
				"98_GalleryCameraStandC1galleryPtzRightViewCamera",
				"99_GalleryCameraStandC2upperDownToUpRightSideShow",
				"100_GalleryCameraStandC3upperDownToUpLeftSideShow",
				"101_GalleryCameraStandD1galleryPtzLeftViewCamera",
				"102_GalleryCameraStandD2upperDownToUpLeftSideShow",
				"103_GalleryCameraStandD3upperDownToUpRightSideShow",
				"104_GalleryCameraStandE1galleryPtzRightViewCamera",
				"105_GalleryCameraStandE2upperDownToUpLeftSideShow",
				"106_GalleryCameraStandE3upperDownToUpRightSideShow",
				"107_GalleryCameraStandF1upperDownToUpLeftSideShow",
				"108_GalleryCameraStandF2upperDownToUpRightSideShow",
				"109_GalleryCameraStandG1upperDownToUpLeftSideShow",
				"110_GalleryCameraStandG2upperDownToUpRightSideShow",
				"111_GalleryCameraStandH12fGalleryRightView",
				"112_GalleryCameraStandH2lowerLeftView",
				"113_GalleryCameraStandH3upperDownToUpLeftSideShow",
				"114_GalleryCameraStandH4upperDownToUpRightSideShow",
				"115_GalleryCameraStandI1upperDownToUpLeftSideShow",
				"116_GalleryCameraStandI2upperDownToUpRightSideShow",
				"117_GalleryCameraStandI3upperRightView",
				"118_GalleryCameraStandJ1upperDownToUpLeftSideShow",
				"119_GalleryCameraStandJ2upperDownToUpRightSideShow",
				"120_GalleryCameraStandJ3lowerPtzRightView",
				"121_GalleryCameraStandK1upperDownToUpLeftSideShow",
				"122_GalleryCameraStandK2upperDownToUpRightSideShow",
				"123_GalleryCameraStandK3lowerPtzLeftView",
				"124_GalleryCameraStandK4",
		] },
		'Concourse/Food Stalls': { 'url': 'http://172.16.1.12:8080', 'cameras': ["59_ConcourseStandC1venueOffice",
					"60_ConcourseStandF1markerArea",
					"61_ConcourseStandF2pressConferenceRoom1",
					"62_ConcourseStandF3pressConferenceRoom2",
					"63_ConcourseStandF4media1",
					"64_ConcourseStandF5media2",
					"65_ConcourseStandF6media3",
					"66_ConcourseBcr1laptopStorage",
					"67_ConcourseBcr2laptopStorage",
					"68_ConcourseStandH12fGallery",
					"69_ConcourseStandI1passage1",
					"70_ConcourseStandI2passage2",
					"71_ConcourseStandK1passage1",
					"72_ConcourseStandK2passage2",
					"73_FoodStallStandC1lowerPassage1",
					"74_FoodStallStandC2lowerPassage2",
					"75_FoodStallStandC32FDining",
					"76_FoodStallStandD1passage1",
					"77_FoodStallStandD2passage2",
					"78_FoodStallStandD32FDining",
					"79_FoodStallStandE1passage1",
					"80_FoodStallStandE2passage1",
					"81_FoodStallStandE32FDining",
					"82_FoodStallStandE42FLiftButFoodArea",
					"83_FoodStallStandF1passage1",
					"84_FoodStallStandF2level3Dinning",
					"85_FoodStallStandF3level3Dinning",
					"86_FoodStallStandF4level3Dinning",
					"87_FoodStallStandF5level3Dinning",
					"88_FoodStallStandJ1passage2",
		] },
		'Stadium Entry/Exit': { 'url': 'http://172.16.1.14:8080', 'cameras': ["1_GateCameraDetailsParkingGate11parkingView",
					"2_GateCameraDetailsParkingGate22parkingView",
					"3_GateCameraDetailsGate1In3enterance",
					"4_GateCameraDetailsGate1Out4exitView",
					"5_GateCameraDetailsGate4In5queueView",
					"6_GateCameraDetailsGate4Out6roadView",
					"7_GateCameraDetailsGate5Out7parkingView",
					"8_GateCameraDetailsGate6In8parkingView",
					"9_GateCameraDetailsGate6Out9roadView",
					"10_GateCameraDetailsGate8In10blurr",
					"11_GateCameraDetailsGate9In11roadView",
					"12_GateCameraDetailsGate10Out12roadView",
					"13_GateCameraDetailsGate11In13parkingView",
					"14_GateCameraDetailsGate13In14parkingView",
					"15_GateCameraDetailsGate13Out15blurr",
					"16_GateCameraDetailsGate14In16entranceCheckingView",
					"17_GateCameraDetailsGate14Out17queueView",
					"18_GateCameraDetailsGate15Out18blurr",
					"19_GateCameraDetailsGate16Out19roadBuildingView",
					"20_GateCameraDetailsMccGate20parkingView",
					"21_GateCameraDetailsMccGate21roadView",
					"157_RoadSideCameraBellsRoadMccExit",
					"158_RoadSideCameraBellsRoadMccGate",
					"159_RoadSideCameraBellsRoadGate16",
					"160_RoadSideCameraBellsRoadGate15",
					"161_RoadSideCameraBellsRoadCnkRoad1",
					"162_RoadSideCameraBellsRoadCnkRoad1",
					"163_RoadSideCameraAgRamSinghGateIn",
					"164_RoadSideCameraAgRamSinghGateOut",
					"165_RoadSideCameraBellsRoadNearTemple",
					"166_RoadSideCameraBellsRoadJunction1",
					"167_RoadSideCameraBellsRoadJunction2",
					"168_RoadSideCameraBellsRoadJunction3",
					"169_RoadSideCameraWalajaRoadgate11",
					"170_RoadSideCameraGate11In",
					"171_RoadSideCameraPattabiramangateIn",
					"172_RoadSideCameraWalajaRoadgate8",
	] },
		'Wallaja Road Cameras': { 'url': 'http://172.16.1.15:8080', 'cameras': ["125_ExternalCamerasWallaja1",
				"126_ExternalCamerasWallaja2",
				"127_ExternalCamerasWallaja3",
				"128_ExternalCamerasWallaja4",
				"129_ExternalCamerasWallaja5",
				"130_ExternalCamerasWallaja6",
				"131_ExternalCamerasWallaja7",
				"132_ExternalCamerasWallaja8",
				"133_ExternalCamerasWallaja9",
				"134_ExternalCamerasWallaja10",
				"135_ExternalCamerasWallaja11",
				"136_ExternalCamerasWallaja12",
				"137_ExternalCamerasWallaja13",
				"138_ExternalCamerasWallaja14",
				"139_ExternalCamerasWallaja15",
				"140_ExternalCamerasWallaja16",
				"141_ExternalCamerasWallaja17",
				"142_ExternalCamerasWallaja18",
				"143_ExternalCamerasWallaja19",
				"144_ExternalCamerasWallaja20",
				"145_ExternalCamerasWallaja21",
				"146_ExternalCamerasWallaja22",
				"147_ExternalCamerasWallaja23",
				"148_ExternalCamerasWallaja24",
				"149_ExternalCamerasWallaja25",
				"150_ExternalCamerasWallaja26",
				"151_ExternalCamerasWallaja27",
				"152_ExternalCamerasWallaja28",
				"153_ExternalCamerasWallaja29",
				"154_ExternalCamerasWallaja30",
				"155_ExternalCamerasWallaja31",
				"156_ExternalCamerasWallaja32",
				] }
	}
	
	let frigateBaseUrl = frigateBaseUrls['Stands Entry/Exit']['url'];
	let frigateCameras = frigateBaseUrls['Stands Entry/Exit']['cameras'];

	// Toggle camera selection
	function toggleCamera(camera: string) {
		if (selectedCameras.includes(camera)) {
			selectedCameras = selectedCameras.filter(c => c !== camera);
		} else {
			selectedCameras = [...selectedCameras, camera];
		}
	}

	// Toggle all cameras in a category
	function toggleCategory(category: string) {
		const camerasInCategory = flattenedCameras[category];
		
		// Check if all cameras in this category are already selected
		const allSelected = camerasInCategory.every(camera => selectedCameras.includes(camera));
		
		if (allSelected) {
			// If all are selected, deselect them
			selectedCameras = selectedCameras.filter(camera => !camerasInCategory.includes(camera));
		} else {
			// If not all are selected, select all missing ones
			const camerasToAdd = camerasInCategory.filter(camera => !selectedCameras.includes(camera));
			selectedCameras = [...selectedCameras, ...camerasToAdd];
		}
	}

	// Format camera ID for API
	function formatCameraId(camera: string): string {
		// Remove hyphen and space, e.g., "DLower29" becomes "DLower29"
		return camera.replace('-', '').replace(' ', '');
	}

	// Alerts list state
	let alerts = [];
	let isLoading = true;
	let isActionInProgress = false;

	// Confirmation dialog state
	let showDeleteConfirm = false;
	let showStopConfirm = false;
	let selectedAlertId = '';
	let selectedAlertQuery = '';

	// Create a dispatcher for events
	const dispatch = createEventDispatcher();

	// Fetch all alerts
	async function fetchAlerts() {
		isLoading = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/alerts');
			if (!response.ok) {
				throw new Error(`Failed to fetch alerts: ${response.status}`);
			}
			alerts = await response.json();
		} catch (error) {
			console.error('Error fetching alerts:', error);
			errorMessage = 'Failed to load alerts. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Create a new alert
	async function createAlert() {
		if (!query.trim()) {
			errorMessage = 'Search query is required';
			return;
		}

		isSubmitting = true;
		errorMessage = '';
		successMessage = '';

		try {
			const response = await fetch('/api/alerts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: query.trim(),
					interval_seconds: intervalSeconds,
					frigate_base_url: frigateBaseUrl,
					// cameras: selectedCameras.map(formatCameraId)
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || `Failed to create alert: ${response.status}`);
			}

			const data = await response.json();
			successMessage = 'Alert created successfully!';
			
			// Reset form
			query = '';
			intervalSeconds = 60;
			selectedCameras = [];
			
			// Refresh alerts list
			await fetchAlerts();
		} catch (error) {
			console.error('Error creating alert:', error);
			errorMessage = error.message || 'Failed to create alert. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// Stop an alert
	async function stopAlert(id) {
		isActionInProgress = true;
		errorMessage = '';
		successMessage = '';
		
		try {
			const response = await fetch(`/api/alerts/${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ action: 'stop' })
			});

			if (!response.ok) {
				throw new Error(`Failed to stop alert: ${response.status}`);
			}

			successMessage = 'Alert stopped successfully!';
			await fetchAlerts();
		} catch (error) {
			console.error('Error stopping alert:', error);
			errorMessage = 'Failed to stop alert. Please try again.';
		} finally {
			isActionInProgress = false;
			showStopConfirm = false;
		}
	}

	// Delete an alert
	async function deleteAlert(id) {
		isActionInProgress = true;
		errorMessage = '';
		successMessage = '';
		
		try {
			const response = await fetch(`/api/alerts/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error(`Failed to delete alert: ${response.status}`);
			}

			successMessage = 'Alert deleted successfully!';
			await fetchAlerts();
		} catch (error) {
			console.error('Error deleting alert:', error);
			errorMessage = 'Failed to delete alert. Please try again.';
		} finally {
			isActionInProgress = false;
			showDeleteConfirm = false;
		}
	}

	// Open confirmation dialogs
	function confirmStopAlert(alert) {
		selectedAlertId = alert.id;
		selectedAlertQuery = alert.query;
		showStopConfirm = true;
	}

	function confirmDeleteAlert(alert) {
		selectedAlertId = alert.id;
		selectedAlertQuery = alert.query;
		showDeleteConfirm = true;
	}

	// Format date for display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	// Helper function to handle button clicks
	function handleButtonClick(callback) {
		return () => callback();
	}

	onMount(() => {
		fetchAlerts();
	});
</script>

<div class="container mx-auto p-4 space-y-6">
	<!-- Create Alert Form -->
	<Card>
		<CardHeader>
			<CardTitle>Create New Alert</CardTitle>
			<CardDescription>Configure a new alert to monitor for specific content</CardDescription>
		</CardHeader>
		<CardContent>
			<form on:submit|preventDefault={createAlert} class="space-y-4">
				<div class="grid gap-2">
					<Label for="query">Search Query</Label>
					<Input id="query" bind:value={query} placeholder="Enter search terms" required />
				</div>
				<div class="grid gap-2">
					<Label for="interval">Check Interval (seconds)</Label>
					<Input 
						id="interval" 
						type="number" 
						bind:value={intervalSeconds} 
						min="10" 
						max="3600" 
						step="10" 
					/>
					<p class="text-sm text-gray-500">How often to check for new content (default: 60 seconds)</p>
				</div>
				<!-- Dropdown for Frigate Base URL -->
				<div class="grid gap-2">
					<Label for="frigateBaseUrl">Select Frigate Base URL</Label>
					<select id="frigateBaseUrl" bind:value={frigateBaseUrl} class="w-full p-2 border rounded-md">
						{#each Object.keys(frigateBaseUrls) as baseUrl}
							<option value={frigateBaseUrls[baseUrl]}>{baseUrl}</option>
						{/each}
					</select>
				</div>
		
				{#if errorMessage}
					<p class="text-red-500 text-sm">{errorMessage}</p>
				{/if}
				
				{#if successMessage}
					<p class="text-green-500 text-sm">{successMessage}</p>
				{/if}
				
				<Button type="submit" disabled={isSubmitting} class="w-full">
					{#if isSubmitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Creating...
					{:else}
						Create Alert
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>

	<!-- Alerts List -->
	<Card>
		<CardHeader>
			<CardTitle>Configured Alerts</CardTitle>
			<CardDescription>List of all active alert configurations</CardDescription>
		</CardHeader>
		<CardContent>
			{#if isLoading}
				<div class="flex justify-center p-4">
					<Loader2 class="h-8 w-8 animate-spin text-primary" />
				</div>
			{:else if alerts.length === 0}
				<p class="text-center text-gray-500 py-4">No alerts configured yet</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="border-b">
								<th class="text-left p-2">ID</th>
								<th class="text-left p-2">Query</th>
								<th class="text-left p-2">Created</th>
								<th class="text-left p-2">Status</th>
								<th class="text-left p-2">Interval (s)</th>
								<th class="text-left p-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each alerts as alert}
								<tr class="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
									<td class="p-2">{alert.id}</td>
									<td class="p-2">{alert.query}</td>
									<td class="p-2">{formatDate(alert.created_at)}</td>
									<td class="p-2">
										<span class={`px-2 py-1 rounded-full text-xs ${
											alert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
										}`}>
											{alert.status}
										</span>
									</td>
									<td class="p-2">{alert.interval_seconds}</td>
									<td class="p-2">
										<div class="flex space-x-2">
											{#if alert.status === 'active'}
												<button 
													class="flex items-center gap-1 h-8 px-2 text-amber-600 border rounded-md hover:bg-gray-100 disabled:opacity-50"
													on:click={() => confirmStopAlert(alert)}
													disabled={isActionInProgress}
												>
													<PauseCircle class="h-4 w-4" />
													<span>Pause</span>
												</button>
											{/if}
											<button 
												class="flex items-center gap-1 h-8 px-2 text-red-600 border rounded-md hover:bg-gray-100 disabled:opacity-50"
												on:click={() => confirmDeleteAlert(alert)}
												disabled={isActionInProgress}
											>
												<Trash2 class="h-4 w-4" />
												<span>Delete</span>
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
		<CardFooter>
			<button 
				class="ml-auto flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
				on:click={() => fetchAlerts()}
				disabled={isLoading}
			>
				{#if isLoading}
					<Loader2 class="h-4 w-4 animate-spin" />
				{/if}
				<span>Refresh List</span>
			</button>
		</CardFooter>
	</Card>
</div>

<!-- Stop Alert Confirmation Dialog -->
<SimpleDialog bind:open={showStopConfirm} title="Pause Alert" size="sm" fullHeight={false}>
	<div class="py-4">
		<p>Are you sure you want to pause the alert for "{selectedAlertQuery}"?</p>
		<p class="text-sm text-gray-500 mt-2">This will stop the alert from generating new notifications.</p>
		
		<div class="flex justify-end space-x-2 mt-6">
			<button 
				class="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
				on:click={() => showStopConfirm = false}
				disabled={isActionInProgress}
			>
				Cancel
			</button>
			<button 
				class="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
				on:click={() => stopAlert(selectedAlertId)}
				disabled={isActionInProgress}
			>
				{#if isActionInProgress}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Pausing...
				{:else}
					Pause Alert
				{/if}
			</button>
		</div>
	</div>
</SimpleDialog>

<!-- Delete Alert Confirmation Dialog -->
<SimpleDialog bind:open={showDeleteConfirm} title="Delete Alert" size="sm" fullHeight={false}>
	<div class="py-4">
		<p>Are you sure you want to delete the alert for "{selectedAlertQuery}"?</p>
		<p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
		
		<div class="flex justify-end space-x-2 mt-6">
			<button 
				class="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
				on:click={() => showDeleteConfirm = false}
				disabled={isActionInProgress}
			>
				Cancel
			</button>
			<button 
				class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
				on:click={() => deleteAlert(selectedAlertId)}
				disabled={isActionInProgress}
			>
				{#if isActionInProgress}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Deleting...
				{:else}
					Delete Alert
				{/if}
			</button>
		</div>
	</div>
</SimpleDialog> 