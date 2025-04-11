<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import {
		Users2Icon,
		BellIcon,
		CameraIcon,
		TrendingUpIcon,
		TrendingDownIcon,
		Loader2
	} from '@lucide/svelte';
	import type { AnalyticsData } from '../types';
	import html2canvas from 'html2canvas';

	type Props = {
		data: AnalyticsData;
	};

	let { data }: Props = $props();
	let isCapturing = false;

	// let attendancePercentage = $derived.by(() => {
	// 	if (data.attendance.prevTotal === 0) return 0;
	// 	return Math.round(
	// 		((data.attendance.total - data.attendance.prevTotal) / data.attendance.prevTotal) * 100
	// 	);
	// });

	// let alertsPercentage = $derived.by(() => {
	// 	if (data.alerts.prevCount === 0) return 0;
	// 	return Math.round(((data.alerts.count - data.alerts.prevCount) / data.alerts.prevCount) * 100);
	// });

	let team1FansPercentage = $derived.by(() => {
		if (data.teams.team1.prevFans === 0) return 0;
		return Math.round(
			((data.teams.team1.fans - data.teams.team1.prevFans) / data.teams.team1.prevFans) * 100
		);
	});

	let team2FansPercentage = $derived.by(() => {
		if (data.teams.team2.prevFans === 0) return 0;
		return Math.round(
			((data.teams.team2.fans - data.teams.team2.prevFans) / data.teams.team2.prevFans) * 100
		);
	});

	// Format number to K format if over 1000
	const formatNumber = (num: number): string => {
		// return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
		return new Intl.NumberFormat('en-IN').format(num);
	};

	// Function to capture and send the stats grid as an image
	const sendStatsImage = async () => {
		if (isCapturing) return; // Prevent multiple clicks
		
		isCapturing = true;
		try {
			// Find the stats grid container
			const contentToCapture = document.querySelector('.main-statcards-grid') as HTMLElement;
			console.log('contentToCapture', contentToCapture);
			if (!contentToCapture) {
				console.error('Stats grid element not found');
				return;
			}

			// Create a temporary container
			const tempContainer = document.createElement('div');
			tempContainer.style.display = 'flex';
			tempContainer.style.flexDirection = 'column';
			tempContainer.style.gap = '8px';
			tempContainer.style.width = '320px';
			tempContainer.style.padding = '12px';
			tempContainer.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
			
			// Add timestamp header
			const timestampHeader = document.createElement('div');
			const currentDate = new Date();
			const formattedDate = currentDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
			const formattedTime = currentDate.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			});
			timestampHeader.innerHTML = `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; text-align: center;">
				Sent at ${formattedDate} ${formattedTime}
			</div>`;
			tempContainer.appendChild(timestampHeader);
			
			// Create a clone of the content
			const clone = contentToCapture.cloneNode(true) as HTMLElement;

			// Modify the clone to stack cards vertically
			clone.style.display = 'flex';
			clone.style.flexDirection = 'column';
			clone.style.gap = '8px';
			clone.style.width = '100%';
			
			// Make each card take full width
			const cards = Array.from(clone.querySelectorAll('.p-4'));
			cards.forEach(card => {
				(card as HTMLElement).style.width = '100%';
			});

			// Append the clone to the temp container
			tempContainer.appendChild(clone);

			// Make the temp container temporarily visible but off-screen
			tempContainer.style.position = 'absolute';
			tempContainer.style.left = '-9999px';
			tempContainer.style.top = '-9999px';
			document.body.appendChild(tempContainer);

			// Remove all buttons and interactive elements
			const buttons = Array.from(tempContainer.querySelectorAll('button'));
			buttons.forEach(button => button.remove());

			// Use html2canvas with the properly prepared container
			const canvas = await html2canvas(tempContainer, {
				backgroundColor: window.getComputedStyle(document.body).backgroundColor,
				scale: 2,
				logging: true,
				useCORS: true,
				allowTaint: true,
				width: 320, // Fixed width for notification
				height: tempContainer.scrollHeight,
				imageTimeout: 0
			});
			console.log("Canvas created successfully");

			// Clean up the temporary elements
			document.body.removeChild(tempContainer);

			console.log("Sending stats image to notification service");
			// Call an endpoint to send this image to notification service
			fetch('/api/send-alerts-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					image: canvas.toDataURL('image/png'),
					title: 'Stadium Stats Overview'
				})
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to send stats image');
				}
				return response.json();
			})
			.then(data => {
				console.log('Stats image sent successfully:', data);
			})
			.catch(error => {
				console.error('Error sending stats image:', error);
			});

		} catch (error) {
			console.error('Error capturing stats grid:', error);
			// Show error notification if desired
			alert('Failed to capture stats image. Please try again.');
		} finally {
			isCapturing = false;
		}
	};
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-4 main-statcards-grid">
	<!-- Attendance Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Total Attendance</span>
				<Users2Icon class="h-4 w-4 text-blue-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{formatNumber(data.attendance.allTotal)}</span>
				
			</div>
			<!-- <span class="text-xs text-muted-foreground">vs. previous match</span> -->
		</div>
	</Card>

	<!-- Alerts Card -->
	<!-- <Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Active Alerts</span>
				<BellIcon class="h-4 w-4 text-rose-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{data.alerts.count}</span>
			</div>
		</div>
	</Card> -->

	<!-- Cameras Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Active Cameras</span>
				<CameraIcon class="h-4 w-4 text-blue-500" />
			</div>
			<div class="flex items-end justify-between">
				<span class="text-2xl font-bold">{data.cameras.active}/{data.cameras.total}</span>
			</div>
		</div>
	</Card>

	<!-- Team 1 Fans Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">{data.teams.team1.name} fans</span>
				<!-- Colored Circle Icon -->
				<div class="h-4 w-4 rounded-full" style="background-color: {data.teams.team1.color};" />
			</div>
			<div class="flex items-end justify-between">
                <!-- Assuming team1Fans exists on the data object.  If not, replace with the correct path -->
				<span class="text-2xl font-bold">{formatNumber(data.teams.team1.allFans)}</span>
                <div
					class={[
						'flex items-center gap-1',
						team1FansPercentage > 0 ? 'text-emerald-500' : 'text-rose-500'
					]}
				>
					{#if team1FansPercentage > 0}
						<TrendingUpIcon class="h-4 w-4" />
						<span class="text-sm">{team1FansPercentage}%</span>
					{:else}
						<TrendingDownIcon class="h-4 w-4" />
						<span class="text-sm">{Math.abs(team1FansPercentage)}%</span>
					{/if}
                </div>
			</div>
            <span class="text-xs text-muted-foreground">vs. past hour</span>
		</div>
	</Card>

	<!-- Team 2 Fans Card -->
	<Card class="p-4">
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">{data.teams.team2.name} fans</span>
				<!-- Colored Circle Icon -->
				<div class="h-4 w-4 rounded-full" style="background-color: {data.teams.team2.color};" />
			</div>
			<div class="flex items-end justify-between">
              <!-- Assuming team2Fans exists on the data object. If not, replace with the correct path -->
				<span class="text-2xl font-bold">{formatNumber(data.teams.team2.allFans)}</span>
                <div
					class={[
						'flex items-center gap-1',
						team2FansPercentage > 0 ? 'text-emerald-500' : 'text-rose-500'
					]}
				>
					{#if team2FansPercentage > 0}
						<TrendingUpIcon class="h-4 w-4" />
						<span class="text-sm">{team2FansPercentage}%</span>
					{:else}
						<TrendingDownIcon class="h-4 w-4" />
						<span class="text-sm">{Math.abs(team2FansPercentage)}%</span>
					{/if}
                </div>
			</div>
            <span class="text-xs text-muted-foreground">vs. past hour</span>
		</div>
	</Card>
</div>

<!-- Change the button position to fixed top right -->
<div class="fixed top-4 right-4 z-10">
	<button 
		onclick={sendStatsImage}
		class="flex items-center justify-center w-10 h-10 text-primary-foreground rounded-md disabled:opacity-50 shadow-md"
		disabled={isCapturing}
		aria-label="Send stats overview"
	>
		{#if isCapturing}
			<Loader2 class="h-5 w-5 animate-spin" />
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send">
				<path d="m22 2-7 20-4-9-9-4Z"/>
				<path d="M22 2 11 13"/>
			</svg>
		{/if}
	</button>
</div>