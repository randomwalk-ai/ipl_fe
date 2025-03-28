<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';

	const PageState = getPageState();
	PageState.title = 'Crowd Monitor';

	// Array of image URLs
	const images = [
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg", 
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg", 
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg",
		"https://as1.ftcdn.net/jpg/10/25/79/94/1000_F_1025799499_K6a7Xpv5mPSdBTwebyUrvlBoZ1CrghoP.jpg"
	];
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-4 gap-4">
		{#each images as image}
			<div class="bg-white rounded-lg shadow-md overflow-hidden">
				<div class="aspect-video">
					<img
						src={image}
						alt="Crowd monitoring image"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="p-3">
					<div class="text-sm font-medium">Camera View</div>
					<div class="text-xs text-gray-500">Live Feed</div>
				</div>
			</div>
		{/each}
	</div>
</div>
