<script lang="ts">
	import { getPageState } from '$lib/stores/index.svelte';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Loader2 } from '@lucide/svelte';

	// Page state
	const PageState = getPageState();
	PageState.title = 'Alerts Configuration';

	// Form state
	let query = '';
	let intervalSeconds = 60;
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';

	// Alerts list state
	let alerts = [];
	let isLoading = true;

	// Fetch all alerts
	async function fetchAlerts() {
		isLoading = true;
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
					interval_seconds: intervalSeconds
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
			
			// Refresh alerts list
			await fetchAlerts();
		} catch (error) {
			console.error('Error creating alert:', error);
			errorMessage = error.message || 'Failed to create alert. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// Format date for display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
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
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
		<CardFooter>
			<Button variant="outline" class="ml-auto" on:click={fetchAlerts}>
				Refresh List
			</Button>
		</CardFooter>
	</Card>
</div> 