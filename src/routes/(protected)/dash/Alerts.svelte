<script lang="ts">
	import { BellRingIcon } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Alert } from '../types';

	type Props = {
		alerts: Alert[];
	};

	let { alerts }: Props = $props();

	// Map severity to color classes
	const severityColorMap: Record<Alert['severity'], string> = {
		high: 'bg-red-500',
		medium: 'bg-orange-500',
		low: 'bg-yellow-500',
		info: 'bg-blue-500'
	};

	function timeAgo(date: Date): string {
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (seconds < 0) {
			return 'in the future'; //Handle dates in the future gracefully.
		}

		if (seconds < 60) {
			return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
		}

		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) {
			return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
		}

		const hours = Math.floor(minutes / 60);
		if (hours < 24) {
			return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		}

		const days = Math.floor(hours / 24);
		if (days < 7) {
			return days === 1 ? '1 day ago' : `${days} days ago`;
		}

		const weeks = Math.floor(days / 7);
		if (weeks < 4) {
			// Roughly 4 weeks in a month
			return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
		}

		const months = Math.floor(days / 30); // Approximate months (consider using date-fns or similar for precise calculations)
		if (months < 12) {
			return months === 1 ? '1 month ago' : `${months} months ago`;
		}

		const years = Math.floor(days / 365); // Approximate years
		return years === 1 ? '1 year ago' : `${years} years ago`;
	}
</script>

<Card class="flex h-full w-full flex-col dark:bg-background dark:text-white">
	<CardHeader class="flex h-14 flex-row items-center justify-between rounded-t-md bg-secondary p-4">
		<div class="flex items-center gap-2">
			<BellRingIcon class="h-5 w-5" />
			<h3 class="font-medium">Recent Alerts</h3>
		</div>
	</CardHeader>
	<ScrollArea class="flex-1">
		<CardContent class="grid gap-4 p-4">
			{#each alerts as alert (alert.id)}
				<div class="grid gap-1">
					<div class="flex items-center gap-2">
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<span class={`h-2 w-2 rounded-full ${severityColorMap[alert.severity]}`} />
						<p class="text-sm font-medium leading-none">
							{alert.title}
						</p>
					</div>
					<div class="flex gap-2 text-xs text-slate-400">
						<span>{alert.location}</span>
						<span>•</span>
						<span>{timeAgo(alert.timestamp)}</span>
					</div>
				</div>
			{/each}
		</CardContent>
	</ScrollArea>
</Card>
